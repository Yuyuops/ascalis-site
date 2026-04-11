"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
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

type Status8d = "open" | "in_progress" | "closed";

interface Issue8d {
  id: string;
  reference: string | null;
  title: string;
  source: string | null;
  process_id: string | null;
  status: Status8d;
  d1_team: string | null;
  d2_description: string | null;
  d2_detected_at: string | null;
  d2_scope: string | null;
  d3_containment: string | null;
  d3_done_at: string | null;
  d4_root_causes: string | null;
  d4_method: string | null;
  d5_actions: string | null;
  d5_planned_at: string | null;
  d6_validation: string | null;
  d6_done_at: string | null;
  d7_prevention: string | null;
  d8_closure: string | null;
  d8_closed_at: string | null;
  created_at: string;
}

interface Process {
  id: string;
  code: string;
  name: string;
}

type IssueForm = Omit<Issue8d, "id" | "created_at">;

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<Status8d, string> = {
  open:        "À traiter",
  in_progress: "En cours",
  closed:      "Clôturée",
};
const STATUS_COLORS: Record<Status8d, string> = {
  open:        "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  closed:      "bg-emerald-100 text-emerald-700",
};

const TOOL_SLUG = "fiche-8d";
const TODAY = new Date().toISOString().split("T")[0];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function emptyForm(): IssueForm {
  return {
    workspace_id: "",
    reference: "", title: "", source: "", process_id: "",
    status: "open",
    d1_team: "",
    d2_description: "", d2_detected_at: "", d2_scope: "",
    d3_containment: "", d3_done_at: "",
    d4_root_causes: "", d4_method: "",
    d5_actions: "", d5_planned_at: "",
    d6_validation: "", d6_done_at: "",
    d7_prevention: "",
    d8_closure: "", d8_closed_at: "",
    created_by: null,
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Fiche8dTool() {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId]         = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(null);
  const [issues, setIssues]     = useState<Issue8d[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<Status8d | "all">("all");

  const [modalOpen, setModalOpen]   = useState(false);
  const [editIssue, setEditIssue]   = useState<Issue8d | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Non authentifié."); setLoading(false); return; }
      setUserId(user.id);
      const { data: member } = await supabase
        .from("workspace_members").select("workspace_id")
        .eq("user_id", user.id).limit(1).single();
      if (!member) { setError("Workspace introuvable."); setLoading(false); return; }
      setWsId(member.workspace_id);
      supabase.from("tool_events").insert({
        workspace_id: member.workspace_id, user_id: user.id,
        tool_slug: TOOL_SLUG, event_type: "open",
      });
      await loadData(member.workspace_id);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData(wid: string) {
    setLoading(true);
    const [{ data: issData }, { data: procData }] = await Promise.all([
      supabase.from("issues_8d").select("*").eq("workspace_id", wid).order("created_at", { ascending: false }),
      supabase.from("processes").select("id, code, name").eq("workspace_id", wid).order("code"),
    ]);
    setIssues((issData ?? []) as Issue8d[]);
    setProcesses((procData ?? []) as Process[]);
    setLoading(false);
  }

  function trackEvent(wid: string, uid: string, type: string) {
    supabase.from("tool_events").insert({
      workspace_id: wid, user_id: uid, tool_slug: TOOL_SLUG, event_type: type,
    });
  }

  async function handleSave(form: IssueForm) {
    if (!wsId || !userId) return;
    const payload = {
      ...form,
      reference:    form.reference?.trim()    || null,
      title:        form.title.trim(),
      source:       form.source?.trim()       || null,
      process_id:   form.process_id           || null,
      d1_team:      form.d1_team?.trim()      || null,
      d2_description: form.d2_description?.trim() || null,
      d2_detected_at: form.d2_detected_at    || null,
      d2_scope:     form.d2_scope?.trim()     || null,
      d3_containment: form.d3_containment?.trim() || null,
      d3_done_at:   form.d3_done_at           || null,
      d4_root_causes: form.d4_root_causes?.trim() || null,
      d4_method:    form.d4_method?.trim()    || null,
      d5_actions:   form.d5_actions?.trim()   || null,
      d5_planned_at: form.d5_planned_at       || null,
      d6_validation: form.d6_validation?.trim() || null,
      d6_done_at:   form.d6_done_at           || null,
      d7_prevention: form.d7_prevention?.trim() || null,
      d8_closure:   form.d8_closure?.trim()   || null,
      d8_closed_at: form.d8_closed_at         || null,
    };

    if (editIssue) {
      const { workspace_id: _w, created_by: _c, ...update } = payload;
      const { error: err } = await supabase.from("issues_8d").update(update).eq("id", editIssue.id);
      if (err) { alert("Erreur : " + err.message); return; }
    } else {
      const { error: err } = await supabase.from("issues_8d").insert({
        workspace_id: wsId, created_by: userId, ...payload,
      });
      if (err) { alert("Erreur : " + err.message); return; }
      trackEvent(wsId, userId, "create");
    }
    setModalOpen(false);
    setEditIssue(null);
    await loadData(wsId);
  }

  async function handleQuickStatus(id: string, status: Status8d) {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    const { error: err } = await supabase.from("issues_8d").update({ status }).eq("id", id);
    if (err && wsId) await loadData(wsId);
  }

  async function handleDelete(id: string) {
    if (!wsId || !userId) return;
    if (!confirm("Supprimer cette fiche 8D ?")) return;
    setIssues(prev => prev.filter(i => i.id !== id));
    await supabase.from("issues_8d").delete().eq("id", id);
    trackEvent(wsId, userId, "delete");
  }

  function exportCSV() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_csv");
    const procMap = new Map(processes.map(p => [p.id, p.code]));
    const header = "Référence;Titre;Source;Processus;Statut;D1 Équipe;D2 Problème;D3 Containment;D4 Causes;D5 Actions;D6 Validation;D7 Prévention;D8 Clôture";
    const rows = issues.map(i => [
      i.reference ?? "", i.title, i.source ?? "",
      i.process_id ? (procMap.get(i.process_id) ?? "") : "",
      STATUS_LABELS[i.status],
      i.d1_team ?? "", i.d2_description ?? "", i.d3_containment ?? "",
      i.d4_root_causes ?? "", i.d5_actions ?? "", i.d6_validation ?? "",
      i.d7_prevention ?? "", i.d8_closure ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ASCALIS_8D_${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const procMap = new Map(processes.map(p => [p.id, p]));

  const filtered = issues.filter(i => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        (i.reference ?? "").toLowerCase().includes(q) ||
        (i.source ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total:      issues.length,
    open:       issues.filter(i => i.status === "open").length,
    inProgress: issues.filter(i => i.status === "in_progress").length,
    closed:     issues.filter(i => i.status === "closed").length,
  };

  if (error) return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> {error}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total 8D" value={stats.total} color="text-[#0F1A2E]" />
        <StatCard label="À traiter" value={stats.open} color={stats.open > 0 ? "text-slate-700" : "text-slate-300"} />
        <StatCard label="En cours" value={stats.inProgress} color="text-blue-600" />
        <StatCard label="Clôturées" value={stats.closed} color="text-emerald-600" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status8d | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Tous statuts</option>
          {(Object.keys(STATUS_LABELS) as Status8d[]).map(s =>
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          )}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en CSV">
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => { setEditIssue(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]">
            <Plus className="size-4" aria-hidden="true" />
            Nouvelle fiche 8D
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-[#B07642]" aria-label="Chargement" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <FilePlus className="mx-auto mb-3 size-10 text-slate-300" aria-hidden="true" />
          <p className="font-heading text-sm text-slate-500">
            {issues.length === 0 ? "Aucune fiche 8D — créez la première" : "Aucun résultat"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Réf.</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Titre</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Source</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Processus</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 lg:table-cell">Créée le</th>
                  <th className="py-3 pl-2 pr-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(issue => {
                  const proc = issue.process_id ? procMap.get(issue.process_id) : null;
                  return (
                    <tr key={issue.id} className="transition-colors hover:bg-slate-50">
                      <td className="py-3 pl-4 pr-2">
                        <select
                          value={issue.status}
                          onChange={e => handleQuickStatus(issue.id, e.target.value as Status8d)}
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-heading text-xs font-medium focus:outline-none ${STATUS_COLORS[issue.status]}`}
                          aria-label="Changer le statut"
                        >
                          {(Object.keys(STATUS_LABELS) as Status8d[]).map(s =>
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          )}
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-mono text-xs text-slate-500">{issue.reference ?? "—"}</span>
                      </td>
                      <td className="max-w-[180px] py-3 px-2">
                        <p className="truncate font-heading text-sm font-medium text-[#0F1A2E]" title={issue.title}>{issue.title}</p>
                      </td>
                      <td className="hidden py-3 px-2 sm:table-cell">
                        <span className="text-xs text-slate-500">{issue.source ?? "—"}</span>
                      </td>
                      <td className="hidden py-3 px-2 md:table-cell">
                        <span className="font-mono text-xs text-slate-500">
                          {proc ? proc.code : "—"}
                        </span>
                      </td>
                      <td className="hidden py-3 px-2 lg:table-cell">
                        <span className="text-xs text-slate-500">{formatDate(issue.created_at.split("T")[0])}</span>
                      </td>
                      <td className="py-3 pl-2 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditIssue(issue); setModalOpen(true); }}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0F1A2E]"
                            aria-label="Ouvrir la fiche 8D">
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>
                          <button onClick={() => handleDelete(issue.id)}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Supprimer">
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {filtered.length} fiche{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== issues.length && ` sur ${issues.length}`}
          </div>
        </div>
      )}

      {modalOpen && (
        <Issue8dModal
          issue={editIssue}
          processes={processes}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditIssue(null); }}
        />
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className={`font-display text-3xl ${color}`}>{value}</p>
      <p className="mt-1 font-heading text-xs text-slate-500">{label}</p>
    </div>
  );
}

// ── Accordion Section ─────────────────────────────────────────────────────────

function AccordionSection({
  label, badge, children, defaultOpen = false,
}: {
  label: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {badge && (
            <span className="rounded-md bg-[#B07642]/10 px-2 py-0.5 font-heading text-xs font-semibold text-[#B07642]">
              {badge}
            </span>
          )}
          <span className="font-heading text-sm font-medium text-[#0F1A2E]">{label}</span>
        </div>
        {open
          ? <ChevronDown className="size-4 text-slate-400" aria-hidden="true" />
          : <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
        }
      </button>
      {open && <div className="space-y-3 p-4">{children}</div>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20";
const textareaCls = `${inputCls} resize-none`;
const labelCls = "mb-1.5 block font-heading text-xs font-medium text-slate-700";

function Issue8dModal({
  issue, processes, onSave, onClose,
}: {
  issue: Issue8d | null;
  processes: Process[];
  onSave: (f: IssueForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<IssueForm>(
    issue
      ? { ...issue, workspace_id: issue.process_id ?? "", created_by: null }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof IssueForm>(key: K, val: IssueForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[#0F1A2E]">
            {issue ? "Modifier la fiche 8D" : "Nouvelle fiche 8D"}
          </h2>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* En-tête */}
          <AccordionSection label="En-tête" defaultOpen>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Référence</label>
                <input type="text" value={form.reference ?? ""} onChange={e => set("reference", e.target.value)}
                  placeholder="Ex : 8D-2026-001" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Statut</label>
                <select value={form.status} onChange={e => set("status", e.target.value as Status8d)} className={inputCls}>
                  {(Object.keys(STATUS_LABELS) as Status8d[]).map(s =>
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Titre du problème <span className="text-red-500">*</span></label>
              <input type="text" required value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="Description synthétique du problème" className={inputCls} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Source</label>
                <input type="text" value={form.source ?? ""} onChange={e => set("source", e.target.value)}
                  placeholder="Client, audit, NC interne…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Processus</label>
                <select value={form.process_id ?? ""} onChange={e => set("process_id", e.target.value)} className={inputCls}>
                  <option value="">— Aucun —</option>
                  {processes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                </select>
              </div>
            </div>
          </AccordionSection>

          {/* D1 */}
          <AccordionSection label="Constitution de l'équipe" badge="D1">
            <label className={labelCls}>Membres de l'équipe 8D</label>
            <textarea rows={3} value={form.d1_team ?? ""} onChange={e => set("d1_team", e.target.value)}
              placeholder="Listez les membres, rôles et responsabilités…" className={textareaCls} />
          </AccordionSection>

          {/* D2 */}
          <AccordionSection label="Description du problème" badge="D2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Date de détection</label>
                <input type="date" value={form.d2_detected_at ?? ""} onChange={e => set("d2_detected_at", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Périmètre affecté</label>
                <input type="text" value={form.d2_scope ?? ""} onChange={e => set("d2_scope", e.target.value)}
                  placeholder="Lot, ligne, site, client…" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description détaillée (5W2H)</label>
              <textarea rows={4} value={form.d2_description ?? ""} onChange={e => set("d2_description", e.target.value)}
                placeholder="Qui, quoi, où, quand, pourquoi, combien, comment…" className={textareaCls} />
            </div>
          </AccordionSection>

          {/* D3 */}
          <AccordionSection label="Actions immédiates (containment)" badge="D3">
            <div>
              <label className={labelCls}>Actions de confinement</label>
              <textarea rows={3} value={form.d3_containment ?? ""} onChange={e => set("d3_containment", e.target.value)}
                placeholder="Blocage stock, tri, alerte client…" className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Date de mise en place</label>
              <input type="date" value={form.d3_done_at ?? ""} onChange={e => set("d3_done_at", e.target.value)} className={inputCls} />
            </div>
          </AccordionSection>

          {/* D4 */}
          <AccordionSection label="Analyse des causes racines" badge="D4">
            <div>
              <label className={labelCls}>Méthode utilisée</label>
              <input type="text" value={form.d4_method ?? ""} onChange={e => set("d4_method", e.target.value)}
                placeholder="Ishikawa, 5 Pourquoi, AMDEC…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Causes racines identifiées</label>
              <textarea rows={4} value={form.d4_root_causes ?? ""} onChange={e => set("d4_root_causes", e.target.value)}
                placeholder="Cause racine confirmée par les données…" className={textareaCls} />
            </div>
          </AccordionSection>

          {/* D5 */}
          <AccordionSection label="Actions correctives" badge="D5">
            <div>
              <label className={labelCls}>Actions définies</label>
              <textarea rows={3} value={form.d5_actions ?? ""} onChange={e => set("d5_actions", e.target.value)}
                placeholder="Actions, pilotes et délais…" className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Date planifiée</label>
              <input type="date" value={form.d5_planned_at ?? ""} onChange={e => set("d5_planned_at", e.target.value)} className={inputCls} />
            </div>
          </AccordionSection>

          {/* D6 */}
          <AccordionSection label="Validation des actions correctives" badge="D6">
            <div>
              <label className={labelCls}>Résultats de la validation</label>
              <textarea rows={3} value={form.d6_validation ?? ""} onChange={e => set("d6_validation", e.target.value)}
                placeholder="Preuves d'efficacité, données mesurées…" className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Date de validation</label>
              <input type="date" value={form.d6_done_at ?? ""} onChange={e => set("d6_done_at", e.target.value)} className={inputCls} />
            </div>
          </AccordionSection>

          {/* D7 */}
          <AccordionSection label="Actions préventives / pérennisation" badge="D7">
            <label className={labelCls}>Déploiement sur d'autres processus / sites</label>
            <textarea rows={3} value={form.d7_prevention ?? ""} onChange={e => set("d7_prevention", e.target.value)}
              placeholder="Mise à jour AMDEC, plans de contrôle, procédures…" className={textareaCls} />
          </AccordionSection>

          {/* D8 */}
          <AccordionSection label="Félicitations et clôture" badge="D8">
            <div>
              <label className={labelCls}>Bilan final et reconnaissance de l'équipe</label>
              <textarea rows={3} value={form.d8_closure ?? ""} onChange={e => set("d8_closure", e.target.value)}
                placeholder="Leçons apprises, remerciements…" className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Date de clôture officielle</label>
              <input type="date" value={form.d8_closed_at ?? ""} onChange={e => set("d8_closed_at", e.target.value)} className={inputCls} />
            </div>
          </AccordionSection>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-heading text-sm text-slate-600 transition hover:bg-slate-100">
              Annuler
            </button>
            <button type="submit" disabled={saving || !form.title.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-5 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40">
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {issue ? "Enregistrer" : "Créer la fiche 8D"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
