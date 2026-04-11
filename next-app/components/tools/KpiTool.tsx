"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
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

type KpiStatus = "green" | "orange" | "red";
type KpiTrend = "up" | "down" | "stable";
type TargetOp = ">=" | "<=" | "=";

interface Kpi {
  id: string;
  name: string;
  kpi_group: string | null;
  period: string | null;
  target_value: number | null;
  target_operator: TargetOp;
  current_value: number | null;
  unit: string | null;
  status: KpiStatus;
  trend: KpiTrend;
  comment: string | null;
  created_at: string;
}

interface KpiForm {
  name: string;
  kpi_group: string;
  period: string;
  current_value: string;
  target_value: string;
  target_operator: TargetOp;
  unit: string;
  status: KpiStatus;
  trend: KpiTrend;
  comment: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<KpiStatus, { bg: string; text: string; dot: string }> = {
  green:  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  orange: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400"   },
  red:    { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
};

const STATUS_LABELS: Record<KpiStatus, string> = {
  green: "Vert",
  orange: "Orange",
  red: "Rouge",
};

const TREND_LABELS: Record<KpiTrend, string> = {
  up: "En hausse",
  down: "En baisse",
  stable: "Stable",
};

const TREND_ICON: Record<KpiTrend, React.ReactNode> = {
  up:     <ArrowUp   className="size-3.5" aria-hidden="true" />,
  down:   <ArrowDown className="size-3.5" aria-hidden="true" />,
  stable: <ArrowRight className="size-3.5" aria-hidden="true" />,
};

const TREND_COLOR: Record<KpiTrend, string> = {
  up: "text-emerald-600",
  down: "text-red-500",
  stable: "text-slate-400",
};

const TOOL_SLUG = "tableau-bord-qualite-ascalis";
const TODAY = new Date().toISOString().split("T")[0];

function formatVal(v: number | null, unit: string | null) {
  if (v === null || v === undefined) return "—";
  return `${v}${unit ? " " + unit : ""}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function KpiTool() {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId]       = useState<string | null>(null);
  const [userId, setUserId]   = useState<string | null>(null);
  const [kpis, setKpis]       = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<KpiStatus | "all">("all");
  const [filterGroup, setFilterGroup]   = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editKpi, setEditKpi]     = useState<Kpi | null>(null);

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
    const { data } = await supabase
      .from("kpis").select("*").eq("workspace_id", wid)
      .order("kpi_group").order("name");
    setKpis((data ?? []) as Kpi[]);
    setLoading(false);
  }

  function trackEvent(wid: string, uid: string, type: string) {
    supabase.from("tool_events").insert({
      workspace_id: wid, user_id: uid, tool_slug: TOOL_SLUG, event_type: type,
    });
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function handleSave(form: KpiForm) {
    if (!wsId || !userId) return;
    const payload = {
      name:            form.name.trim(),
      kpi_group:       form.kpi_group.trim() || null,
      period:          form.period.trim() || null,
      current_value:   form.current_value !== "" ? Number(form.current_value) : null,
      target_value:    form.target_value  !== "" ? Number(form.target_value)  : null,
      target_operator: form.target_operator,
      unit:            form.unit.trim() || null,
      status:          form.status,
      trend:           form.trend,
      comment:         form.comment.trim() || null,
    };

    if (editKpi) {
      const { error: err } = await supabase.from("kpis").update(payload).eq("id", editKpi.id);
      if (err) { alert("Erreur : " + err.message); return; }
    } else {
      const { error: err } = await supabase.from("kpis").insert({ workspace_id: wsId, ...payload });
      if (err) { alert("Erreur : " + err.message); return; }
      trackEvent(wsId, userId, "create");
    }
    setModalOpen(false);
    setEditKpi(null);
    await loadData(wsId);
  }

  async function handleQuickStatus(id: string, status: KpiStatus) {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, status } : k));
    const { error: err } = await supabase.from("kpis").update({ status }).eq("id", id);
    if (err && wsId) await loadData(wsId);
  }

  async function handleDelete(id: string) {
    if (!wsId || !userId) return;
    if (!confirm("Supprimer cet indicateur ?")) return;
    setKpis(prev => prev.filter(k => k.id !== id));
    await supabase.from("kpis").delete().eq("id", id);
    trackEvent(wsId, userId, "delete");
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function exportCSV() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_csv");
    const header = "Nom;Groupe;Période;Valeur actuelle;Opérateur;Cible;Unité;Statut;Tendance;Commentaire";
    const rows = kpis.map(k => [
      k.name, k.kpi_group ?? "", k.period ?? "",
      k.current_value ?? "", k.target_operator, k.target_value ?? "",
      k.unit ?? "", STATUS_LABELS[k.status], TREND_LABELS[k.trend], k.comment ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ASCALIS_KPI_${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const groups = [...new Set(kpis.map(k => k.kpi_group).filter(Boolean) as string[])].sort();

  const filtered = kpis.filter(k => {
    if (filterStatus !== "all" && k.status !== filterStatus) return false;
    if (filterGroup !== "all" && k.kpi_group !== filterGroup) return false;
    if (search) {
      const q = search.toLowerCase();
      return k.name.toLowerCase().includes(q) || (k.kpi_group ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total:  kpis.length,
    green:  kpis.filter(k => k.status === "green").length,
    orange: kpis.filter(k => k.status === "orange").length,
    red:    kpis.filter(k => k.status === "red").length,
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
        <StatCard label="Total KPI" value={stats.total} color="text-[#0F1A2E]" />
        <StatCard label="Verts" value={stats.green}  color="text-emerald-600" />
        <StatCard label="Orange" value={stats.orange} color={stats.orange > 0 ? "text-amber-600" : "text-slate-300"} />
        <StatCard label="Rouges" value={stats.red}    color={stats.red > 0 ? "text-red-600" : "text-slate-300"} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20" />
        </div>

        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Tous groupes</option>
          {groups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as KpiStatus | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Tous statuts</option>
          {(["green", "orange", "red"] as KpiStatus[]).map(s =>
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          )}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en CSV">
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => { setEditKpi(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]">
            <Plus className="size-4" aria-hidden="true" />
            Nouvel indicateur
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
            {kpis.length === 0 ? "Aucun indicateur — créez le premier" : "Aucun résultat pour ces filtres"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Indicateur</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Groupe</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Période</th>
                  <th className="py-3 px-2 text-right font-heading text-xs uppercase tracking-wider text-slate-400">Valeur</th>
                  <th className="py-3 px-2 text-right font-heading text-xs uppercase tracking-wider text-slate-400">Cible</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Tendance</th>
                  <th className="py-3 pl-2 pr-4 text-right font-heading text-xs uppercase tracking-wider text-slate-400"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(kpi => (
                  <KpiRow
                    key={kpi.id}
                    kpi={kpi}
                    onEdit={() => { setEditKpi(kpi); setModalOpen(true); }}
                    onDelete={() => handleDelete(kpi.id)}
                    onQuickStatus={s => handleQuickStatus(kpi.id, s)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {filtered.length} indicateur{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== kpis.length && ` sur ${kpis.length}`}
          </div>
        </div>
      )}

      {modalOpen && (
        <KpiModal
          kpi={editKpi}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditKpi(null); }}
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

// ── KpiRow ────────────────────────────────────────────────────────────────────

function KpiRow({
  kpi, onEdit, onDelete, onQuickStatus,
}: {
  kpi: Kpi;
  onEdit: () => void;
  onDelete: () => void;
  onQuickStatus: (s: KpiStatus) => void;
}) {
  const c = STATUS_COLORS[kpi.status];

  return (
    <tr className="transition-colors hover:bg-slate-50">
      <td className="py-3 pl-4 pr-2">
        <select
          value={kpi.status}
          onChange={e => onQuickStatus(e.target.value as KpiStatus)}
          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-heading text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B07642]/30 ${c.bg} ${c.text}`}
          aria-label="Changer le statut"
        >
          {(["green", "orange", "red"] as KpiStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </td>
      <td className="max-w-[160px] py-3 px-2 sm:max-w-[220px]">
        <p className="truncate font-heading text-sm font-medium text-[#0F1A2E]" title={kpi.name}>{kpi.name}</p>
        {kpi.comment && <p className="truncate text-xs text-slate-400">{kpi.comment}</p>}
      </td>
      <td className="hidden py-3 px-2 sm:table-cell">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-heading text-xs text-slate-600">
          {kpi.kpi_group ?? "—"}
        </span>
      </td>
      <td className="hidden py-3 px-2 md:table-cell">
        <span className="font-mono text-xs text-slate-500">{kpi.period ?? "—"}</span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className={`tabular-nums font-heading text-sm font-semibold ${c.text}`}>
          {formatVal(kpi.current_value, kpi.unit)}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="tabular-nums text-xs text-slate-500">
          {kpi.target_operator} {formatVal(kpi.target_value, kpi.unit)}
        </span>
      </td>
      <td className="hidden py-3 px-2 sm:table-cell">
        <span className={`flex items-center gap-1 font-heading text-xs ${TREND_COLOR[kpi.trend]}`}>
          {TREND_ICON[kpi.trend]} {TREND_LABELS[kpi.trend]}
        </span>
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

// ── KpiModal ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20";

function KpiModal({
  kpi, onSave, onClose,
}: {
  kpi: Kpi | null;
  onSave: (f: KpiForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<KpiForm>({
    name:            kpi?.name ?? "",
    kpi_group:       kpi?.kpi_group ?? "",
    period:          kpi?.period ?? "",
    current_value:   kpi?.current_value != null ? String(kpi.current_value) : "",
    target_value:    kpi?.target_value  != null ? String(kpi.target_value)  : "",
    target_operator: kpi?.target_operator ?? ">=",
    unit:            kpi?.unit ?? "",
    status:          kpi?.status ?? "green",
    trend:           kpi?.trend ?? "stable",
    comment:         kpi?.comment ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof KpiForm>(key: K, val: KpiForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
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
            {kpi ? "Modifier l'indicateur" : "Nouvel indicateur"}
          </h2>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Fermer">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label htmlFor="kpi-name" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">
              Nom <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input id="kpi-name" type="text" required value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Ex : Taux de NC, Délai moyen livraison…" className={inputCls} />
          </div>

          {/* Groupe + Période */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="kpi-group" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Groupe</label>
              <input id="kpi-group" type="text" value={form.kpi_group}
                onChange={e => set("kpi_group", e.target.value)}
                placeholder="Ex : Qualité, Délai, Coût" className={inputCls} />
            </div>
            <div>
              <label htmlFor="kpi-period" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Période</label>
              <input id="kpi-period" type="text" value={form.period}
                onChange={e => set("period", e.target.value)}
                placeholder="Ex : 2026-Q2, Avril 2026" className={inputCls} />
            </div>
          </div>

          {/* Valeurs */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="kpi-current" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Valeur actuelle</label>
              <input id="kpi-current" type="number" step="any" value={form.current_value}
                onChange={e => set("current_value", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="kpi-op" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Opérateur</label>
              <select id="kpi-op" value={form.target_operator}
                onChange={e => set("target_operator", e.target.value as TargetOp)} className={inputCls}>
                <option value=">=">≥ (plus c'est haut, mieux c'est)</option>
                <option value="<=">≤ (plus c'est bas, mieux c'est)</option>
                <option value="=">= (valeur exacte)</option>
              </select>
            </div>
            <div>
              <label htmlFor="kpi-target" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Cible</label>
              <input id="kpi-target" type="number" step="any" value={form.target_value}
                onChange={e => set("target_value", e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Unité + Statut + Tendance */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="kpi-unit" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Unité</label>
              <input id="kpi-unit" type="text" value={form.unit}
                onChange={e => set("unit", e.target.value)}
                placeholder="%, ppm, j, €…" className={inputCls} />
            </div>
            <div>
              <label htmlFor="kpi-status" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Statut</label>
              <select id="kpi-status" value={form.status}
                onChange={e => set("status", e.target.value as KpiStatus)} className={inputCls}>
                <option value="green">🟢 Vert</option>
                <option value="orange">🟠 Orange</option>
                <option value="red">🔴 Rouge</option>
              </select>
            </div>
            <div>
              <label htmlFor="kpi-trend" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Tendance</label>
              <select id="kpi-trend" value={form.trend}
                onChange={e => set("trend", e.target.value as KpiTrend)} className={inputCls}>
                <option value="up">↑ En hausse</option>
                <option value="stable">→ Stable</option>
                <option value="down">↓ En baisse</option>
              </select>
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label htmlFor="kpi-comment" className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Commentaire</label>
            <textarea id="kpi-comment" rows={2} value={form.comment}
              onChange={e => set("comment", e.target.value)}
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-heading text-sm text-slate-600 transition hover:bg-slate-100">
              Annuler
            </button>
            <button type="submit" disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-5 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40">
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {kpi ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
