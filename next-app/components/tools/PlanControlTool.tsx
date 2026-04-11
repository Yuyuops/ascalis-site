"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
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

type CpStatus = "active" | "suspended" | "closed";

interface ControlPoint {
  id: string;
  process_id: string | null;
  characteristic: string;
  control_method: string | null;
  frequency: string | null;
  responsible: string | null;
  specification: string | null;
  reaction_plan: string | null;
  status: CpStatus;
  created_at: string;
}

interface Process {
  id: string;
  code: string;
  name: string;
}

interface CpForm {
  process_id: string;
  characteristic: string;
  control_method: string;
  frequency: string;
  responsible: string;
  specification: string;
  reaction_plan: string;
  status: CpStatus;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CpStatus, string> = {
  active:    "Actif",
  suspended: "Suspendu",
  closed:    "Fermé",
};
const STATUS_COLORS: Record<CpStatus, string> = {
  active:    "bg-emerald-100 text-emerald-700",
  suspended: "bg-amber-100 text-amber-700",
  closed:    "bg-slate-100 text-slate-400",
};

const TOOL_SLUG = "plan-controle";
const TODAY = new Date().toISOString().split("T")[0];

// ── Main Component ────────────────────────────────────────────────────────────

export default function PlanControlTool() {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId]           = useState<string | null>(null);
  const [userId, setUserId]       = useState<string | null>(null);
  const [points, setPoints]       = useState<ControlPoint[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<CpStatus | "all">("all");
  const [filterProc, setFilterProc]     = useState<string>("all");

  const [modalOpen, setModalOpen]   = useState(false);
  const [editPoint, setEditPoint]   = useState<ControlPoint | null>(null);

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
    const [{ data: cpData }, { data: procData }] = await Promise.all([
      supabase.from("control_plans").select("*").eq("workspace_id", wid).order("created_at", { ascending: false }),
      supabase.from("processes").select("id, code, name").eq("workspace_id", wid).order("code"),
    ]);
    setPoints((cpData ?? []) as ControlPoint[]);
    setProcesses((procData ?? []) as Process[]);
    setLoading(false);
  }

  function trackEvent(wid: string, uid: string, type: string) {
    supabase.from("tool_events").insert({
      workspace_id: wid, user_id: uid, tool_slug: TOOL_SLUG, event_type: type,
    });
  }

  async function handleSave(form: CpForm) {
    if (!wsId || !userId) return;
    const payload = {
      process_id:     form.process_id    || null,
      characteristic: form.characteristic.trim(),
      control_method: form.control_method.trim() || null,
      frequency:      form.frequency.trim()      || null,
      responsible:    form.responsible.trim()    || null,
      specification:  form.specification.trim()  || null,
      reaction_plan:  form.reaction_plan.trim()  || null,
      status:         form.status,
    };
    if (editPoint) {
      const { error: err } = await supabase.from("control_plans").update(payload).eq("id", editPoint.id);
      if (err) { alert("Erreur : " + err.message); return; }
    } else {
      const { error: err } = await supabase.from("control_plans").insert({ workspace_id: wsId, created_by: userId, ...payload });
      if (err) { alert("Erreur : " + err.message); return; }
      trackEvent(wsId, userId, "create");
    }
    setModalOpen(false);
    setEditPoint(null);
    await loadData(wsId);
  }

  async function handleQuickStatus(id: string, status: CpStatus) {
    setPoints(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    const { error: err } = await supabase.from("control_plans").update({ status }).eq("id", id);
    if (err && wsId) await loadData(wsId);
  }

  async function handleDelete(id: string) {
    if (!wsId || !userId) return;
    if (!confirm("Supprimer ce point de contrôle ?")) return;
    setPoints(prev => prev.filter(p => p.id !== id));
    await supabase.from("control_plans").delete().eq("id", id);
    trackEvent(wsId, userId, "delete");
  }

  function exportCSV() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_csv");
    const procMap = new Map(processes.map(p => [p.id, p.code]));
    const header = "Processus;Caractéristique;Méthode;Fréquence;Responsable;Spécification;Plan de réaction;Statut";
    const rows = points.map(p => [
      p.process_id ? (procMap.get(p.process_id) ?? "") : "",
      p.characteristic, p.control_method ?? "", p.frequency ?? "",
      p.responsible ?? "", p.specification ?? "", p.reaction_plan ?? "",
      STATUS_LABELS[p.status],
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ASCALIS_PlanControle_${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const procMap = new Map(processes.map(p => [p.id, p]));

  const filtered = points.filter(p => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterProc !== "all" && p.process_id !== filterProc) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.characteristic.toLowerCase().includes(q) ||
        (p.responsible ?? "").toLowerCase().includes(q) ||
        (p.control_method ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total:     points.length,
    active:    points.filter(p => p.status === "active").length,
    suspended: points.filter(p => p.status === "suspended").length,
    closed:    points.filter(p => p.status === "closed").length,
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
        <StatCard label="Total points" value={stats.total} color="text-[#0F1A2E]" />
        <StatCard label="Actifs" value={stats.active} color="text-emerald-600" />
        <StatCard label="Suspendus" value={stats.suspended} color={stats.suspended > 0 ? "text-amber-600" : "text-slate-300"} />
        <StatCard label="Fermés" value={stats.closed} color="text-slate-400" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20" />
        </div>
        <select value={filterProc} onChange={e => setFilterProc(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Tous processus</option>
          {processes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as CpStatus | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Tous statuts</option>
          {(Object.keys(STATUS_LABELS) as CpStatus[]).map(s =>
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          )}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en CSV">
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => { setEditPoint(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]">
            <Plus className="size-4" aria-hidden="true" />
            Nouveau point
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
            {points.length === 0 ? "Aucun point de contrôle — ajoutez le premier" : "Aucun résultat"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Caractéristique</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Processus</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Méthode</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Fréquence</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 lg:table-cell">Responsable</th>
                  <th className="py-3 pl-2 pr-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(point => {
                  const proc = point.process_id ? procMap.get(point.process_id) : null;
                  return (
                    <tr key={point.id} className="transition-colors hover:bg-slate-50">
                      <td className="py-3 pl-4 pr-2">
                        <select
                          value={point.status}
                          onChange={e => handleQuickStatus(point.id, e.target.value as CpStatus)}
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-heading text-xs font-medium focus:outline-none ${STATUS_COLORS[point.status]}`}
                          aria-label="Changer le statut"
                        >
                          {(Object.keys(STATUS_LABELS) as CpStatus[]).map(s =>
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          )}
                        </select>
                      </td>
                      <td className="max-w-[180px] py-3 px-2">
                        <p className="truncate font-heading text-sm font-medium text-[#0F1A2E]" title={point.characteristic}>
                          {point.characteristic}
                        </p>
                        {point.specification && (
                          <p className="truncate text-xs text-slate-400">{point.specification}</p>
                        )}
                      </td>
                      <td className="hidden py-3 px-2 md:table-cell">
                        <span className="font-mono text-xs text-slate-500">{proc ? proc.code : "—"}</span>
                      </td>
                      <td className="hidden py-3 px-2 sm:table-cell">
                        <span className="text-xs text-slate-600">{point.control_method ?? "—"}</span>
                      </td>
                      <td className="hidden py-3 px-2 sm:table-cell">
                        <span className="text-xs text-slate-600">{point.frequency ?? "—"}</span>
                      </td>
                      <td className="hidden py-3 px-2 lg:table-cell">
                        <span className="text-xs text-slate-600">{point.responsible ?? "—"}</span>
                      </td>
                      <td className="py-3 pl-2 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditPoint(point); setModalOpen(true); }}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0F1A2E]"
                            aria-label="Modifier">
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>
                          <button onClick={() => handleDelete(point.id)}
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
            {filtered.length} point{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== points.length && ` sur ${points.length}`}
          </div>
        </div>
      )}

      {modalOpen && (
        <CpModal
          point={editPoint}
          processes={processes}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditPoint(null); }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className={`font-display text-3xl ${color}`}>{value}</p>
      <p className="mt-1 font-heading text-xs text-slate-500">{label}</p>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20";

function CpModal({
  point, processes, onSave, onClose,
}: {
  point: ControlPoint | null;
  processes: Process[];
  onSave: (f: CpForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CpForm>({
    process_id:     point?.process_id      ?? "",
    characteristic: point?.characteristic  ?? "",
    control_method: point?.control_method  ?? "",
    frequency:      point?.frequency       ?? "",
    responsible:    point?.responsible     ?? "",
    specification:  point?.specification   ?? "",
    reaction_plan:  point?.reaction_plan   ?? "",
    status:         point?.status          ?? "active",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CpForm>(key: K, val: CpForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.characteristic.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[#0F1A2E]">
            {point ? "Modifier le point de contrôle" : "Nouveau point de contrôle"}
          </h2>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">
              Caractéristique à contrôler <span className="text-red-500">*</span>
            </label>
            <input type="text" required value={form.characteristic} onChange={e => set("characteristic", e.target.value)}
              placeholder="Ex : Diamètre alésage, température four, délai livraison…" className={inputCls} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Processus</label>
              <select value={form.process_id} onChange={e => set("process_id", e.target.value)} className={inputCls}>
                <option value="">— Aucun —</option>
                {processes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Statut</label>
              <select value={form.status} onChange={e => set("status", e.target.value as CpStatus)} className={inputCls}>
                {(Object.keys(STATUS_LABELS) as CpStatus[]).map(s =>
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Méthode de contrôle</label>
              <input type="text" value={form.control_method} onChange={e => set("control_method", e.target.value)}
                placeholder="Visuel, mesure, test…" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Fréquence</label>
              <input type="text" value={form.frequency} onChange={e => set("frequency", e.target.value)}
                placeholder="1/pièce, 1/heure, 1/lot…" className={inputCls} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Spécification / tolérance</label>
              <input type="text" value={form.specification} onChange={e => set("specification", e.target.value)}
                placeholder="Ex : 25 ±0.5 mm, ≥ 98%…" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Responsable</label>
              <input type="text" value={form.responsible} onChange={e => set("responsible", e.target.value)}
                placeholder="Opérateur, qualité, méthodes…" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Plan de réaction (si NC)</label>
            <textarea rows={3} value={form.reaction_plan} onChange={e => set("reaction_plan", e.target.value)}
              placeholder="Bloquer, retrier, alerter responsable qualité…"
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-heading text-sm text-slate-600 transition hover:bg-slate-100">
              Annuler
            </button>
            <button type="submit" disabled={saving || !form.characteristic.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-5 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40">
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {point ? "Enregistrer" : "Ajouter le point"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
