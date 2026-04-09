import * as React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Politique de confidentialité — ASCALIS" };

export default function PolitiqueConfidentialite() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-8 lg:py-24">
        <h1 className="font-display text-4xl text-primary mb-10">Politique de confidentialité</h1>

        <Section title="Responsable du traitement">
          <p>Yukti Ranjan — ASCALIS</p>
          <p>Email : <a href="mailto:contact@ascalis.fr" className="text-accent underline">contact@ascalis.fr</a></p>
        </Section>

        <Section title="Données collectées">
          <p>Ce site collecte les données suivantes via le formulaire de contact :</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Nom et prénom</li>
            <li>Adresse email professionnelle</li>
            <li>Entreprise et secteur d'activité</li>
            <li>Description de votre problématique</li>
          </ul>
        </Section>

        <Section title="Finalité du traitement">
          <p>Les données collectées sont utilisées exclusivement pour :</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Répondre à votre demande de contact</li>
            <li>Proposer un premier échange téléphonique ou visio</li>
          </ul>
          <p className="mt-2">Aucune donnée n'est utilisée à des fins commerciales ou transmise à des tiers.</p>
        </Section>

        <Section title="Durée de conservation">
          <p>Les données sont conservées pendant une durée maximale de 3 ans à compter du dernier contact.</p>
        </Section>

        <Section title="Vos droits">
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à <a href="mailto:contact@ascalis.fr" className="text-accent underline">contact@ascalis.fr</a>.</p>
          <p className="mt-2">Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" className="text-accent underline" target="_blank" rel="noopener noreferrer">cnil.fr</a>.</p>
        </Section>

        <Section title="Cookies">
          <p>Ce site n'utilise pas de cookies de traçage ou publicitaires. Des cookies techniques strictement nécessaires au fonctionnement du site peuvent être déposés.</p>
        </Section>

        <Section title="Hébergement des données">
          <p>Les données transitent via Formspree (États-Unis, certifié GDPR) pour l'envoi du formulaire de contact. Vercel (États-Unis) assure l'hébergement du site.</p>
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
