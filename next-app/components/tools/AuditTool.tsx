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

type AuditType   = "grille" | "diagnostic";
type AuditStatus = "draft" | "in_progress" | "completed";

interface Criterion {
  id: string;
  criterion: string;
  constat: string;
  score: number;
  max_score: number;
}

interface Audit {
  id: string;
  audit_type: AuditType;
  title: string;
  audited_scope: string | null;
  process_id: string | null;
  auditor_name: string | null;
  audit_date: string | null;
  status: AuditStatus;
  global_score: number | null;
  conclusion: string | null;
  criteria: Criterion[];
  created_at: string;
}

interface Process { id: string; code: string; name: string; }

interface AuditForm {
  title: string;
  audited_scope: string;
  process_id: string;
  auditor_name: string;
  audit_date: string;
  status: AuditStatus;
  conclusion: string;
  criteria: Criterion[];
}

export interface AuditToolProps {
  type: AuditType;
  toolSlug: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<AuditStatus, string> = {
  draft:       "Brouillon",
  in_progress: "En cours",
  completed:   "Complété",
};
const STATUS_COLORS: Record<AuditStatus, string> = {
  draft:       "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed:   "bg-emerald-100 text-emerald-700",
};

const TODAY = new Date().toISOString().split("T")[0];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function calcScore(criteria: Criterion[]): number | null {
  const maxTotal = criteria.reduce((a, c) => a + c.max_score, 0);
  if (maxTotal === 0) return null;
  const obtained = criteria.reduce((a, c) => a + c.score, 0);
  return Math.round((obtained / maxTotal) * 100);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const DEFAULT_CRITERIA: Record<AuditType, Omit<Criterion, "id">[]> = {
  grille: [
    { criterion: "Leadership et engagement de la direction", constat: "", score: 0, max_score: 5 },
    { criterion: "Politique qualité définie et communiquée", constat: "", score: 0, max_score: 5 },
    { criterion: "Objectifs qualité mesurables et suivis",   constat: "", score: 0, max_score: 5 },
    { criterion: "Maîtrise des ressources et compétences",   constat: "", score: 0, max_score: 5 },
    { criterion: "Maîtrise de l'information documentée",     constat: "", score: 0, max_score: 5 },
    { criterion: "Réalisation des activités opérationnelles",constat: "", score: 0, max_score: 5 },
    { criterion: "Maîtrise des éléments de sortie NC",       constat: "", score: 0, max_score: 5 },
    { criterion: "Surveillance, mesure et analyse",          constat: "", score: 0, max_score: 5 },
    { criterion: "Audit interne planifié et réalisé",        constat: "", score: 0, max_score: 5 },
    { criterion: "Actions correctives et amélioration",      constat: "", score: 0, max_score: 5 },
  ],
  diagnostic: [
    { criterion: "Organisation et propreté du poste (5S)",   constat: "", score: 0, max_score: 5 },
    { criterion: "Application des procédures et standards",  constat: "", score: 0, max_score: 5 },
    { criterion: "Qualité des sorties / produits réalisés",  constat: "", score: 0, max_score: 5 },
    { criterion: "Gestion des anomalies et non-conformités", constat: "", score: 0, max_score: 5 },
    { criterion: "Management visuel et indicateurs affichés",constat: "", score: 0, max_score: 5 },
    { criterion: "Compétences, habilitations et formation",  constat: "", score: 0, max_score: 5 },
    { criterion: "État des équipements et maintenance",      constat: "", score: 0, max_score: 5 },
    { criterion: "Communication et remontée d'informations", constat: "", score: 0, max_score: 5 },
  ],
};

// ── ScoreBadge ────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-300">—</span>;
  const cls =
    score >= 80 ? "bg-emerald-100 text-emerald-700" :
    score >= 60 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700";
  return (
    <span className={`rounded-full px-2 py-0.5 font-heading text-xs font-semibold ${cls}`}>
      {score}%
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AuditTool({ type, toolSlug }: AuditToolProps) {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId]         = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(null);
  const [audits, setAudits]     = useState<Audit[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<AuditStatus | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editAudit, setEditAudit] = useState<Audit | null>(null);

  const typeLabel = type === "grille" ? "grille" : "diagnostic";

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
        tool_slug: toolSlug, event_type: "open",
      });
      await loadData(member.workspace_id);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData(wid: string) {
    setLoading(true);
    const [{ data: auditData }, { data: procData }] = await Promise.all([
      supabase.from("audits").select("*")
        .eq("workspace_id", wid).eq("audit_type", type)
        .order("created_at", { ascending: false }),
      supabase.from("processes").select("id, code, name").eq("workspace_id", wid).order("code"),
    ]);
    setAudits((auditData ?? []).map(a => ({ ...a, criteria: a.criteria ?? [] })) as Audit[]);
    setProcesses((procData ?? []) as Process[]);
    setLoading(false);
  }

  function trackEvent(wid: string, uid: string, evtType: string) {
    supabase.from("tool_events").insert({
      workspace_id: wid, user_id: uid, tool_slug: toolSlug, event_type: evtType,
    });
  }

  async function handleSave(form: AuditForm) {
    if (!wsId || !userId) return;
    const score = calcScore(form.criteria);
    const payload = {
      audit_type:    type,
      title:         form.title.trim(),
      audited_scope: form.audited_scope.trim() || null,
      process_id:    form.process_id || null,
      auditor_name:  form.auditor_name.trim() || null,
      audit_date:    form.audit_date || null,
      status:        form.status,
      global_score:  score,
      conclusion:    form.conclusion.trim() || null,
      criteria:      form.criteria,
    };
    if (editAudit) {
      const { error: err } = await supabase.from("audits").update(payload).eq("id", editAudit.id);
      if (err) { alert("Erreur : " + err.message); return; }
    } else {
      const { error: err } = await supabase.from("audits").insert({ workspace_id: wsId, created_by: userId, ...payload });
      if (err) { alert("Erreur : " + err.message); return; }
      trackEvent(wsId, userId, "create");
    }
    setModalOpen(false);
    setEditAudit(null);
    await loadData(wsId);
  }

  async function handleQuickStatus(id: string, status: AuditStatus) {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    const { error: err } = await supabase.from("audits").update({ status }).eq("id", id);
    if (err && wsId) await loadData(wsId);
  }

  async function handleDelete(id: string) {
    if (!wsId || !userId) return;
    if (!confirm(`Supprimer cette ${typeLabel} ?`)) return;
    setAudits(prev => prev.filter(a => a.id !== id));
    await supabase.from("audits").delete().eq("id", id);
    trackEvent(wsId, userId, "delete");
  }

  function exportCSV() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_csv");
    const procMap = new Map(processes.map(p => [p.id, p.code]));
    const header = "Titre;Périmètre;Processus;Auditeur;Date;Statut;Score;Conclusion";
    const rows = audits.map(a => [
      a.title, a.audited_scope ?? "",
      a.process_id ? (procMap.get(a.process_id) ?? "") : "",
      a.auditor_name ?? "", a.audit_date ?? "",
      STATUS_LABELS[a.status],
      a.global_score != null ? `${a.global_score}%` : "",
      a.conclusion ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ASCALIS_${type}_${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const procMap = new Map(processes.map(p => [p.id, p]));

  const filtered = audits.filter(a => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.audited_scope ?? "").toLowerCase().includes(q) ||
        (a.auditor_name ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total:      audits.length,
    draft:      audits.filter(a => a.status === "draft").length,
    inProgress: audits.filter(a => a.status === "in_progress").length,
    completed:  audits.filter(a => a.status === "completed").length,
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
        <StatCard label="Total" value={stats.total} color="text-[#0F1A2E]" />
        <StatCard label="Brouillons" value={stats.draft} color="text-slate-500" />
        <StatCard label="En cours" value={stats.inProgress} color="text-blue-600" />
        <StatCard label="Complétés" value={stats.completed} color="text-emerald-600" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AuditStatus | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Tous statuts</option>
          {(Object.keys(STATUS_LABELS) as AuditStatus[]).map(s =>
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          )}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en CSV">
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => { setEditAudit(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]">
            <Plus className="size-4" aria-hidden="true" />
            {type === "grille" ? "Nouvelle grille" : "Nouveau diagnostic"}
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
            {audits.length === 0
              ? `Aucune ${typeLabel} — créez la première`
              : "Aucun résultat pour ces filtres"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Titre</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Périmètre</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Processus</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Date</th>
                  <th className="py-3 px-2 text-center font-heading text-xs uppercase tracking-wider text-slate-400">Score</th>
                  <th className="py-3 pl-2 pr-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(audit => {
                  const proc = audit.process_id ? procMap.get(audit.process_id) : null;
                  return (
                    <tr key={audit.id} className="transition-colors hover:bg-slate-50">
                      <td className="py-3 pl-4 pr-2">
                        <select value={audit.status}
                          onChange={e => handleQuickStatus(audit.id, e.target.value as AuditStatus)}
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-heading text-xs font-medium focus:outline-none ${STATUS_COLORS[audit.status]}`}
                          aria-label="Changer le statut">
                          {(Object.keys(STATUS_LABELS) as AuditStatus[]).map(s =>
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          )}
                        </select>
                      </td>
                      <td className="max-w-[180px] py-3 px-2">
                        <p className="truncate font-heading text-sm font-medium text-[#0F1A2E]" title={audit.title}>
                          {audit.title}
                        </p>
                        {audit.auditor_name && (
                          <p className="truncate text-xs text-slate-400">{audit.auditor_name}</p>
                        )}
                      </td>
                      <td className="hidden py-3 px-2 sm:table-cell">
                        <span className="text-xs text-slate-600">{audit.audited_scope ?? "—"}</span>
                      </td>
                      <td className="hidden py-3 px-2 md:table-cell">
                        <span className="font-mono text-xs text-slate-500">{proc ? proc.code : "—"}</span>
                      </td>
                      <td className="hidden py-3 px-2 sm:table-cell">
                        <span className="text-xs text-slate-500">{formatDate(audit.audit_date)}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <ScoreBadge score={audit.global_score} />
                      </td>
                      <td className="py-3 pl-2 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditAudit(audit); setModalOpen(true); }}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0F1A2E]"
                            aria-label="Modifier">
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>
                          <button onClick={() => handleDelete(audit.id)}
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
            {filtered.length} {typeLabel}{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== audits.length && ` sur ${audits.length}`}
          </div>
        </div>
      )}

      {modalOpen && (
        <AuditModal
          audit={editAudit}
          type={type}
          processes={processes}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditAudit(null); }}
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

// ── AuditModal ────────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20";

function AuditModal({
  audit, type, processes, onSave, onClose,
}: {
  audit: Audit | null;
  type: AuditType;
  processes: Process[];
  onSave: (f: AuditForm) => Promise<void>;
  onClose: () => void;
}) {
  const defaultCriteria = DEFAULT_CRITERIA[type].map(c => ({ ...c, id: uid() }));

  const [form, setForm] = useState<AuditForm>({
    title:         audit?.title         ?? "",
    audited_scope: audit?.audited_scope ?? "",
    process_id:    audit?.process_id    ?? "",
    auditor_name:  audit?.auditor_name  ?? "",
    audit_date:    audit?.audit_date    ?? "",
    status:        audit?.status        ?? "draft",
    conclusion:    audit?.conclusion    ?? "",
    criteria:      audit?.criteria?.length ? audit.criteria : defaultCriteria,
  });
  const [saving, setSaving] = useState(false);

  const score = calcScore(form.criteria);

  function setField<K extends keyof Omit<AuditForm, "criteria">>(key: K, val: AuditForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setCriterion(id: string, key: keyof Criterion, val: string | number) {
    setForm(f => ({
      ...f,
      criteria: f.criteria.map(c => c.id === id ? { ...c, [key]: val } : c),
    }));
  }

  function addCriterion() {
    setForm(f => ({
      ...f,
      criteria: [...f.criteria, { id: uid(), criterion: "", constat: "", score: 0, max_score: 5 }],
    }));
  }

  function removeCriterion(id: string) {
    setForm(f => ({ ...f, criteria: f.criteria.filter(c => c.id !== id) }));
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
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold text-[#0F1A2E]">
              {audit
                ? (type === "grille" ? "Modifier la grille audit" : "Modifier le diagnostic")
                : (type === "grille" ? "Nouvelle grille audit" : "Nouveau diagnostic terrain")}
            </h2>
            {score !== null && (
              <p className="mt-0.5 text-xs text-slate-400">
                Score actuel : <ScoreBadge score={score} />
              </p>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Infos générales */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-400">
              Informations générales
            </p>
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">
                Titre <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={form.title} onChange={e => setField("title", e.target.value)}
                placeholder={type === "grille" ? "Ex : Audit SMQ — Site Lyon Q2 2026" : "Ex : Diagnostic terrain — Ligne B"}
                className={inputCls} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Périmètre audité</label>
                <input type="text" value={form.audited_scope} onChange={e => setField("audited_scope", e.target.value)}
                  placeholder="Site, atelier, service…" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Auditeur</label>
                <input type="text" value={form.auditor_name} onChange={e => setField("auditor_name", e.target.value)}
                  placeholder="Nom de l'auditeur" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Processus</label>
                <select value={form.process_id} onChange={e => setField("process_id", e.target.value)} className={inputCls}>
                  <option value="">— Aucun —</option>
                  {processes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Date</label>
                <input type="date" value={form.audit_date} onChange={e => setField("audit_date", e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Statut</label>
                <select value={form.status} onChange={e => setField("status", e.target.value as AuditStatus)} className={inputCls}>
                  {(Object.keys(STATUS_LABELS) as AuditStatus[]).map(s =>
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Critères */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-400">
                Critères ({form.criteria.length})
              </p>
              {score !== null && (
                <span className="font-heading text-xs text-slate-500">
                  Total : {form.criteria.reduce((a,c) => a + c.score, 0)} / {form.criteria.reduce((a,c) => a + c.max_score, 0)} pts
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-2 text-left font-heading text-xs text-slate-400 w-8">#</th>
                    <th className="pb-2 text-left font-heading text-xs text-slate-400">Critère</th>
                    <th className="pb-2 text-left font-heading text-xs text-slate-400 hidden sm:table-cell">Constat</th>
                    <th className="pb-2 text-center font-heading text-xs text-slate-400 w-16">Note</th>
                    <th className="pb-2 text-center font-heading text-xs text-slate-400 w-16">/Max</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {form.criteria.map((c, i) => {
                    const pct = c.max_score > 0 ? c.score / c.max_score : 0;
                    const noteColor = pct >= 0.8 ? "text-emerald-600" : pct >= 0.6 ? "text-amber-600" : "text-red-600";
                    return (
                      <tr key={c.id}>
                        <td className="py-1.5 pr-2">
                          <span className="font-mono text-xs text-slate-300">{i + 1}</span>
                        </td>
                        <td className="py-1.5 pr-2">
                          <input type="text" value={c.criterion}
                            onChange={e => setCriterion(c.id, "criterion", e.target.value)}
                            placeholder="Critère évalué…"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-[#0F1A2E] focus:border-[#B07642] focus:outline-none" />
                        </td>
                        <td className="py-1.5 pr-2 hidden sm:table-cell">
                          <input type="text" value={c.constat}
                            onChange={e => setCriterion(c.id, "constat", e.target.value)}
                            placeholder="Observation…"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 focus:border-[#B07642] focus:outline-none" />
                        </td>
                        <td className="py-1.5 pr-1 text-center">
                          <input type="number" min="0" max={c.max_score} value={c.score}
                            onChange={e => setCriterion(c.id, "score", Math.min(c.max_score, Math.max(0, Number(e.target.value))))}
                            className={`w-14 rounded-lg border border-slate-200 px-1.5 py-1.5 text-center text-xs font-semibold focus:border-[#B07642] focus:outline-none ${noteColor}`} />
                        </td>
                        <td className="py-1.5 pr-2 text-center">
                          <input type="number" min="1" value={c.max_score}
                            onChange={e => setCriterion(c.id, "max_score", Math.max(1, Number(e.target.value)))}
                            className="w-14 rounded-lg border border-slate-200 px-1.5 py-1.5 text-center text-xs text-slate-500 focus:border-[#B07642] focus:outline-none" />
                        </td>
                        <td className="py-1.5">
                          <button type="button" onClick={() => removeCriterion(c.id)}
                            className="flex size-6 items-center justify-center rounded text-slate-300 hover:bg-red-50 hover:text-red-500"
                            aria-label="Supprimer le critère">
                            <Trash2 className="size-3" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addCriterion}
              className="flex items-center gap-1.5 text-xs font-heading text-[#B07642] hover:underline">
              <Plus className="size-3.5" aria-hidden="true" /> Ajouter un critère
            </button>
          </div>

          {/* Conclusion */}
          <div>
            <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Conclusion</label>
            <textarea rows={3} value={form.conclusion}
              onChange={e => setField("conclusion", e.target.value)}
              placeholder="Synthèse, points forts, axes d'amélioration prioritaires…"
              className={`${inputCls} resize-none`} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              {score !== null && (
                <p className="font-heading text-sm text-slate-600">
                  Score : <span className="font-semibold"><ScoreBadge score={score} /></span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose}
                className="rounded-xl px-5 py-2.5 font-heading text-sm text-slate-600 transition hover:bg-slate-100">
                Annuler
              </button>
              <button type="submit" disabled={saving || !form.title.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-5 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40">
                {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {audit ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
