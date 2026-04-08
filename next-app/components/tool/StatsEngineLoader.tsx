"use client";

import dynamic from "next/dynamic";

import type { ToolDefinition } from "@/lib/tool-registry";

const StatsEngineClient = dynamic(() => import("@/components/tool/StatsEngineClient"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[1.5rem] border border-border bg-surface-warm p-6 text-sm text-muted-foreground">
      Chargement du moteur analytique…
    </div>
  ),
});

export function StatsEngineLoader({ tool }: { tool: ToolDefinition }) {
  return <StatsEngineClient tool={tool} />;
}
