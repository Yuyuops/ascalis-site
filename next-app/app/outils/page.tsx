import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/Badge";
import { Section } from "@/components/Section";
import { absoluteUrl } from "@/lib/site-config";
import { freeTools, proTools } from "@/lib/tool-registry";

export const metadata: Metadata = {
  title: "Outils gratuits et outils pro",
  description:
    "Explorez les outils ASCALIS pour diagnostiquer, analyser, décider, agir et piloter la performance qualité au quotidien.",
  alternates: {
    canonical: "/outils/",
  },
  openGraph: {
    title: "Outils ASCALIS",
    description:
      "Explorez les outils ASCALIS pour diagnostiquer, analyser, décider, agir et piloter la performance qualité au quotidien.",
    url: absoluteUrl("/outils/"),
  },
};

export default function ToolsPage() {
  return (
    <>
      <Section id="outils-hero" label="Outils ASCALIS" variant="light">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-heading text-xs uppercase tracking-[0.16em] text-accent">Index outils</p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-tight text-primary">
            Les outils ASCALIS, organisés par usage et niveau d’accès.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Cette page s’adresse autant aux dirigeants de PME qu’aux responsables qualité, méthodes, performance et lean qui ont besoin d’outils concrets pour piloter actions, KPI, analyses et revues sans alourdir leur quotidien.
          </p>
        </div>
      </Section>

      <Section id="outils-gratuits" label="Outils gratuits" variant="warm">
        <div className="mb-10">
          <h2 className="font-display text-4xl text-primary">Outils gratuits</h2>
          <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">
            Entrée rapide pour mesurer, prioriser et préparer un premier cadrage sans passer par un outil pro complet.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {freeTools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.route}
              className="group rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_8px_24px_rgba(15,26,46,0.04)] transition-all hover:-translate-y-1 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <Badge variant="built">Gratuit</Badge>
                <span className="font-heading text-xs uppercase tracking-[0.14em] text-accent">{tool.badge}</span>
              </div>
              <h3 className="mt-4 font-heading text-xl text-primary">{tool.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{tool.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="outils-pro" label="Outils pro" variant="light">
        <div className="mb-10">
          <h2 className="font-display text-4xl text-primary">Outils pro</h2>
          <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">
            Les routes pro préparent un vrai cockpit de travail pour les responsables qualité, méthodes, performance et lean : lazy loading, moteur analytique conditionnel et exports lourds chargés uniquement au clic.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proTools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.route}
              className="group rounded-[1.5rem] border border-border bg-surface-warm p-6 transition-all hover:-translate-y-1 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <Badge variant="priority">Pro</Badge>
                <span className="font-heading text-xs uppercase tracking-[0.14em] text-accent">{tool.stage}</span>
              </div>
              <h3 className="mt-4 font-heading text-xl text-primary">{tool.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{tool.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
