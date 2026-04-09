"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Lock } from "lucide-react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { withBasePath } from "@/lib/site-config";
import type { ToolDefinition } from "@/lib/tool-registry";

export default function ProToolClient({ tool }: { tool: ToolDefinition }) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthed(getCurrentUser() !== null);
  }, []);

  // Avoid hydration mismatch — render nothing until we read localStorage
  if (isAuthed === null) {
    return (
      <div className="rounded-[1.5rem] border border-border bg-surface-warm p-6 text-sm text-muted-foreground">
        Vérification de l'accès…
      </div>
    );
  }

  // Not authenticated
  if (!isAuthed) {
    return (
      <div className="rounded-[1.75rem] border border-border bg-surface-alt p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary">
          <Lock className="size-7 text-white" aria-hidden="true" />
        </div>
        <h2 className="mt-5 font-heading text-2xl text-primary">Accès Pro requis</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
          Cet outil est réservé à l'espace professionnel ASCALIS. Connectez-vous pour y accéder.
        </p>
        <Link
          href={withBasePath("/dashboard/")}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-6 py-3 font-heading text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Se connecter à l'espace pro
        </Link>
      </div>
    );
  }

  // Authenticated — embed the legacy HTML tool via iframe
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
        className="min-h-[80vh] w-full border-none"
        loading="lazy"
      />
    </div>
  );
}
