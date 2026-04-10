"use client";

import React, { useCallback, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, Download, Upload, X } from "lucide-react";

type Step = "upload" | "importing" | "result";

interface ImportResult {
  imported: number;
  skipped: number;
  warnings: { row: number; message: string }[];
  errors:   { row: number; message: string }[];
}

export function ImportWizard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep]     = useState<Step>("upload");
  const [file, setFile]     = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    const ok = f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls');
    if (!ok) { setApiError('Format non supporté — utilisez CSV ou XLSX.'); return; }
    setApiError(null);
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []);

  async function doImport() {
    if (!file) return;
    setStep("importing");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/import/actions", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setApiError(json.error ?? "Erreur serveur"); setStep("upload"); return; }
      setResult(json);
      setStep("result");
      if (json.imported > 0) onSuccess();
    } catch {
      setApiError("Erreur réseau — réessayez."); setStep("upload");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold text-[#0F1A2E]">Importer des actions</h2>
            <p className="mt-0.5 text-xs text-slate-400">CSV ou XLSX · max 500 lignes</p>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fermer">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Step : upload ─────────────────────────────────── */}
        {step === "upload" && (
          <div className="space-y-4">
            {/* Template download */}
            <a
              href="/api/import/template/actions"
              className="flex items-center gap-3 rounded-xl border border-[#B07642]/30 bg-[#B07642]/5 px-4 py-3 transition hover:bg-[#B07642]/10"
            >
              <Download className="size-4 text-[#B07642]" aria-hidden="true" />
              <div>
                <p className="font-heading text-sm text-[#0F1A2E]">Télécharger le modèle Excel</p>
                <p className="text-xs text-slate-400">Colonnes préremplies avec exemples</p>
              </div>
            </a>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition ${dragging ? "border-[#B07642] bg-[#B07642]/5" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
            >
              <Upload className={`size-8 ${dragging ? "text-[#B07642]" : "text-slate-300"}`} aria-hidden="true" />
              {file ? (
                <div className="text-center">
                  <p className="font-heading text-sm text-[#0F1A2E]">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} Ko</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-heading text-sm text-slate-500">Glisser le fichier ici</p>
                  <p className="text-xs text-slate-400">ou cliquer pour sélectionner</p>
                </div>
              )}
              <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) acceptFile(f); }} />
            </div>

            {apiError && (
              <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> {apiError}
              </p>
            )}

            <button
              onClick={doImport}
              disabled={!file}
              className="w-full rounded-xl bg-[#0F1A2E] py-3 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-40"
            >
              Importer
            </button>
          </div>
        )}

        {/* ── Step : importing ──────────────────────────────── */}
        {step === "importing" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#B07642]" />
            <p className="font-heading text-sm text-slate-500">Import en cours…</p>
          </div>
        )}

        {/* ── Step : result ─────────────────────────────────── */}
        {step === "result" && result && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="font-display text-3xl text-emerald-600">{result.imported}</p>
                <p className="mt-1 text-xs text-emerald-600">Importées</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${result.warnings.length > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
                <p className={`font-display text-3xl ${result.warnings.length > 0 ? "text-amber-600" : "text-slate-300"}`}>{result.warnings.length}</p>
                <p className={`mt-1 text-xs ${result.warnings.length > 0 ? "text-amber-600" : "text-slate-400"}`}>Avertissements</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${result.skipped > 0 ? "bg-red-50" : "bg-slate-50"}`}>
                <p className={`font-display text-3xl ${result.skipped > 0 ? "text-red-600" : "text-slate-300"}`}>{result.skipped}</p>
                <p className={`mt-1 text-xs ${result.skipped > 0 ? "text-red-600" : "text-slate-400"}`}>Ignorées</p>
              </div>
            </div>

            {/* Warnings list */}
            {result.warnings.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="mb-2 font-heading text-xs font-semibold text-amber-700">Avertissements</p>
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700">Ligne {w.row} — {w.message}</p>
                ))}
              </div>
            )}

            {/* Errors list */}
            {result.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="mb-2 font-heading text-xs font-semibold text-red-700">Lignes ignorées</p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-700">Ligne {e.row} — {e.message}</p>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F1A2E] py-3 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B]"
            >
              <CheckCircle className="size-4" aria-hidden="true" />
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
