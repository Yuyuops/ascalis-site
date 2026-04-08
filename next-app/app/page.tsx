"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Section } from "@/components/Section";

export default function HomePage() {
  return (
    <Section id="hero" label="Infrastructure Next.js ASCALIS" variant="warm">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_12px_32px_rgba(15,26,46,0.08)]"
      >
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.3fr_0.7fr] md:px-10 md:py-12">
          <div className="space-y-5">
            <Badge variant="planned">Infrastructure Next.js 15 prête</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-5xl leading-none tracking-tight text-primary md:text-6xl">
                Le futur front ASCALIS démarre ici.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Aucun écran métier n’est migré ici pour l’instant. Ce dossier pose seulement le socle : App Router, export statique, TypeScript strict, Tailwind v4, shadcn/ui et Framer Motion.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="copper" className="gap-2">
                Ouvrir la future migration
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost-copper">Conserver l’existant HTML</Button>
            </div>
          </div>
          <div className="grid gap-4 rounded-[24px] border border-border bg-surface-warm p-5">
            <StatCard label="Next.js" value="15" />
            <StatCard label="Tailwind" value="v4" />
            <StatCard label="shadcn/ui" value="New York" />
            <StatCard label="Deploy" value="GitHub Pages" />
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="font-heading text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl text-primary">{value}</p>
    </div>
  );
}
