import { Suspense } from "react";

import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Section } from "@/components/Section";
import { ToolExportActions } from "@/components/tool/ToolExportActions";
import { StatsEngineLoader } from "@/components/tool/StatsEngineLoader";
import { absoluteUrl } from "@/lib/site-config";
import { getToolBySlug, toolRegistry } from "@/lib/tool-registry";

const ProToolClient = dynamic(() => import("@/components/tool/ProToolClient"), {
  suspense: true,
});

export const dynamicParams = false;

export function generateStaticParams() {
  return toolRegistry.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Outil introuvable",
    };
  }

  return {
    title: tool.title,
    description: tool.description,
    alternates: {
      canonical: tool.route,
    },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: absoluteUrl(tool.route),
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  return (
    <>
      <Section id={`${tool.slug}-hero`} label={tool.title} variant="light">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={tool.visibility === "free" ? "built" : "priority"}>
              {tool.visibility === "free" ? "Gratuit" : "Pro"}
            </Badge>
            <span className="font-heading text-xs uppercase tracking-[0.16em] text-accent">Étape {tool.stage}</span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight text-primary">
            {tool.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </Section>

      <Section id={`${tool.slug}-usage`} label={`Usage ${tool.title}`} variant="warm">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-border bg-white p-7 shadow-[0_8px_24px_rgba(15,26,46,0.04)]">
            <h2 className="font-heading text-2xl text-primary">Ce que fait cet outil</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Cette route prépare une version Next propre, indexable et accessible de l’outil historique. Elle conserve l’intention métier, le contexte de parcours et la possibilité d’étendre ensuite l’écran réel sans casser le SEO ni le déploiement statique.
            </p>
            <div className="mt-6">
              <ToolExportActions title={tool.title} description={tool.description} fileBaseName={tool.slug} />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-surface-alt p-7">
            <h2 className="font-heading text-2xl text-primary">Repères</h2>
            <dl className="mt-5 grid gap-4 text-sm leading-7 text-muted-foreground">
              <div>
                <dt className="font-heading text-xs uppercase tracking-[0.14em] text-accent">Niveau d’accès</dt>
                <dd>{tool.visibility === "free" ? "Gratuit" : "Pro"}</dd>
              </div>
              <div>
                <dt className="font-heading text-xs uppercase tracking-[0.14em] text-accent">Ancien chemin</dt>
                <dd>{tool.legacyPath}</dd>
              </div>
              <div>
                <dt className="font-heading text-xs uppercase tracking-[0.14em] text-accent">Repère d’offre</dt>
                <dd>{tool.badge}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section id={`${tool.slug}-workspace`} label={`Contenu ${tool.title}`} variant="light">
        {tool.visibility === "pro" ? (
          <Suspense
            fallback={
              <div className="rounded-[1.75rem] border border-border bg-surface-warm p-6 text-sm text-muted-foreground">
                Chargement du shell de l’outil pro…
              </div>
            }
          >
            <ProToolClient tool={tool} />
          </Suspense>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-border bg-white p-7 shadow-[0_8px_24px_rgba(15,26,46,0.04)]">
              <h2 className="font-heading text-2xl text-primary">Version gratuite prête pour la migration</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                La version gratuite reste légère. Les exports lourds sont chargés au clic uniquement, et le moteur statistique n’est monté que sur les routes qui en ont réellement besoin.
              </p>
            </div>
            {tool.requiresStatsEngine ? <StatsEngineLoader tool={tool} /> : null}
          </div>
        )}
      </Section>
    </>
  );
}
