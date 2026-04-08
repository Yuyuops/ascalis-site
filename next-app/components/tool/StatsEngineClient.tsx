"use client";

import { LineChart, Sigma } from "lucide-react";

import type { ToolDefinition } from "@/lib/tool-registry";

export default function StatsEngineClient({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-surface-warm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.16em] text-accent">Stats engine</p>
          <h3 className="mt-2 font-heading text-xl text-primary">Moteur analytique préparé pour {tool.title}</h3>
        </div>
        <div className="rounded-2xl bg-white p-3 text-accent shadow-sm">
          <Sigma className="size-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        Cette zone charge uniquement sur les pages qui en ont besoin. Elle est prévue pour accueillir vos calculs, distributions, tendances ou comparaisons sans alourdir les routes qui n’utilisent pas de logique statistique.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="font-heading text-xs uppercase tracking-[0.14em] text-muted-foreground">Indicateur A</p>
          <p className="mt-2 font-display text-3xl text-primary">—</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="font-heading text-xs uppercase tracking-[0.14em] text-muted-foreground">Indicateur B</p>
          <p className="mt-2 font-display text-3xl text-primary">—</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="font-heading text-xs uppercase tracking-[0.14em] text-muted-foreground">Vue</p>
          <div className="mt-2 flex items-center gap-2 text-primary">
            <LineChart className="size-5" aria-hidden="true" />
            <span className="font-heading text-sm">En attente de données</span>
          </div>
        </div>
      </div>
    </div>
  );
}
