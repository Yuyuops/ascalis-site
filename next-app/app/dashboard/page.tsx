import type { Metadata } from "next";

import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Espace Pro",
  description: "Espace professionnel ASCALIS.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <Section id="dashboard" label="Espace Pro" variant="light">
      <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-border bg-white p-8 shadow-[0_8px_24px_rgba(15,26,46,0.04)]">
        <h1 className="font-display text-5xl text-primary">Espace Pro</h1>
        <p className="mt-5 text-base leading-8 text-muted-foreground">
          Cette route est volontairement exclue de l’indexation. Elle prépare l’espace de travail professionnel sans exposer sa logique aux moteurs.
        </p>
      </div>
    </Section>
  );
}
