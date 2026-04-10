"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileJson,
  FilePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// ── Types ─────────────────────────────────────────────────────────────────────

type ActionStatus = "open" | "in_progress" | "blocked" | "done" | "cancelled";
type ActionPriority = "critical" | "high" | "medium" | "low";

interface Action {
  id: string;
  title: string;
  source: string | null;
  process_id: string | null;
  expected_effect: string | null;
  owner_name: string | null;
  resources: string | null;
  linked_kpi_text: string | null;
  due_date: string | null;
  status: ActionStatus;
  priority: ActionPriority;
  progress: number;
  notes: string | null;
  created_at: string;
}

interface Process {
  id: string;
  code: string;
  name: string;
}

interface ActionForm {
  title: string;
  source: string;
  owner_name: string;
  process_id: string;
  expected_effect: string;
  resources: string;
  linked_kpi_text: string;
  due_date: string;
  status: ActionStatus;
  priority: ActionPriority;
  progress: number;
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ActionStatus, string> = {
  open: "À lancer",
  in_progress: "En cours",
  blocked: "Bloquée",
  done: "Terminée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<ActionStatus, string> = {
  open: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-400",
};

const PRIORITY_LABELS: Record<ActionPriority, string> = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

const PRIORITY_DOT: Record<ActionPriority, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-slate-300",
};

const TOOL_SLUG = "plan-action-central-ascalis";
const TODAY = new Date().toISOString().split("T")[0];

function isOverdue(a: Action): boolean {
  return (
    !!a.due_date &&
    a.due_date < TODAY &&
    a.status !== "done" &&
    a.status !== "cancelled"
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PlanActionTool() {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ActionStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<ActionPriority | "all">("all");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editAction, setEditAction] = useState<Action | null>(null);

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Non authentifié — veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!member) {
        setError("Workspace introuvable.");
        setLoading(false);
        return;
      }
      setWsId(member.workspace_id);

      // Track tool open event (fire-and-forget)
      supabase.from("tool_events").insert({
        workspace_id: member.workspace_id,
        user_id: user.id,
        tool_slug: TOOL_SLUG,
        event_type: "open",
      });

      await loadData(member.workspace_id);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData(wid: string) {
    setLoading(true);
    const [{ data: actData }, { data: procData }] = await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .eq("workspace_id", wid)
        .order("created_at", { ascending: false }),
      supabase
        .from("processes")
        .select("id, code, name")
        .eq("workspace_id", wid)
        .order("code"),
    ]);
    setActions((actData ?? []) as Action[]);
    setProcesses((procData ?? []) as Process[]);
    setLoading(false);
  }

  function trackEvent(wid: string, uid: string, eventType: string) {
    supabase.from("tool_events").insert({
      workspace_id: wid,
      user_id: uid,
      tool_slug: TOOL_SLUG,
      event_type: eventType,
    });
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function handleSave(form: ActionForm) {
    if (!wsId || !userId) return;
    const payload = {
      title: form.title.trim(),
      source: form.source.trim() || null,
      owner_name: form.owner_name.trim() || null,
      process_id: form.process_id || null,
      expected_effect: form.expected_effect.trim() || null,
      resources: form.resources.trim() || null,
      linked_kpi_text: form.linked_kpi_text.trim() || null,
      due_date: form.due_date || null,
      status: form.status,
      priority: form.priority,
      progress: Number(form.progress),
      notes: form.notes.trim() || null,
    };

    if (editAction) {
      const { error: err } = await supabase
        .from("actions")
        .update(payload)
        .eq("id", editAction.id);
      if (err) {
        alert("Erreur lors de la mise à jour : " + err.message);
        return;
      }
    } else {
      const { error: err } = await supabase.from("actions").insert({
        workspace_id: wsId,
        created_by: userId,
        ...payload,
      });
      if (err) {
        alert("Erreur lors de la création : " + err.message);
        return;
      }
      trackEvent(wsId, userId, "create");
    }

    setModalOpen(false);
    setEditAction(null);
    await loadData(wsId);
  }

  async function handleQuickStatus(id: string, status: ActionStatus) {
    // Optimistic update
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const { error: err } = await supabase
      .from("actions")
      .update({ status })
      .eq("id", id);
    if (err && wsId) {
      await loadData(wsId);
    }
  }

  async function handleDelete(id: string) {
    if (!wsId || !userId) return;
    if (!confirm("Supprimer cette action ? Cette opération est irréversible.")) return;
    setActions((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("actions").delete().eq("id", id);
    trackEvent(wsId, userId, "delete");
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function exportCSV() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_csv");
    const procMap = new Map(processes.map((p) => [p.id, p.code]));
    const header =
      "Titre;Pilote;Source;Processus;Effet attendu;KPI lié;Ressources;Statut;Priorité;Avancement;Échéance;Notes";
    const rows = actions.map((a) =>
      [
        a.title,
        a.owner_name ?? "",
        a.source ?? "",
        a.process_id ? (procMap.get(a.process_id) ?? "") : "",
        a.expected_effect ?? "",
        a.linked_kpi_text ?? "",
        a.resources ?? "",
        STATUS_LABELS[a.status],
        PRIORITY_LABELS[a.priority],
        String(a.progress),
        a.due_date ?? "",
        a.notes ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";")
    );
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    triggerDownload(blob, `ASCALIS_PlanAction_${TODAY}.csv`);
  }

  function exportJSON() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_json");
    const blob = new Blob([JSON.stringify(actions, null, 2)], {
      type: "application/json",
    });
    triggerDownload(blob, `ASCALIS_PlanAction_${TODAY}.json`);
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const filtered = actions.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterPriority !== "all" && a.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.owner_name ?? "").toLowerCase().includes(q) ||
        (a.source ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: actions.length,
    inProgress: actions.filter((a) => a.status === "in_progress").length,
    overdue: actions.filter(isOverdue).length,
    done: actions.filter((a) => a.status === "done").length,
    donePercent:
      actions.length > 0
        ? Math.round(
            (actions.filter((a) => a.status === "done").length /
              actions.length) *
              100
          )
        : 0,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          color="text-[#0F1A2E]"
        />
        <StatCard
          label="En cours"
          value={stats.inProgress}
          color="text-blue-600"
        />
        <StatCard
          label="En retard"
          value={stats.overdue}
          color={stats.overdue > 0 ? "text-red-600" : "text-slate-300"}
        />
        <StatCard
          label="Terminées"
          value={`${stats.donePercent}%`}
          color="text-emerald-600"
          subtitle={`${stats.done} action${stats.done !== 1 ? "s" : ""}`}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[180px] flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as ActionStatus | "all")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none"
        >
          <option value="all">Tous statuts</option>
          {(Object.keys(STATUS_LABELS) as ActionStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) =>
            setFilterPriority(e.target.value as ActionPriority | "all")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none"
        >
          <option value="all">Toutes priorités</option>
          {(Object.keys(PRIORITY_LABELS) as ActionPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={exportCSV}
            title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en CSV"
          >
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={exportJSON}
            title="Export JSON"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en JSON"
          >
            <FileJson className="size-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              setEditAction(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nouvelle action
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            className="size-8 animate-spin text-[#B07642]"
            aria-label="Chargement"
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <FilePlus
            className="mx-auto mb-3 size-10 text-slate-300"
            aria-hidden="true"
          />
          <p className="font-heading text-sm text-slate-500">
            {actions.length === 0
              ? "Aucune action — créez la première"
              : "Aucun résultat pour ces filtres"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">
                    Priorité
                  </th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">
                    Titre
                  </th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">
                    Pilote
                  </th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 lg:table-cell">
                    Processus
                  </th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">
                    Statut
                  </th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">
                    Avancement
                  </th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">
                    Échéance
                  </th>
                  <th className="py-3 pl-2 pr-4 text-right font-heading text-xs uppercase tracking-wider text-slate-400">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((action) => (
                  <ActionRow
                    key={action.id}
                    action={action}
                    processes={processes}
                    onEdit={() => {
                      setEditAction(action);
                      setModalOpen(true);
                    }}
                    onDelete={() => handleDelete(action.id)}
                    onQuickStatus={(s) => handleQuickStatus(action.id, s)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {filtered.length} action{filtered.length !== 1 ? "s" : ""} affichée
            {filtered.length !== 1 ? "s" : ""}
            {filtered.length !== actions.length && ` sur ${actions.length}`}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <ActionModal
          action={editAction}
          processes={processes}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditAction(null);
          }}
        />
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className={`font-display text-3xl ${color}`}>{value}</p>
      <p className="mt-1 font-heading text-xs text-slate-500">{label}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

// ── ActionRow ─────────────────────────────────────────────────────────────────

function ActionRow({
  action,
  processes,
  onEdit,
  onDelete,
  onQuickStatus,
}: {
  action: Action;
  processes: Process[];
  onEdit: () => void;
  onDelete: () => void;
  onQuickStatus: (s: ActionStatus) => void;
}) {
  const procMap = new Map(processes.map((p) => [p.id, p.code]));
  const overdue = isOverdue(action);

  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="py-3 pl-4 pr-2">
        <div
          className={`size-2.5 rounded-full ${PRIORITY_DOT[action.priority]}`}
          title={PRIORITY_LABELS[action.priority]}
          aria-label={`Priorité : ${PRIORITY_LABELS[action.priority]}`}
        />
      </td>
      <td className="max-w-[180px] py-3 px-2 sm:max-w-[240px]">
        <p
          className="truncate font-heading text-sm font-medium text-[#0F1A2E]"
          title={action.title}
        >
          {action.title}
        </p>
        {action.source && (
          <p className="truncate text-xs text-slate-400">{action.source}</p>
        )}
      </td>
      <td className="hidden py-3 px-2 md:table-cell">
        <span className="text-sm text-slate-600">
          {action.owner_name ?? "—"}
        </span>
      </td>
      <td className="hidden py-3 px-2 lg:table-cell">
        <span className="font-mono text-xs text-slate-500">
          {action.process_id
            ? (procMap.get(action.process_id) ?? "—")
            : "—"}
        </span>
      </td>
      <td className="py-3 px-2">
        <select
          value={action.status}
          onChange={(e) => onQuickStatus(e.target.value as ActionStatus)}
          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-heading text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B07642]/30 ${STATUS_COLORS[action.status]}`}
          aria-label="Changer le statut"
        >
          {(Object.keys(STATUS_LABELS) as ActionStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="hidden py-3 px-2 sm:table-cell">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#B07642] transition-all"
              style={{ width: `${action.progress}%` }}
            />
          </div>
          <span className="tabular-nums text-xs text-slate-500">
            {action.progress}%
          </span>
        </div>
      </td>
      <td className="hidden py-3 px-2 sm:table-cell">
        <span
          className={`font-heading text-xs ${
            overdue ? "font-semibold text-red-600" : "text-slate-500"
          }`}
        >
          {formatDate(action.due_date)}
          {overdue && (
            <span className="ml-1" aria-label="En retard">
              ⚠
            </span>
          )}
        </span>
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0F1A2E]"
            aria-label="Modifier l'action"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={onDelete}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Supprimer l'action"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── ActionModal ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20";

function ActionModal({
  action,
  processes,
  onSave,
  onClose,
}: {
  action: Action | null;
  processes: Process[];
  onSave: (form: ActionForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ActionForm>({
    title: action?.title ?? "",
    source: action?.source ?? "",
    owner_name: action?.owner_name ?? "",
    process_id: action?.process_id ?? "",
    expected_effect: action?.expected_effect ?? "",
    resources: action?.resources ?? "",
    linked_kpi_text: action?.linked_kpi_text ?? "",
    due_date: action?.due_date ?? "",
    status: action?.status ?? "open",
    priority: action?.priority ?? "medium",
    progress: action?.progress ?? 0,
    notes: action?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ActionForm>(key: K, val: ActionForm[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    // onSave closes the modal on success; setSaving(false) only runs on error
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[#0F1A2E]">
            {action ? "Modifier l'action" : "Nouvelle action"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fermer"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label
              htmlFor="act-title"
              className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
            >
              Titre <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="act-title"
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="Intitulé de l'action"
              className={inputCls}
            />
          </div>

          {/* Row 1 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="act-owner"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                Pilote
              </label>
              <input
                id="act-owner"
                type="text"
                value={form.owner_name}
                onChange={(e) => set("owner_name", e.target.value)}
                placeholder="Nom du responsable"
                className={inputCls}
              />
            </div>
            <div>
              <label
                htmlFor="act-source"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                Source
              </label>
              <input
                id="act-source"
                type="text"
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
                placeholder="Audit, NC client, Revue…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="act-process"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                Processus
              </label>
              <select
                id="act-process"
                value={form.process_id}
                onChange={(e) => set("process_id", e.target.value)}
                className={inputCls}
              >
                <option value="">— Aucun —</option>
                {processes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="act-due"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                Échéance
              </label>
              <input
                id="act-due"
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="act-status"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                Statut
              </label>
              <select
                id="act-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value as ActionStatus)}
                className={inputCls}
              >
                {(Object.keys(STATUS_LABELS) as ActionStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="act-priority"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                Priorité
              </label>
              <select
                id="act-priority"
                value={form.priority}
                onChange={(e) =>
                  set("priority", e.target.value as ActionPriority)
                }
                className={inputCls}
              >
                {(Object.keys(PRIORITY_LABELS) as ActionPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress */}
          <div>
            <label
              htmlFor="act-progress"
              className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
            >
              Avancement — {form.progress}%
            </label>
            <input
              id="act-progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={form.progress}
              onChange={(e) => set("progress", Number(e.target.value))}
              className="w-full accent-[#B07642]"
            />
          </div>

          {/* Effet attendu */}
          <div>
            <label
              htmlFor="act-effect"
              className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
            >
              Effet attendu
            </label>
            <input
              id="act-effect"
              type="text"
              value={form.expected_effect}
              onChange={(e) => set("expected_effect", e.target.value)}
              placeholder="Ex : Réduire les NC à réception de 30%"
              className={inputCls}
            />
          </div>

          {/* Row 4 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="act-kpi"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                KPI lié
              </label>
              <input
                id="act-kpi"
                type="text"
                value={form.linked_kpi_text}
                onChange={(e) => set("linked_kpi_text", e.target.value)}
                placeholder="Ex : Taux NC < 2%"
                className={inputCls}
              />
            </div>
            <div>
              <label
                htmlFor="act-resources"
                className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
              >
                Ressources
              </label>
              <input
                id="act-resources"
                type="text"
                value={form.resources}
                onChange={(e) => set("resources", e.target.value)}
                placeholder="Budget, humain, matériel…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="act-notes"
              className="mb-1.5 block font-heading text-xs font-medium text-slate-700"
            >
              Notes
            </label>
            <textarea
              id="act-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-heading text-sm text-slate-600 transition hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-5 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40"
            >
              {saving && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {action ? "Enregistrer" : "Créer l'action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
