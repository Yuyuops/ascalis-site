"use client";

import dynamic from "next/dynamic";
import { Lock, Workflow } from "lucide-react";

import { ToolExportActions } from "@/components/tool/ToolExportActions";
import type { ToolDefinition } from "@/lib/tool-registry";

const StatsEngineClient = dynamic(() => import("@/components/tool/StatsEngineClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[1.5rem] border border-border bg-surface-warm p-6 text-sm text-muted-foreground">
      Chargement du moteur analytique…
    </div>
  ),
});

export default function ProToolClient({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-border bg-surface-warm p-6 shadow-[0_8px_24px_rgba(15,26,46,0.04)]">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white p-3 text-accent shadow-sm">
            <Workflow className="size-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.16em] text-accent">Outil pro chargé à la demande</p>
            <h2 className="mt-2 font-heading text-2xl text-primary">Socle Next prêt pour la migration métier</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Cette route prépare la future migration de l’outil pro sans embarquer tout son JavaScript sur la vitrine. Le shell métier est donc lazy-loadé et reste compatible avec un déploiement statique GitHub Pages.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-border bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-heading text-xl text-primary">Accès et exploitation</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              L’écran public expose le contexte, le rôle de l’outil et la logique de parcours. Le comportement avancé, la persistance et les exports lourds restent isolés et chargés seulement quand la page en a réellement besoin.
            </p>
          </div>
        </div>
      </div>

      <ToolExportActions
        title={tool.title}
        description={tool.description}
        fileBaseName={tool.slug}
      />

      {tool.requiresStatsEngine ? <StatsEngineClient tool={tool} /> : null}
    </div>
  );
}
