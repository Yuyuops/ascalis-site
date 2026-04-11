"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
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

type ReviewStatus = "planned" | "in_progress" | "done";

interface ProcessReview {
  id: string;
  process_id: string | null;
  period: string;
  review_date: string | null;
  status: ReviewStatus;
  conclusion: string | null;
  created_at: string;
}

interface Process {
  id: string;
  code: string;
  name: string;
}

interface ReviewForm {
  process_id: string;
  period: string;
  review_date: string;
  status: ReviewStatus;
  conclusion: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ReviewStatus, string> = {
  planned:     "Planifiée",
  in_progress: "En cours",
  done:        "Réalisée",
};

const STATUS_COLORS: Record<ReviewStatus, string> = {
  planned:     "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done:        "bg-emerald-100 text-emerald-700",
};

const TOOL_SLUG = "revue-processus-ascalis";
const TODAY = new Date().toISOString().split("T")[0];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProcessReviewTool() {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId]         = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(null);
  const [reviews, setReviews]   = useState<ProcessReview[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | "all">("all");
  const [filterProc, setFilterProc]     = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editReview, setEditReview] = useState<ProcessReview | null>(null);

  // ── Init ──────────────────────────────────────────────────────────────────

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
    const [{ data: revData }, { data: procData }] = await Promise.all([
      supabase.from("process_reviews").select("*").eq("workspace_id", wid)
        .order("review_date", { ascending: false }),
      supabase.from("processes").select("id, code, name").eq("workspace_id", wid).order("code"),
    ]);
    setReviews((revData ?? []) as ProcessReview[]);
    setProcesses((procData ?? []) as Process[]);
    setLoading(false);
  }

  function trackEvent(wid: string, uid: string, type: string) {
    supabase.from("tool_events").insert({
      workspace_id: wid, user_id: uid, tool_slug: TOOL_SLUG, event_type: type,
    });
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function handleSave(form: ReviewForm) {
    if (!wsId || !userId) return;
    const payload = {
      process_id:  form.process_id || null,
      period:      form.period.trim(),
      review_date: form.review_date || null,
      status:      form.status,
      conclusion:  form.conclusion.trim() || null,
    };

    if (editReview) {
      const { error: err } = await supabase.from("process_reviews").update(payload).eq("id", editReview.id);
      if (err) { alert("Erreur : " + err.message); return; }
    } else {
      const { error: err } = await supabase.from("process_reviews").insert({ workspace_id: wsId, ...payload });
      if (err) { alert("Erreur : " + err.message); return; }
      trackEvent(wsId, userId, "create");
    }
    setModalOpen(false);
    setEditReview(null);
    await loadData(wsId);
  }

  async function handleQuickStatus(id: string, status: ReviewStatus) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    const { error: err } = await supabase.from("process_reviews").update({ status }).eq("id", id);
    if (err && wsId) await loadData(wsId);
  }

  async function handleDelete(id: string) {
    if (!wsId || !userId) return;
    if (!confirm("Supprimer cette revue ?")) return;
    setReviews(prev => prev.filter(r => r.id !== id));
    await supabase.from("process_reviews").delete().eq("id", id);
    trackEvent(wsId, userId, "delete");
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function exportCSV() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_csv");
    const procMap = new Map(processes.map(p => [p.id, `${p.code} — ${p.name}`]));
    const header = "Processus;Période;Date revue;Statut;Conclusion";
    const rows = reviews.map(r => [
      r.process_id ? (procMap.get(r.process_id) ?? "") : "",
      r.period, r.review_date ?? "", STATUS_LABELS[r.status], r.conclusion ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ASCALIS_Revues_${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const procMap = new Map(processes.map(p => [p.id, p]));

  const filtered = reviews.filter(r => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterProc !== "all" && r.process_id !== filterProc) return false;
    if (search) {
      const q = search.toLowerCase();
      const procLabel = r.process_id ? (procMap.get(r.process_id)?.name ?? "") : "";
      return (
        r.period.toLowerCase().includes(q) ||
        procLabel.toLowerCase().includes(q) ||
        (r.conclusion ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total:      reviews.length,
    planned:    reviews.filter(r => r.status === "planned").length,
    inProgress: reviews.filter(r => r.status === "in_progress").length,
    done:       reviews.filter(r => r.status === "done").length,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} color="text-[#0F1A2E]" />
        <StatCard label="Planifiées" value={stats.planned} color="text-slate-600" />
        <StatCard label="En cours" value={stats.inProgress} color="text-blue-600" />
        <StatCard label="Réalisées" value={stats.done} color="text-emerald-600" />
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

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ReviewStatus | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Tous statuts</option>
          {(Object.keys(STATUS_LABELS) as ReviewStatus[]).map(s =>
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          )}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en CSV">
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => { setEditReview(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]">
            <Plus className="size-4" aria-hidden="true" />
            Nouvelle revue
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
          <CalendarCheck className="mx-auto mb-3 size-10 text-slate-300" aria-hidden="true" />
          <p className="font-heading text-sm text-slate-500">
            {reviews.length === 0 ? "Aucune revue planifiée — créez la première" : "Aucun résultat pour ces filtres"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Processus</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Période</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Date revue</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Conclusion</th>
                  <th className="py-3 pl-2 pr-4 text-right font-heading text-xs uppercase tracking-wider text-slate-400"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(review => {
                  const proc = review.process_id ? procMap.get(review.process_id) : null;
                  return (
                    <ReviewRow
                      key={review.id}
                      review={review}
                      processLabel={proc ? `${proc.code} — ${proc.name}` : "—"}
                      onEdit={() => { setEditReview(review); setModalOpen(true); }}
                      onDelete={() => handleDelete(review.id)}
                      onQuickStatus={s => handleQuickStatus(review.id, s)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {filtered.length} revue{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== reviews.length && ` sur ${reviews.length}`}
          </div>
        </div>
      )}

      {modalOpen && (
        <ReviewModal
          review={editReview}
          processes={processes}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditReview(null); }}
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

// ── ReviewRow ─────────────────────────────────────────────────────────────────

function ReviewRow({
  review, processLabel, onEdit, onDelete, onQuickStatus,
}: {
  review: ProcessReview;
  processLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onQuickStatus: (s: ReviewStatus) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="py-3 pl-4 pr-2">
        <select
          value={review.status}
          onChange={e => onQuickStatus(e.target.value as ReviewStatus)}
          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-heading text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B07642]/30 ${STATUS_COLORS[review.status]}`}
          aria-label="Changer le statut"
        >
          {(Object.keys(STATUS_LABELS) as ReviewStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </td>
      <td className="max-w-[160px] py-3 px-2">
        <p className="truncate font-heading text-sm font-medium text-[#0F1A2E]" title={processLabel}>
          {processLabel}
        </p>
      </td>
      <td className="py-3 px-2">
        <span className="font-mono text-xs text-slate-600">{review.period}</span>
      </td>
      <td className="hidden py-3 px-2 sm:table-cell">
        <span className="font-heading text-xs text-slate-500">{formatDate(review.review_date)}</span>
      </td>
      <td className="hidden max-w-[240px] py-3 px-2 md:table-cell">
        <p className="truncate text-xs text-slate-500" title={review.conclusion ?? ""}>
          {review.conclusion ?? "—"}
        </p>
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onEdit}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0F1A2E]"
            aria-label="Modifier">
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
          <button onClick={onDelete}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Supprimer">
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── ReviewModal ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20";

function ReviewModal({
  review, processes, onSave, onClose,
}: {
  review: ProcessReview | null;
  processes: Process[];
  onSave: (f: ReviewForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ReviewForm>({
    process_id:  review?.process_id ?? "",
    period:      review?.period ?? "",
    review_date: review?.review_date ?? "",
    status:      review?.status ?? "planned",
    conclusion:  review?.conclusion ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ReviewForm>(key: K, val: ReviewForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.period.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[#0F1A2E]">
            {review ? "Modifier la revue" : "Nouvelle revue de processus"}
          </h2>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Processus */}
          <div>
            <label htmlFor="rev-proc" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Processus</label>
            <select id="rev-proc" value={form.process_id} onChange={e => set("process_id", e.target.value)}
              className={inputCls}>
              <option value="">— Aucun —</option>
              {processes.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
            </select>
          </div>

          {/* Période + Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rev-period" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">
                Période <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="rev-period" type="text" required value={form.period}
                onChange={e => set("period", e.target.value)}
                placeholder="Ex : 2026-Q2, Avril 2026" className={inputCls} />
            </div>
            <div>
              <label htmlFor="rev-date" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Date de revue</label>
              <input id="rev-date" type="date" value={form.review_date}
                onChange={e => set("review_date", e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label htmlFor="rev-status" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Statut</label>
            <select id="rev-status" value={form.status}
              onChange={e => set("status", e.target.value as ReviewStatus)} className={inputCls}>
              {(Object.keys(STATUS_LABELS) as ReviewStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Conclusion */}
          <div>
            <label htmlFor="rev-conclusion" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Conclusion / Points clés</label>
            <textarea id="rev-conclusion" rows={4} value={form.conclusion}
              onChange={e => set("conclusion", e.target.value)}
              placeholder="Synthèse de la revue, décisions prises, points de vigilance…"
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-heading text-sm text-slate-600 transition hover:bg-slate-100">
              Annuler
            </button>
            <button type="submit" disabled={saving || !form.period.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-5 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40">
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {review ? "Enregistrer" : "Créer la revue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
