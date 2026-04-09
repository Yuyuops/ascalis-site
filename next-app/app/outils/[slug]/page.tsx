import { Suspense } from "react";

import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Section } from "@/components/Section";
import { absoluteUrl } from "@/lib/site-config";
import { getToolBySlug, toolRegistry } from "@/lib/tool-registry";

const ProToolClient = dynamic(() => import("@/components/tool/ProToolClient"));
const FreeToolEmbed = dynamic(() => import("@/components/tool/FreeToolEmbed"));

export const dynamicParams = false;

export function generateStaticParams() {
  return toolRegistry.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) return { title: "Outil introuvable" };

  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: tool.route },
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

  if (!tool) notFound();

  return (
    <>
      {/* Hero compact */}
      <Section id={`${tool.slug}-hero`} label={tool.title} variant="light">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={tool.visibility === "free" ? "built" : "priority"}>
                {tool.visibility === "free" ? "Gratuit" : "Pro"}
              </Badge>
              <span className="font-heading text-xs uppercase tracking-[0.16em] text-accent">{tool.stage}</span>
              <span className="font-heading text-xs text-muted-foreground">{tool.badge}</span>
            </div>
            <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] leading-tight text-primary">
              {tool.title}
            </h1>
            <p className="mt-3 text-base leading-8 text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </div>
      </Section>

      {/* Tool workspace */}
      <Section id={`${tool.slug}-workspace`} label={`Outil ${tool.title}`} variant="warm">
        {tool.visibility === "pro" ? (
          <Suspense fallback={<ToolLoadingShell />}>
            <ProToolClient tool={tool} />
          </Suspense>
        ) : (
          <Suspense fallback={<ToolLoadingShell />}>
            <FreeToolEmbed tool={tool} />
          </Suspense>
        )}
      </Section>
    </>
  );
}

function ToolLoadingShell() {
  return (
    <div className="h-64 animate-pulse rounded-[1.75rem] border border-border bg-surface-alt" />
  );
}
