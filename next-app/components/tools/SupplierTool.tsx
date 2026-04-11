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

type Qualification = "pending" | "qualified" | "conditional" | "disqualified";

interface Supplier {
  id: string;
  name: string;
  category: string | null;
  contact: string | null;
  qualification: Qualification;
  quality_score: number | null;
  delay_score: number | null;
  cost_score: number | null;
  last_audit_date: string | null;
  next_audit_date: string | null;
  notes: string | null;
  created_at: string;
}

interface SupplierForm {
  name: string;
  category: string;
  contact: string;
  qualification: Qualification;
  quality_score: string;
  delay_score: string;
  cost_score: string;
  last_audit_date: string;
  next_audit_date: string;
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const QUAL_LABELS: Record<Qualification, string> = {
  pending:      "En attente",
  qualified:    "Qualifié",
  conditional:  "Conditionnel",
  disqualified: "Non qualifié",
};
const QUAL_COLORS: Record<Qualification, string> = {
  pending:      "bg-slate-100 text-slate-600",
  qualified:    "bg-emerald-100 text-emerald-700",
  conditional:  "bg-amber-100 text-amber-700",
  disqualified: "bg-red-100 text-red-700",
};

const TOOL_SLUG = "selection-suivi-fournisseurs-ascalis";
const TODAY = new Date().toISOString().split("T")[0];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function globalScore(s: Supplier): number | null {
  const scores = [s.quality_score, s.delay_score, s.cost_score].filter(v => v !== null) as number[];
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function ScoreBar({ value, color }: { value: number | null; color: string }) {
  if (value === null) return <span className="text-xs text-slate-300">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="tabular-nums text-xs text-slate-500">{value}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SupplierTool() {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId]         = useState<string | null>(null);
  const [userId, setUserId]     = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [filterQual, setFilterQual]     = useState<Qualification | "all">("all");
  const [filterCat, setFilterCat]       = useState<string>("all");

  const [modalOpen, setModalOpen]     = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

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
    const { data } = await supabase.from("suppliers").select("*")
      .eq("workspace_id", wid).order("name");
    setSuppliers((data ?? []) as Supplier[]);
    setLoading(false);
  }

  function trackEvent(wid: string, uid: string, type: string) {
    supabase.from("tool_events").insert({
      workspace_id: wid, user_id: uid, tool_slug: TOOL_SLUG, event_type: type,
    });
  }

  async function handleSave(form: SupplierForm) {
    if (!wsId || !userId) return;
    const payload = {
      name:            form.name.trim(),
      category:        form.category.trim()    || null,
      contact:         form.contact.trim()     || null,
      qualification:   form.qualification,
      quality_score:   form.quality_score !== "" ? Number(form.quality_score) : null,
      delay_score:     form.delay_score   !== "" ? Number(form.delay_score)   : null,
      cost_score:      form.cost_score    !== "" ? Number(form.cost_score)    : null,
      last_audit_date: form.last_audit_date || null,
      next_audit_date: form.next_audit_date || null,
      notes:           form.notes.trim()       || null,
    };
    if (editSupplier) {
      const { error: err } = await supabase.from("suppliers").update(payload).eq("id", editSupplier.id);
      if (err) { alert("Erreur : " + err.message); return; }
    } else {
      const { error: err } = await supabase.from("suppliers").insert({ workspace_id: wsId, created_by: userId, ...payload });
      if (err) { alert("Erreur : " + err.message); return; }
      trackEvent(wsId, userId, "create");
    }
    setModalOpen(false);
    setEditSupplier(null);
    await loadData(wsId);
  }

  async function handleQuickQual(id: string, qualification: Qualification) {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, qualification } : s));
    const { error: err } = await supabase.from("suppliers").update({ qualification }).eq("id", id);
    if (err && wsId) await loadData(wsId);
  }

  async function handleDelete(id: string) {
    if (!wsId || !userId) return;
    if (!confirm("Supprimer ce fournisseur ?")) return;
    setSuppliers(prev => prev.filter(s => s.id !== id));
    await supabase.from("suppliers").delete().eq("id", id);
    trackEvent(wsId, userId, "delete");
  }

  function exportCSV() {
    if (!wsId || !userId) return;
    trackEvent(wsId, userId, "export_csv");
    const header = "Nom;Catégorie;Contact;Qualification;Score qualité;Score délai;Score coût;Score global;Dernier audit;Prochain audit;Notes";
    const rows = suppliers.map(s => [
      s.name, s.category ?? "", s.contact ?? "",
      QUAL_LABELS[s.qualification],
      s.quality_score ?? "", s.delay_score ?? "", s.cost_score ?? "",
      globalScore(s) ?? "",
      s.last_audit_date ?? "", s.next_audit_date ?? "",
      s.notes ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ASCALIS_Fournisseurs_${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const categories = [...new Set(suppliers.map(s => s.category).filter(Boolean) as string[])].sort();

  const filtered = suppliers.filter(s => {
    if (filterQual !== "all" && s.qualification !== filterQual) return false;
    if (filterCat !== "all" && s.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.category ?? "").toLowerCase().includes(q) ||
        (s.contact ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total:        suppliers.length,
    qualified:    suppliers.filter(s => s.qualification === "qualified").length,
    conditional:  suppliers.filter(s => s.qualification === "conditional").length,
    disqualified: suppliers.filter(s => s.qualification === "disqualified").length,
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
        <StatCard label="Qualifiés" value={stats.qualified} color="text-emerald-600" />
        <StatCard label="Conditionnels" value={stats.conditional} color={stats.conditional > 0 ? "text-amber-600" : "text-slate-300"} />
        <StatCard label="Non qualifiés" value={stats.disqualified} color={stats.disqualified > 0 ? "text-red-600" : "text-slate-300"} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-400 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20" />
        </div>
        {categories.length > 0 && (
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
            <option value="all">Toutes catégories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select value={filterQual} onChange={e => setFilterQual(e.target.value as Qualification | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-heading text-sm text-[#0F1A2E] focus:border-[#B07642] focus:outline-none">
          <option value="all">Toutes qualifications</option>
          {(Object.keys(QUAL_LABELS) as Qualification[]).map(q =>
            <option key={q} value={q}>{QUAL_LABELS[q]}</option>
          )}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B07642] hover:text-[#B07642]"
            aria-label="Exporter en CSV">
            <Download className="size-4" aria-hidden="true" />
          </button>
          <button onClick={() => { setEditSupplier(null); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]">
            <Plus className="size-4" aria-hidden="true" />
            Nouveau fournisseur
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
            {suppliers.length === 0 ? "Aucun fournisseur — ajoutez le premier" : "Aucun résultat"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Qualification</th>
                  <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Nom</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 sm:table-cell">Catégorie</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Qualité</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Délai</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 md:table-cell">Coût</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 lg:table-cell">Global</th>
                  <th className="hidden py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400 lg:table-cell">Prochain audit</th>
                  <th className="py-3 pl-2 pr-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(sup => {
                  const global = globalScore(sup);
                  const globalColor = global === null ? "" : global >= 80 ? "bg-emerald-500" : global >= 60 ? "bg-amber-400" : "bg-red-500";
                  const nextAudit = sup.next_audit_date;
                  const auditSoon = nextAudit && nextAudit <= TODAY;
                  return (
                    <tr key={sup.id} className="transition-colors hover:bg-slate-50">
                      <td className="py-3 pl-4 pr-2">
                        <select
                          value={sup.qualification}
                          onChange={e => handleQuickQual(sup.id, e.target.value as Qualification)}
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-heading text-xs font-medium focus:outline-none ${QUAL_COLORS[sup.qualification]}`}
                          aria-label="Changer la qualification"
                        >
                          {(Object.keys(QUAL_LABELS) as Qualification[]).map(q =>
                            <option key={q} value={q}>{QUAL_LABELS[q]}</option>
                          )}
                        </select>
                      </td>
                      <td className="max-w-[160px] py-3 px-2">
                        <p className="truncate font-heading text-sm font-medium text-[#0F1A2E]" title={sup.name}>{sup.name}</p>
                        {sup.contact && <p className="truncate text-xs text-slate-400">{sup.contact}</p>}
                      </td>
                      <td className="hidden py-3 px-2 sm:table-cell">
                        {sup.category ? (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{sup.category}</span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="hidden py-3 px-2 md:table-cell">
                        <ScoreBar value={sup.quality_score} color="bg-emerald-500" />
                      </td>
                      <td className="hidden py-3 px-2 md:table-cell">
                        <ScoreBar value={sup.delay_score} color="bg-blue-500" />
                      </td>
                      <td className="hidden py-3 px-2 md:table-cell">
                        <ScoreBar value={sup.cost_score} color="bg-[#B07642]" />
                      </td>
                      <td className="hidden py-3 px-2 lg:table-cell">
                        <ScoreBar value={global} color={globalColor} />
                      </td>
                      <td className="hidden py-3 px-2 lg:table-cell">
                        <span className={`font-heading text-xs ${auditSoon ? "font-semibold text-red-600" : "text-slate-500"}`}>
                          {formatDate(sup.next_audit_date)}
                          {auditSoon && " ⚠"}
                        </span>
                      </td>
                      <td className="py-3 pl-2 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditSupplier(sup); setModalOpen(true); }}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0F1A2E]"
                            aria-label="Modifier">
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>
                          <button onClick={() => handleDelete(sup.id)}
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
            {filtered.length} fournisseur{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== suppliers.length && ` sur ${suppliers.length}`}
          </div>
        </div>
      )}

      {modalOpen && (
        <SupplierModal
          supplier={editSupplier}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditSupplier(null); }}
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

function SupplierModal({
  supplier, onSave, onClose,
}: {
  supplier: Supplier | null;
  onSave: (f: SupplierForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SupplierForm>({
    name:            supplier?.name            ?? "",
    category:        supplier?.category        ?? "",
    contact:         supplier?.contact         ?? "",
    qualification:   supplier?.qualification   ?? "pending",
    quality_score:   supplier?.quality_score   != null ? String(supplier.quality_score) : "",
    delay_score:     supplier?.delay_score     != null ? String(supplier.delay_score)   : "",
    cost_score:      supplier?.cost_score      != null ? String(supplier.cost_score)    : "",
    last_audit_date: supplier?.last_audit_date ?? "",
    next_audit_date: supplier?.next_audit_date ?? "",
    notes:           supplier?.notes           ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof SupplierForm>(key: K, val: SupplierForm[K]) {
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
            {supplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}
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
              Nom <span className="text-red-500">*</span>
            </label>
            <input type="text" required value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="Raison sociale du fournisseur" className={inputCls} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Catégorie</label>
              <input type="text" value={form.category} onChange={e => set("category", e.target.value)}
                placeholder="Matière, service, équipement…" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Contact</label>
              <input type="text" value={form.contact} onChange={e => set("contact", e.target.value)}
                placeholder="Nom, email ou tél." className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Qualification</label>
            <select value={form.qualification} onChange={e => set("qualification", e.target.value as Qualification)}
              className={inputCls}>
              {(Object.keys(QUAL_LABELS) as Qualification[]).map(q =>
                <option key={q} value={q}>{QUAL_LABELS[q]}</option>
              )}
            </select>
          </div>

          {/* Scores */}
          <div>
            <p className="mb-2 font-heading text-xs font-medium text-slate-700">Scores de performance (0–100)</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block font-heading text-xs text-slate-500">Qualité</label>
                <input type="number" min="0" max="100" value={form.quality_score}
                  onChange={e => set("quality_score", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-heading text-xs text-slate-500">Délai</label>
                <input type="number" min="0" max="100" value={form.delay_score}
                  onChange={e => set("delay_score", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-heading text-xs text-slate-500">Coût</label>
                <input type="number" min="0" max="100" value={form.cost_score}
                  onChange={e => set("cost_score", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Audits */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Dernier audit</label>
              <input type="date" value={form.last_audit_date} onChange={e => set("last_audit_date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Prochain audit</label>
              <input type="date" value={form.next_audit_date} onChange={e => set("next_audit_date", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-heading text-xs font-medium text-slate-700">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)}
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
              {supplier ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
