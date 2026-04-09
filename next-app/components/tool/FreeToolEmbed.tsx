"use client";

import { ExternalLink } from "lucide-react";

import { withBasePath } from "@/lib/site-config";
import type { ToolDefinition } from "@/lib/tool-registry";

export default function FreeToolEmbed({ tool }: { tool: ToolDefinition }) {
  const legacyUrl = withBasePath(tool.legacyPath);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_8px_24px_rgba(15,26,46,0.04)]">
      <div className="flex items-center justify-between border-b border-border bg-surface-warm px-6 py-3">
        <p className="font-heading text-xs uppercase tracking-[0.14em] text-accent">
          {tool.title}
        </p>
        <a
          href={legacyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-2 font-heading text-xs text-muted-foreground transition hover:text-primary"
          aria-label={`Ouvrir ${tool.title} en plein écran`}
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Plein écran
        </a>
      </div>
      <iframe
        src={legacyUrl}
        title={tool.title}
        className="min-h-[85vh] w-full border-none"
        loading="lazy"
      />
    </div>
  );
}
