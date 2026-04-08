"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckSquare,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Gauge,
  ShieldCheck,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Section } from "@/components/Section";
import { withBasePath } from "@/lib/site-config";

type Offer = {
  number: string;
  title: string;
  pitch: string;
  duration: string;
  price: string;
  badge?: string;
};

type Tool = {
  href: string;
  title: string;
  description: string;
  badge: string;
  cta: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const heroMetrics = [
  { value: "8", label: "Offres modulaires et combinables" },
  { value: "3", label: "Secteurs industriels couverts" },
  { value: "100%", label: "Transfert de compétences" },
] as const;

const pillars = [
  {
    title: "Terrain d'abord",
    description:
      "Je passe du temps dans les ateliers, sur les lignes, avec les opérateurs. Pas de diagnostic PowerPoint déconnecté de la réalité.",
    icon: ShieldCheck,
    className: "md:col-span-3 md:mt-10",
    tint: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Digitalisation intégrée",
    description:
      "J'utilise Power Automate, SharePoint et Power BI comme leviers d'exécution, pas comme offre principale. L'outil sert le processus.",
    icon: Zap,
    className: "md:col-span-2 md:-mt-6",
    tint: "bg-amber-50 text-amber-700",
  },
  {
    title: "Autonomie transférée",
    description:
      "Chaque mission se termine par un transfert de compétences. Des outils que vos équipes maîtrisent, pas qui dépendent d'un consultant.",
    icon: Users,
    className: "md:col-span-3 md:ml-10",
    tint: "bg-blue-50 text-blue-700",
  },
] as const;

const results = [
  { value: "-40%", label: "Réduction des NC récurrentes en 3 mois" },
  { value: "1-2j", label: "Récupérés par semaine pour le resp. qualité" },
  { value: "90j", label: "Pour un plan d'action actionnable post-diagnostic" },
  { value: "6-12", label: "Mois pour atteindre l'autonomie complète" },
] as const;

const offers: Offer[] = [
  { number: "01", title: "Diagnostic Flash Qualité", pitch: "En une semaine, vous savez exactement où sont vos failles qualité et par quoi commencer.", duration: "3–5 jours", price: "3–5 k€ HT" },
  { number: "02", title: "Remise en conformité documentaire", pitch: "Vos documents reflètent enfin ce que vous faites vraiment — et vos équipes savent les maintenir.", duration: "10–20 jours", price: "8–20 k€ HT" },
  { number: "03", title: "NC récurrentes : traitement à la racine", pitch: "Vos 5 défauts les plus coûteux identifiés, traités à la racine, et surveillés automatiquement.", duration: "10–15 jours", price: "8–15 k€ HT" },
  { number: "04", title: "Structuration du SMQ", pitch: "Un système qualité qui tient la route pour la certification — et que vos équipes utilisent vraiment.", duration: "20–40 jours", price: "18–40 k€ HT" },
  { number: "05", title: "Automatisation des processus qualité", pitch: "Vos process qualité tournent tout seuls — votre responsable qualité retourne enfin sur le terrain.", duration: "5–15 jours", price: "5–15 k€ HT" },
  { number: "06", title: "Accompagnement performance continue", pitch: "Un copilote terrain qui maintient la dynamique qualité jusqu'à ce que vos équipes volent seules.", duration: "1–2 j/mois", price: "1–2 k€/mois" },
  { number: "07", title: "Diagnostic Performance & Maturité Numérique", pitch: "En une semaine, vous voyez votre performance réelle sur un radar — et vous savez où chaque euro investi aura le plus d'impact.", duration: "3–8 jours", price: "2,5–8 k€ HT", badge: "Point d'entrée" },
  { number: "08", title: "Structuration opérationnelle PME", pitch: "Vous avez grandi vite. On structure votre pilotage pour que vous puissiez continuer à grandir — sans que tout repose sur vous.", duration: "15–30 jours", price: "12–30 k€ HT", badge: "Structuration PME" },
];

const pathwaySteps = [
  { step: "1", label: "Diagnostic", offers: "Offre 1 ou 7" },
  { step: "2", label: "Correction", offers: "Offre 2, 3 ou 4" },
  { step: "3", label: "Accélération", offers: "Offre 5" },
  { step: "4", label: "Pérennisation", offers: "Offre 6" },
] as const;

const references = [
  {
    quote:
      "On avait un audit EN 9100 dans 3 mois et aucune visibilité. En une semaine, on savait exactement par où commencer. Le plan d'action était clair et on l'a exécuté seuls.",
    author: "Directeur Qualité",
    company: "PME aéronautique — 45 personnes",
    result: "Audit réussi du premier coup",
    badge: "Aéronautique",
    badgeClass: "bg-blue-50 text-blue-700",
  },
  {
    quote:
      "Nos DOE étaient incomplets sur chaque chantier. Il a restructuré le processus et mis en place un suivi SharePoint. Les réserves ont chuté.",
    author: "Responsable Travaux",
    company: "Contractant général BTP — 120 personnes",
    result: "-60% de réserves chantier",
    badge: "BTP",
    badgeClass: "bg-amber-50 text-amber-700",
  },
  {
    quote:
      "On traitait les litiges transport au cas par cas. Il a automatisé le suivi et créé un dashboard temps réel. Le taux de service a bondi.",
    author: "Directeur Logistique",
    company: "ETI transport — 180 personnes",
    result: "Taux de service de 87% à 95%",
    badge: "Transport",
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
] as const;

const sectors = [
  {
    title: "Vous produisez quelque chose",
    description:
      "Pièces, ouvrages, livraisons — votre qualité se voit sur le terrain. Les problèmes coûtent cher et se répètent.",
    icon: Building2,
  },
  {
    title: "Vous avez des exigences à tenir",
    description:
      "Clients grands comptes, certifications ISO, audits de surveillance — la conformité n'est pas une option.",
    icon: ShieldCheck,
  },
  {
    title: "Vous n'avez pas de temps à perdre",
    description:
      "Pas de grand projet à 18 mois. Des résultats mesurables rapidement, sans mobiliser toute votre équipe.",
    icon: Gauge,
  },
] as const;

const tools: Tool[] = [
  {
    href: "/outils/calculateur-cnq/",
    title: "Calculateur coût de non-qualité",
    description: "Combien vous coûtent vos NC chaque année ? Découvrez le montant réel.",
    badge: "Offres 1, 3",
    cta: "Calculer mes coûts",
    icon: CircleDollarSign,
  },
  {
    href: "/outils/checklist-audit/",
    title: "Checklist pré-audit",
    description: "EN 9100 ou ISO 9001 : évaluez votre conformité chapitre par chapitre.",
    badge: "Offres 1, 2, 4",
    cta: "Vérifier ma conformité",
    icon: CheckSquare,
  },
  {
    href: "/outils/matrice-priorisation/",
    title: "Matrice de priorisation",
    description: "Impact vs. effort — la matrice montre par où commencer.",
    badge: "Offres 3, 4, 6",
    cta: "Prioriser mes chantiers",
    icon: Gauge,
  },
  {
    href: "/outils/score-documentaire/",
    title: "Score maturité documentaire",
    description: "15 questions sur la santé de votre système documentaire.",
    badge: "Offre 2",
    cta: "Évaluer ma documentation",
    icon: FileText,
  },
  {
    href: "/outils/simulateur-roi/",
    title: "Simulateur ROI automatisation",
    description: "Temps et argent récupérables en automatisant vos tâches qualité.",
    badge: "Offre 5",
    cta: "Calculer mon ROI",
    icon: Zap,
  },
  {
    href: "/outils/seuil-rentabilite/",
    title: "Calculateur seuil de rentabilité",
    description: "À partir de quel chiffre d'affaires votre entreprise gagne-t-elle de l'argent ?",
    badge: "Offre 8",
    cta: "Calculer mon seuil",
    icon: Gauge,
  },
  {
    href: "/outils/simulateur-prix/",
    title: "Simulateur prix de vente",
    description: "Coûts, marge, concurrence — trouvez le prix juste pour votre offre.",
    badge: "Offre 8",
    cta: "Simuler mon prix",
    icon: ClipboardList,
  },
  {
    href: "/outils/diagnostic-dirigeant/",
    title: "Auto-diagnostic dirigeant",
    description: "Radar de profil : forces, zones de délégation, axes de développement.",
    badge: "Offres 7, 8",
    cta: "Évaluer mon profil",
    icon: UserRound,
  },
];

export default function HomePageClient() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Section id="hero" label="La qualité comme levier de performance industrielle" variant="light" className="overflow-hidden bg-white pt-12 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.25fr_0.75fr] md:items-end">
          <Reveal reduceMotion={reduceMotion} className="space-y-8">
            <div className="flex items-center gap-3 font-heading text-xs font-medium uppercase tracking-[0.16em] text-accent">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              Consultant amélioration continue & performance qualité
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-display text-[clamp(3.5rem,8vw,6rem)] italic leading-[0.95] tracking-tight text-primary">
                La <span className="not-italic text-accent">qualité</span> comme levier de performance industrielle
              </h1>
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
                J'accompagne les PME et ETI industrielles qui ont des problèmes concrets de qualité, de conformité ou de performance opérationnelle. Chaque mission part du terrain et débouche sur un résultat mesurable.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="copper" className="gap-2">
                <a href="#contact">
                  Discutons de votre situation
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="ghost-copper">
                <a href="#outils">Tester vos outils gratuits</a>
              </Button>
            </div>
          </Reveal>

          <Reveal reduceMotion={reduceMotion} delay={0.1} className="relative">
            <div className="grid gap-4 rounded-[2rem] border border-border bg-surface-warm p-6 shadow-[0_18px_40px_rgba(15,26,46,0.08)] md:p-8">
              <div className="border-b border-border pb-5">
                <p className="font-heading text-xs uppercase tracking-[0.16em] text-accent">Résultat attendu</p>
                <p className="mt-3 text-base leading-8 text-muted-foreground">
                  Des résultats mesurables, pas des promesses. Les chiffres issus des missions terrain.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-2 border-l border-border pl-4">
                    <p className="font-display text-5xl leading-none text-accent">{metric.value}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <GearDivider reduceMotion={reduceMotion} backgroundClassName="bg-surface-alt" />

      <Section id="approche" label="Trois piliers, un objectif : vous rendre autonome" variant="warm">
        <SectionHeading tag="Approche" title="Trois piliers, un objectif : vous rendre autonome" description="Mon objectif est de me rendre inutile. Chaque mission se termine par un transfert de compétences et des outils que vos équipes maîtrisent." />
        <div className="grid gap-5 md:grid-cols-5">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} reduceMotion={reduceMotion} delay={index * 0.06} className={pillar.className}>
                <article className="h-full rounded-[1.75rem] border border-border bg-white p-7 shadow-[0_8px_24px_rgba(15,26,46,0.04)] transition-transform duration-300 hover:-translate-y-1">
                  <div className={`inline-flex rounded-2xl p-3 ${pillar.tint}`}>
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-heading text-2xl text-primary">{pillar.title}</h3>
                  <p className="mt-3 text-base leading-8 text-muted-foreground">{pillar.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section label="Des résultats mesurables, pas des promesses" variant="dark">
        <SectionHeading tag="Résultats" title="Des résultats mesurables, pas des promesses" description="Les chiffres issus des missions terrain." inverse />
        <div className="grid gap-6 md:grid-cols-4">
          {results.map((result, index) => (
            <Reveal key={result.label} reduceMotion={reduceMotion} delay={index * 0.06}>
              <article className="border-l border-white/10 pl-5 md:pl-6">
                <p className="font-display text-5xl leading-none text-accent-light">{result.value}</p>
                <p className="mt-3 text-sm leading-6 text-white/60">{result.label}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="offres" label="Huit offres, une logique terrain" variant="light">
        <SectionHeading tag="Offres" title="Huit offres, une logique terrain" description="Chaque offre part d'une douleur identifiée et débouche sur un résultat mesurable. Elles sont modulaires et combinables." />
        <Reveal reduceMotion={reduceMotion} className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_10px_28px_rgba(15,26,46,0.06)]">
          <div className="hidden grid-cols-[72px_minmax(220px,1.1fr)_minmax(320px,1.6fr)_120px_120px_150px] gap-4 border-b border-border bg-surface-warm px-6 py-4 font-heading text-xs uppercase tracking-[0.14em] text-muted-foreground lg:grid">
            <span>N°</span><span>Offre</span><span>Promesse</span><span>Durée</span><span>Prix</span><span>Repère</span>
          </div>
          <div className="divide-y divide-border">
            {offers.map((offer, index) => (
              <motion.article
                key={offer.number}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.03 }}
                className="grid gap-4 px-6 py-5 lg:grid-cols-[72px_minmax(220px,1.1fr)_minmax(320px,1.6fr)_120px_120px_150px] lg:items-start"
              >
                <div className="font-heading text-sm font-semibold tracking-[0.14em] text-accent">{offer.number}</div>
                <div><h3 className="font-heading text-lg text-primary">{offer.title}</h3></div>
                <p className="text-sm leading-7 text-muted-foreground">{offer.pitch}</p>
                <div><div className="text-xs uppercase tracking-[0.14em] text-muted-foreground lg:hidden">Durée</div><div className="font-heading text-sm text-primary">{offer.duration}</div></div>
                <div><div className="text-xs uppercase tracking-[0.14em] text-muted-foreground lg:hidden">Prix</div><div className="font-heading text-sm text-primary">{offer.price}</div></div>
                <div className="flex items-start lg:justify-end">{offer.badge ? <Badge variant="priority">{offer.badge}</Badge> : <span className="text-sm text-muted-foreground">—</span>}</div>
              </motion.article>
            ))}
          </div>
        </Reveal>
      </Section>

      <GearDivider reduceMotion={reduceMotion} backgroundClassName="bg-surface-alt" />

      <Section label="Une logique de progression" variant="warm">
        <SectionHeading tag="Parcours" title="Une logique de progression" description="Deux portes d'entrée, un chemin vers l'autonomie." />
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:gap-3">
          {pathwaySteps.map((step, index) => (
            <React.Fragment key={step.step}>
              <Reveal reduceMotion={reduceMotion} delay={index * 0.06} className="w-full lg:flex-1">
                <article className="rounded-[1.5rem] border border-border bg-white px-6 py-6 text-center shadow-[0_8px_24px_rgba(15,26,46,0.04)]">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary font-display text-2xl text-accent-light">{step.step}</div>
                  <h3 className="mt-4 font-heading text-lg text-primary">{step.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.offers}</p>
                </article>
              </Reveal>
              {index < pathwaySteps.length - 1 ? <div className="font-display text-3xl text-accent lg:self-center" aria-hidden="true">→</div> : null}
            </React.Fragment>
          ))}
        </div>
      </Section>

      <Section id="about" label="Un ingénieur qualité, pas un cabinet de plus" variant="light">
        <SectionHeading tag="Qui suis-je" title="Un ingénieur qualité, pas un cabinet de plus" />
        <div className="grid gap-10 md:grid-cols-[300px_minmax(0,1fr)] md:items-start">
          <Reveal reduceMotion={reduceMotion} className="mx-auto w-full max-w-[300px]">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-surface-alt">
              <Image src={withBasePath("/images/about-placeholder.svg")} alt="Votre photo ici" width={560} height={680} className="h-auto w-full" priority />
            </div>
          </Reveal>
          <Reveal reduceMotion={reduceMotion} delay={0.08} className="space-y-6">
            <div>
              <h3 className="font-display text-4xl text-primary">Votre prénom Nom</h3>
              <p className="mt-2 font-heading text-sm uppercase tracking-[0.16em] text-accent">Consultant Amélioration Continue & Performance Qualité</p>
            </div>
            <p className="text-base leading-8 text-muted-foreground">Ingénieur qualité de formation, j'ai passé plus de 8 ans sur le terrain — en atelier, sur les lignes de production, au contact des opérateurs et des responsables qualité. J'interviens dans l'industrie manufacturière, le BTP et le transport & logistique.</p>
            <div className="rounded-[1.5rem] border-l-[3px] border-accent bg-surface-alt p-6">
              <p className="font-heading text-xs uppercase tracking-[0.14em] text-accent">Ce qui me différencie d'un cabinet</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">Vous travaillez avec moi directement, pas avec un junior envoyé par un cabinet. Pas de couche commerciale, pas de rapport de 80 pages. Un interlocuteur unique qui connaît votre terrain et qui s'engage sur des résultats. Mon objectif : me rendre inutile en 6 à 12 mois.</p>
            </div>
            <div className="flex flex-wrap gap-8 border-t border-border pt-6">
              <Stat label="Années terrain" value="8+" />
              <Stat label="Secteurs industriels" value="3" />
              <Stat label="Transfert de compétences" value="100%" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Mastère Spé. CESI — Management QSE",
                "Black Belt Six Sigma",
                "Outils digitaux & IA (Claude Code, Power Automate, BI)",
                "SMQ / ISO 9001",
                "EN 9100",
                "Lean terrain",
                "Aéronautique",
                "BTP / Construction",
                "Transport & Logistique",
              ].map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-surface-alt px-3 py-1 font-heading text-xs text-muted-foreground">{tag}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      <Section label="Ils ont fait appel à ASCALIS" variant="warm">
        <SectionHeading tag="Références" title="Ils ont fait appel à ASCALIS" description="Quelques retours de missions terrain." />
        <div className="grid gap-6 lg:grid-cols-3">
          {references.map((reference, index) => (
            <Reveal key={reference.author} reduceMotion={reduceMotion} delay={index * 0.06}>
              <article className="h-full rounded-[1.5rem] border border-border bg-white p-7 shadow-[0_8px_24px_rgba(15,26,46,0.04)]">
                <blockquote className="border-l-2 border-accent pl-5 text-sm leading-7 text-muted-foreground">{reference.quote}</blockquote>
                <div className="mt-5">
                  <p className="font-heading text-sm text-primary">{reference.author}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{reference.company}</p>
                  <p className="mt-3 inline-flex rounded-full bg-accent/10 px-3 py-1 font-heading text-xs text-accent">{reference.result}</p>
                  <div className={`mt-3 inline-flex rounded-full px-3 py-1 font-heading text-xs ${reference.badgeClass}`}>{reference.badge}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="secteurs" label="Les PME et ETI industrielles qui veulent performer" variant="dark">
        <SectionHeading tag="Pour qui" title="Les PME et ETI industrielles qui veulent performer" description="10 à 250 personnes, une production à tenir, des exigences clients qui montent. Je travaille avec des entreprises qui font des choses concrètes." inverse />
        <div className="grid gap-6 lg:grid-cols-3">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <Reveal key={sector.title} reduceMotion={reduceMotion} delay={index * 0.06}>
                <article className="h-full rounded-[1.5rem] border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <Icon className="size-10 text-accent-light" aria-hidden="true" />
                  <h3 className="mt-5 font-heading text-xl text-white">{sector.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{sector.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <GearDivider reduceMotion={reduceMotion} backgroundClassName="bg-primary" inverted />

      <Section id="outils" label="Évaluez, mesurez, priorisez" variant="dark">
        <SectionHeading tag="Boîte à outils gratuite" title="Évaluez, mesurez, priorisez" description="10 outils interactifs pour faire le point sur votre performance qualité et votre gestion. Gratuits, sans inscription, résultats immédiats." inverse />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Reveal key={tool.title} reduceMotion={reduceMotion} delay={index * 0.04}>
                <Link href={tool.href} className="group block min-h-[44px] rounded-[1.5rem] border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-white/10 p-3 text-accent-light"><Icon className="size-6" aria-hidden="true" /></div>
                    <Badge className="border-accent/25 bg-accent/10 text-accent-light">{tool.badge}</Badge>
                  </div>
                  <h3 className="mt-4 font-heading text-lg text-white">{tool.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">{tool.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-heading text-xs uppercase tracking-[0.14em] text-accent-light">{tool.cta}<ArrowRight className="size-3 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="contact" label="Parlons de votre situation" variant="light">
        <Reveal reduceMotion={reduceMotion} className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-surface-alt p-6 shadow-[0_12px_32px_rgba(15,26,46,0.05)] md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl text-primary md:text-5xl">Parlons de votre situation</h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">Un échange de 30 minutes pour comprendre votre contexte, identifier les leviers et voir si on peut travailler ensemble.</p>
          </div>
          <form className="mt-8 grid gap-4 text-left md:grid-cols-2" aria-label="Formulaire de contact">
            <Field label="Nom" id="f-name"><input type="text" id="f-name" placeholder="Votre nom" autoComplete="name" required className={inputClass} /></Field>
            <Field label="Entreprise" id="f-company"><input type="text" id="f-company" placeholder="Nom de l'entreprise" autoComplete="organization" className={inputClass} /></Field>
            <Field label="Email" id="f-email"><input type="email" id="f-email" placeholder="votre@email.com" autoComplete="email" required className={inputClass} /></Field>
            <Field label="Secteur" id="f-sector"><select id="f-sector" className={inputClass} defaultValue=""><option value="">Sélectionner</option><option>Aéronautique</option><option>BTP / Construction</option><option>Transport & Logistique</option><option>Autre</option></select></Field>
            <Field label="Votre problématique en quelques mots" id="f-message" className="md:col-span-2"><textarea id="f-message" placeholder="Ex: On a un audit EN 9100 dans 4 mois et on ne sait pas où on en est..." className={`${inputClass} min-h-28 resize-y`} /></Field>
            <div className="md:col-span-2"><Button type="submit" variant="copper" className="w-full justify-center">Demander un échange gratuit</Button></div>
          </form>
        </Reveal>
      </Section>
    </>
  );
}

function Field({ label, id, children, className }: { label: string; id: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-heading text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-3xl text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionHeading({ tag, title, description, inverse = false }: { tag: string; title: string; description?: string; inverse?: boolean }) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <div className={`mb-4 inline-flex items-center gap-2 font-heading text-xs uppercase tracking-[0.16em] ${inverse ? "text-accent-light" : "text-accent"}`}>
        <span className={`h-px w-5 ${inverse ? "bg-accent-light/60" : "bg-accent/60"}`} aria-hidden="true" />
        {tag}
        <span className={`h-px w-5 ${inverse ? "bg-accent-light/60" : "bg-accent/60"}`} aria-hidden="true" />
      </div>
      <h2 className={`font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight ${inverse ? "text-white" : "text-primary"}`}>{title}</h2>
      {description ? <p className={`mx-auto mt-4 max-w-2xl text-base leading-8 ${inverse ? "text-white/60" : "text-muted-foreground"}`}>{description}</p> : null}
    </div>
  );
}

function Reveal({ children, className, delay = 0, reduceMotion }: { children: React.ReactNode; className?: string; delay?: number; reduceMotion: boolean | null }) {
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function GearDivider({ reduceMotion, backgroundClassName, inverted = false }: { reduceMotion: boolean | null; backgroundClassName?: string; inverted?: boolean }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate1 = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 220]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -260]);
  const gearPrimary = inverted ? "#D4956A" : "#B07642";
  const gearSecondary = inverted ? "#FAF9F6" : "#0F1A2E";
  const centerFill = inverted ? "#0F1A2E" : "#FAF9F6";

  return (
    <div ref={ref} className={`relative flex h-20 items-center justify-center overflow-hidden ${backgroundClassName ?? "bg-background"}`} aria-hidden="true">
      <div className={`absolute inset-x-0 h-px ${inverted ? "bg-white/10" : "bg-border"}`} />
      <motion.svg style={{ rotate: rotate1 }} viewBox="0 0 48 48" className="absolute left-[calc(50%-54px)] size-12 opacity-15"><GearPath fill={gearPrimary} centerFill={centerFill} /></motion.svg>
      <motion.svg style={{ rotate: rotate2 }} viewBox="0 0 48 48" className="absolute left-[calc(50%+10px)] size-10 opacity-15"><GearPath fill={gearSecondary} centerFill={centerFill} /></motion.svg>
    </div>
  );
}

function GearPath({ fill, centerFill }: { fill: string; centerFill: string }) {
  return (
    <>
      <path d="M24 6l3 4.5a12 12 0 0 1 4.2 1.7l5.3-1.2 1.5 4.5-4 3.5a12 12 0 0 1 1 4.5l4.5 3-1.5 4.5-5.3-.5a12 12 0 0 1-3.2 3.2l.5 5.3-4.5 1.5-3-4.5a12 12 0 0 1-4.5-1l-3.5 4-4.5-1.5 1.2-5.3a12 12 0 0 1-1.7-4.2L6 24l1.5-4.5 5.3 1.2a12 12 0 0 1 3.2-3.2L15.5 12l4.5-1.5z" fill={fill} />
      <circle cx="24" cy="24" r="7" fill={centerFill} />
    </>
  );
}

const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition focus:border-accent focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent";
