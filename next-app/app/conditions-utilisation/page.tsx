import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Conditions d'utilisation — ASCALIS" };

export default function ConditionsUtilisation() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-8 lg:py-24">
        <h1 className="font-display text-4xl text-primary mb-10">Conditions d'utilisation</h1>

        <Section title="Objet">
          <p>Les présentes conditions régissent l'utilisation du site ASCALIS et de ses outils gratuits accessibles sans inscription.</p>
        </Section>

        <Section title="Accès aux outils">
          <p>Les outils gratuits sont accessibles librement. Les outils professionnels nécessitent un accès authentifié réservé aux clients et partenaires ASCALIS.</p>
        </Section>

        <Section title="Usage autorisé">
          <p>Les outils et contenus du site sont mis à disposition à titre informatif et pratique. Toute utilisation commerciale ou redistribution sans accord écrit d'ASCALIS est interdite.</p>
        </Section>

        <Section title="Limitation de responsabilité">
          <p>Les outils fournis sont des aides à la décision. ASCALIS ne saurait être tenu responsable des décisions prises sur la base des résultats obtenus. L'utilisateur reste seul responsable de l'interprétation et de l'application des résultats.</p>
        </Section>

        <Section title="Disponibilité">
          <p>ASCALIS s'efforce de maintenir le site accessible en permanence mais ne peut garantir une disponibilité sans interruption. Des maintenances peuvent être effectuées sans préavis.</p>
        </Section>

        <Section title="Modification des conditions">
          <p>ASCALIS se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés des modifications substantielles.</p>
        </Section>

        <Section title="Contact">
          <p>Pour toute question relative aux présentes conditions : <a href="mailto:contact@ascalis.fr" className="text-accent underline">contact@ascalis.fr</a></p>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-lg font-semibold text-primary mb-3">{title}</h2>
      <div className="space-y-2 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
