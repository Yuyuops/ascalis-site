import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Mentions légales — ASCALIS" };

export default function MentionsLegales() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-8 lg:py-24">
        <h1 className="font-display text-4xl text-primary mb-10">Mentions légales</h1>

        <Section title="Éditeur du site">
          <p>Raison sociale : ASCALIS</p>
          <p>Forme juridique : Entreprise individuelle</p>
          <p>Responsable de la publication : Yukti Ranjan</p>
          <p>SIRET : [À COMPLÉTER]</p>
          <p>Adresse : France</p>
          <p>Email : <a href="mailto:contact@ascalis.fr" className="text-accent underline">contact@ascalis.fr</a></p>
        </Section>

        <Section title="Hébergement">
          <p>Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.</p>
          <p>Site : <a href="https://vercel.com" className="text-accent underline" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>L'ensemble du contenu de ce site (textes, images, outils, logotypes) est la propriété exclusive d'ASCALIS. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite.</p>
        </Section>

        <Section title="Responsabilité">
          <p>ASCALIS s'efforce de fournir des informations exactes et à jour. Toutefois, la responsabilité d'ASCALIS ne saurait être engagée en cas d'erreur ou d'omission dans les informations publiées sur ce site.</p>
        </Section>

        <Section title="Loi applicable">
          <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.</p>
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

import * as React from "react";
