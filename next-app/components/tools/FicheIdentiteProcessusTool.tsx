"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
  Pencil,
  Save,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Process {
  id: string;
  code: string;
  name: string;
}

interface ProcessIdentity {
  id: string;
  process_id: string;
  purpose: string | null;
  inputs: string | null;
  outputs: string | null;
  stakeholders: string | null;
  risks: string | null;
  key_steps: string | null;
  kpi_list: string | null;
  resources: string | null;
  documents: string | null;
  improvement_axes: string | null;
}

interface IdentityForm {
  purpose: string;
  inputs: string;
  outputs: string;
  stakeholders: string;
  risks: string;
  key_steps: string;
  kpi_list: string;
  resources: string;
  documents: string;
  improvement_axes: string;
}

const TOOL_SLUG = "fiche-identite-processus-ascalis";
const TODAY = new Date().toISOString().split("T")[0];

const EMPTY_FORM: IdentityForm = {
  purpose: "", inputs: "", outputs: "", stakeholders: "",
  risks: "", key_steps: "", kpi_list: "", resources: "",
  documents: "", improvement_axes: "",
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function FicheIdentiteProcessusTool() {
  const supabase = getSupabaseBrowserClient();

  const [wsId, setWsId]           = useState<string | null>(null);
  const [userId, setUserId]       = useState<string | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [identities, setIdentities] = useState<Map<string, ProcessIdentity>>(new Map());
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Selected process + form
  const [selectedProcId, setSelectedProcId] = useState<string>("");
  const [form, setForm]           = useState<IdentityForm>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [dirty, setDirty]         = useState(false);

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
    const [{ data: procData }, { data: idData }] = await Promise.all([
      supabase.from("processes").select("id, code, name").eq("workspace_id", wid).order("code"),
      supabase.from("process_identities").select("*").eq("workspace_id", wid),
    ]);
    setProcesses((procData ?? []) as Process[]);
    const map = new Map<string, ProcessIdentity>();
    (idData ?? []).forEach((id: ProcessIdentity) => map.set(id.process_id, id));
    setIdentities(map);
    setLoading(false);
  }

  // When process selection changes, load its identity form
  function selectProcess(procId: string) {
    setSelectedProcId(procId);
    setSaved(false);
    setDirty(false);
    if (!procId) { setForm(EMPTY_FORM); return; }
    const existing = identities.get(procId);
    setForm(existing ? {
      purpose:          existing.purpose          ?? "",
      inputs:           existing.inputs           ?? "",
      outputs:          existing.outputs          ?? "",
      stakeholders:     existing.stakeholders     ?? "",
      risks:            existing.risks            ?? "",
      key_steps:        existing.key_steps        ?? "",
      kpi_list:         existing.kpi_list         ?? "",
      resources:        existing.resources        ?? "",
      documents:        existing.documents        ?? "",
      improvement_axes: existing.improvement_axes ?? "",
    } : EMPTY_FORM);
  }

  function setField<K extends keyof IdentityForm>(key: K, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setDirty(true);
    setSaved(false);
  }

  async function handleSave() {
    if (!wsId || !userId || !selectedProcId) return;
    setSaving(true);
    const payload = {
      workspace_id:    wsId,
      process_id:      selectedProcId,
      purpose:         form.purpose.trim()          || null,
      inputs:          form.inputs.trim()           || null,
      outputs:         form.outputs.trim()          || null,
      stakeholders:    form.stakeholders.trim()     || null,
      risks:           form.risks.trim()            || null,
      key_steps:       form.key_steps.trim()        || null,
      kpi_list:        form.kpi_list.trim()         || null,
      resources:       form.resources.trim()        || null,
      documents:       form.documents.trim()        || null,
      improvement_axes: form.improvement_axes.trim() || null,
      created_by:      userId,
    };
    const { data, error: err } = await supabase
      .from("process_identities")
      .upsert(payload, { onConflict: "process_id" })
      .select()
      .single();
    if (err) {
      alert("Erreur : " + err.message);
    } else {
      // Update local identities map
      setIdentities(prev => new Map(prev).set(selectedProcId, data as ProcessIdentity));
      setDirty(false);
      setSaved(true);
      supabase.from("tool_events").insert({
        workspace_id: wsId, user_id: userId,
        tool_slug: TOOL_SLUG, event_type: "create",
      });
    }
    setSaving(false);
  }

  function exportCSV() {
    if (!wsId || !userId) return;
    supabase.from("tool_events").insert({
      workspace_id: wsId, user_id: userId,
      tool_slug: TOOL_SLUG, event_type: "export_csv",
    });
    const header = "Processus;Finalité;Entrées;Sorties;Parties prenantes;Risques;Étapes clés;KPIs;Ressources;Documents;Axes amélioration";
    const rows = processes.map(p => {
      const id = identities.get(p.id);
      return [
        `${p.code} — ${p.name}`,
        id?.purpose ?? "", id?.inputs ?? "", id?.outputs ?? "",
        id?.stakeholders ?? "", id?.risks ?? "", id?.key_steps ?? "",
        id?.kpi_list ?? "", id?.resources ?? "", id?.documents ?? "",
        id?.improvement_axes ?? "",
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";");
    });
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ASCALIS_FicheIdentite_${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const completedCount = processes.filter(p => identities.has(p.id)).length;
  const selectedProc = processes.find(p => p.id === selectedProcId);

  if (error) return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> {error}
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="size-8 animate-spin text-[#B07642]" aria-label="Chargement" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats + Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-display text-3xl text-[#0F1A2E]">{processes.length}</p>
            <p className="mt-1 font-heading text-xs text-slate-500">Processus</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-display text-3xl text-emerald-600">{completedCount}</p>
            <p className="mt-1 font-heading text-xs text-slate-500">Fiches complètes</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-display text-3xl text-amber-500">{processes.length - completedCount}</p>
            <p className="mt-1 font-heading text-xs text-slate-500">À renseigner</p>
          </div>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-heading text-sm text-slate-600 transition hover:border-[#B07642] hover:text-[#B07642]">
          <Download className="size-4" aria-hidden="true" /> Export CSV
        </button>
      </div>

      {/* Process list overview */}
      {!selectedProcId && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="py-3 pl-4 pr-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Code</th>
                <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Processus</th>
                <th className="py-3 px-2 text-left font-heading text-xs uppercase tracking-wider text-slate-400">Fiche</th>
                <th className="py-3 pl-2 pr-4 text-right font-heading text-xs uppercase tracking-wider text-slate-400"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                    Aucun processus dans le workspace
                  </td>
                </tr>
              ) : processes.map(p => {
                const hasIdentity = identities.has(p.id);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50">
                    <td className="py-3 pl-4 pr-2">
                      <span className="font-mono text-xs font-medium text-[#B07642]">{p.code}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-heading text-sm text-[#0F1A2E]">{p.name}</span>
                    </td>
                    <td className="py-3 px-2">
                      {hasIdentity ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle className="size-3.5" aria-hidden="true" /> Complète
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Non renseignée</span>
                      )}
                    </td>
                    <td className="py-3 pl-2 pr-4 text-right">
                      <button onClick={() => selectProcess(p.id)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-heading text-xs font-medium text-[#0F1A2E] transition hover:bg-slate-100"
                        aria-label={`${hasIdentity ? "Modifier" : "Renseigner"} la fiche de ${p.name}`}>
                        <Pencil className="size-3.5" aria-hidden="true" />
                        {hasIdentity ? "Modifier" : "Renseigner"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Fiche editor */}
      {selectedProcId && (
        <div className="space-y-4">
          {/* Breadcrumb / back */}
          <div className="flex items-center justify-between">
            <button onClick={() => selectProcess("")}
              className="font-heading text-sm text-[#B07642] hover:underline">
              ← Tous les processus
            </button>
            <div className="flex items-center gap-2">
              {saved && !dirty && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle className="size-3.5" aria-hidden="true" /> Enregistré
                </span>
              )}
              <button onClick={handleSave} disabled={saving || !dirty}
                className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-4 py-2.5 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40">
                {saving
                  ? <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  : <Save className="size-4" aria-hidden="true" />
                }
                Enregistrer
              </button>
            </div>
          </div>

          {/* Process title */}
          {selectedProc && (
            <div className="rounded-2xl border border-[#B07642]/20 bg-[#B07642]/5 px-4 py-3">
              <p className="font-mono text-xs text-[#B07642]">{selectedProc.code}</p>
              <p className="font-heading text-lg font-semibold text-[#0F1A2E]">{selectedProc.name}</p>
            </div>
          )}

          {/* Form fields in 2-column grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="pi-purpose" label="Finalité / Objectif du processus"
              hint="Pourquoi ce processus existe, sa valeur ajoutée"
              value={form.purpose} onChange={v => setField("purpose", v)} />
            <FormField
              id="pi-stakeholders" label="Parties prenantes"
              hint="Clients internes/externes, fournisseurs, pilote"
              value={form.stakeholders} onChange={v => setField("stakeholders", v)} />
            <FormField
              id="pi-inputs" label="Entrées"
              hint="Ce que le processus reçoit pour fonctionner"
              value={form.inputs} onChange={v => setField("inputs", v)} />
            <FormField
              id="pi-outputs" label="Sorties / Livrables"
              hint="Résultats produits par le processus"
              value={form.outputs} onChange={v => setField("outputs", v)} />
            <FormField
              id="pi-key-steps" label="Étapes clés"
              hint="Activités principales, points de contrôle"
              value={form.key_steps} onChange={v => setField("key_steps", v)} />
            <FormField
              id="pi-resources" label="Ressources"
              hint="Humaines, matérielles, financières, systèmes"
              value={form.resources} onChange={v => setField("resources", v)} />
            <FormField
              id="pi-kpi-list" label="KPIs associés"
              hint="Indicateurs de performance et cibles"
              value={form.kpi_list} onChange={v => setField("kpi_list", v)} />
            <FormField
              id="pi-risks" label="Risques associés"
              hint="Principaux risques et points de vigilance"
              value={form.risks} onChange={v => setField("risks", v)} />
            <FormField
              id="pi-documents" label="Documents associés"
              hint="Procédures, modes opératoires, formulaires"
              value={form.documents} onChange={v => setField("documents", v)} />
            <FormField
              id="pi-improvement" label="Axes d'amélioration"
              hint="Chantiers en cours ou identifiés"
              value={form.improvement_axes} onChange={v => setField("improvement_axes", v)} />
          </div>

          {/* Save button bottom */}
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button onClick={handleSave} disabled={saving || !dirty}
              className="flex items-center gap-2 rounded-xl bg-[#0F1A2E] px-6 py-3 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40">
              {saving
                ? <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                : <Save className="size-4" aria-hidden="true" />
              }
              Enregistrer la fiche
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────

function FormField({
  id, label, hint, value, onChange,
}: {
  id: string; label: string; hint: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-heading text-xs font-medium text-slate-700">
        {label}
      </label>
      <p className="mb-1.5 text-xs text-slate-400">{hint}</p>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-heading text-sm text-[#0F1A2E] placeholder:text-slate-300 focus:border-[#B07642] focus:outline-none focus:ring-2 focus:ring-[#B07642]/20"
      />
    </div>
  );
}
