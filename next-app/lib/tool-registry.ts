export type ToolVisibility = "free" | "pro";
export type ToolStage =
  | "probleme"
  | "diagnostic"
  | "analyse"
  | "decision"
  | "action"
  | "controle"
  | "revue";

export type ToolDefinition = {
  slug: string;
  title: string;
  description: string;
  visibility: ToolVisibility;
  stage: ToolStage;
  legacyPath: string;
  route: `/outils/${string}/`;
  requiresStatsEngine: boolean;
  badge: string;
  /** true = render native React component instead of legacy iframe */
  native?: boolean;
};

export const toolRegistry: ToolDefinition[] = [
  {
    slug: "calculateur-cnq",
    title: "Calculateur coût de non-qualité",
    description: "Quantifie le coût réel des non-conformités, rebuts, retouches et réclamations.",
    visibility: "free",
    stage: "analyse",
    legacyPath: "/calculateur-cnq.html",
    route: "/outils/calculateur-cnq/",
    requiresStatsEngine: true,
    badge: "Offres 1, 3",
  },
  {
    slug: "checklist-audit",
    title: "Checklist pré-audit",
    description: "Vérifie rapidement la conformité d’un périmètre avant audit ou revue terrain.",
    visibility: "free",
    stage: "diagnostic",
    legacyPath: "/checklist-audit.html",
    route: "/outils/checklist-audit/",
    requiresStatsEngine: false,
    badge: "Offres 1, 2, 4",
  },
  {
    slug: "matrice-priorisation",
    title: "Matrice de priorisation",
    description: "Arbitre les actions à lancer selon impact, effort et urgence.",
    visibility: "free",
    stage: "decision",
    legacyPath: "/matrice-priorisation.html",
    route: "/outils/matrice-priorisation/",
    requiresStatsEngine: false,
    badge: "Offres 3, 4, 6",
  },
  {
    slug: "score-documentaire",
    title: "Score maturité documentaire",
    description: "Mesure la robustesse documentaire avant audit, refonte GED ou remise en conformité.",
    visibility: "free",
    stage: "diagnostic",
    legacyPath: "/score-documentaire.html",
    route: "/outils/score-documentaire/",
    requiresStatsEngine: false,
    badge: "Offre 2",
  },
  {
    slug: "simulateur-roi",
    title: "Simulateur ROI",
    description: "Chiffre le retour sur investissement d’un chantier d’amélioration ou d’automatisation.",
    visibility: "free",
    stage: "decision",
    legacyPath: "/simulateur-roi.html",
    route: "/outils/simulateur-roi/",
    requiresStatsEngine: true,
    badge: "Offre 5",
  },
  {
    slug: "seuil-rentabilite",
    title: "Calculateur seuil de rentabilité",
    description: "Détermine le point mort économique d’un projet ou d’une offre.",
    visibility: "free",
    stage: "decision",
    legacyPath: "/seuil-rentabilite.html",
    route: "/outils/seuil-rentabilite/",
    requiresStatsEngine: true,
    badge: "Offre 8",
  },
  {
    slug: "simulateur-prix",
    title: "Simulateur prix de vente",
    description: "Cadre un prix cible cohérent avec coûts, marge et positionnement.",
    visibility: "free",
    stage: "decision",
    legacyPath: "/simulateur-prix.html",
    route: "/outils/simulateur-prix/",
    requiresStatsEngine: true,
    badge: "Offre 8",
  },
  {
    slug: "diagnostic-dirigeant",
    title: "Diagnostic dirigeant",
    description: "Clarifie un besoin flou, les priorités et le niveau de maturité perçu par la direction.",
    visibility: "free",
    stage: "probleme",
    legacyPath: "/diagnostic-dirigeant.html",
    route: "/outils/diagnostic-dirigeant/",
    requiresStatsEngine: false,
    badge: "Offres 7, 8",
  },
  {
    slug: "diagnostic-terrain",
    title: "Diagnostic terrain",
    description: "Fait l’état des lieux rapide sur le terrain pour objectiver écarts et dérives.",
    visibility: "pro",
    stage: "diagnostic",
    legacyPath: "/diagnostic-terrain.html",
    route: "/outils/diagnostic-terrain/",
    requiresStatsEngine: false,
    badge: "Offres 1, 3",
  },
  {
    slug: "grille-audit",
    title: "Grille audit",
    description: "Évalue un processus ou une activité avec critères, constats et score structurés.",
    visibility: "pro",
    stage: "diagnostic",
    legacyPath: "/grille-audit.html",
    route: "/outils/grille-audit/",
    requiresStatsEngine: false,
    badge: "Offres 1, 4",
  },
  {
    slug: "matrice-documentaire-ascalis",
    title: "Matrice documentaire",
    description: "Structure la base documentaire et les règles de gestion à partir des écarts constatés.",
    visibility: "pro",
    stage: "decision",
    legacyPath: "/matrice-documentaire-ascalis.html",
    route: "/outils/matrice-documentaire-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 2, 5",
  },
  {
    slug: "cartographie-processus-ascalis",
    title: "Cartographie des processus",
    description: "Modélise l’organisation par processus pour rendre le système pilotable.",
    visibility: "pro",
    stage: "decision",
    legacyPath: "/cartographie-processus-ascalis.html",
    route: "/outils/cartographie-processus-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 2, 4, 8",
  },
  {
    slug: "fiche-identite-processus-ascalis",
    title: "Fiche d’identité processus",
    description: "Formalise finalité, pilote, risques, étapes et KPI d’un processus.",
    visibility: "pro",
    stage: "decision",
    legacyPath: "/fiche-identite-processus-ascalis.html",
    route: "/outils/fiche-identite-processus-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 2, 4, 8",
  },
  {
    slug: "pareto",
    title: "Pareto",
    description: "Hiérarchise les défauts, causes ou pertes pour cibler les priorités vitales.",
    visibility: "pro",
    stage: "analyse",
    legacyPath: "/pareto.html",
    route: "/outils/pareto/",
    requiresStatsEngine: true,
    badge: "Offres 1, 3",
  },
  {
    slug: "ishikawa",
    title: "Ishikawa",
    description: "Structure les causes racines d’un problème récurrent avant décision corrective.",
    visibility: "pro",
    stage: "analyse",
    legacyPath: "/ishikawa.html",
    route: "/outils/ishikawa/",
    requiresStatsEngine: false,
    badge: "Offre 3",
  },
  {
    slug: "fiche-8d",
    title: "Fiche 8D",
    description: "Cadre le traitement complet d’un problème critique jusqu’à validation de clôture.",
    visibility: "pro",
    stage: "decision",
    legacyPath: "/fiche-8d.html",
    route: "/outils/fiche-8d/",
    requiresStatsEngine: false,
    badge: "Offre 3",
  },
  {
    slug: "plan-action-central-ascalis",
    title: "Plan d’action central",
    description: "Centralise toutes les actions du projet avec pilotes, échéances et statuts.",
    visibility: "pro",
    stage: "action",
    legacyPath: "/plan-action-central-ascalis.html",
    route: "/outils/plan-action-central-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 1, 3, 4, 5, 6, 8",
    native: true,
  },
  {
    slug: "tableau-bord-qualite-ascalis",
    title: "Tableau de bord qualité",
    description: "Consolide KPI, tendances, statuts et alertes pour piloter la performance.",
    visibility: "pro",
    stage: "controle",
    legacyPath: "/tableau-bord-qualite-ascalis.html",
    route: "/outils/tableau-bord-qualite-ascalis/",
    requiresStatsEngine: true,
    badge: "Offres 3, 4, 5, 6, 8",
    native: true,
  },
  {
    slug: "revue-processus-ascalis",
    title: "Revue de processus",
    description: "Fait le point sur l’efficacité d’un processus à partir des faits et des résultats.",
    visibility: "pro",
    stage: "revue",
    legacyPath: "/revue-processus-ascalis.html",
    route: "/outils/revue-processus-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 3, 4, 6, 8",
    native: true,
  },
  {
    slug: "revue-direction-ascalis",
    title: "Revue de direction",
    description: "Arbitre au niveau système qualité global, ressources, risques et priorités.",
    visibility: "pro",
    stage: "revue",
    legacyPath: "/revue-direction-ascalis.html",
    route: "/outils/revue-direction-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 2, 4, 6, 8",
  },
  {
    slug: "matrice-hoshin-ascalis",
    title: "Matrice Hoshin",
    description: "Déploie la stratégie en objectifs, initiatives, pilotes et cohérence globale.",
    visibility: "pro",
    stage: "decision",
    legacyPath: "/matrice-hoshin-ascalis.html",
    route: "/outils/matrice-hoshin-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 4, 6, 7, 8",
  },
  {
    slug: "audit-maturite-digitale-feuille-route-ascalis",
    title: "Audit maturité digitale + feuille de route",
    description: "Évalue la maturité digitale et produit une feuille de route de transformation.",
    visibility: "pro",
    stage: "diagnostic",
    legacyPath: "/audit-maturite-digitale-feuille-route-ascalis.html",
    route: "/outils/audit-maturite-digitale-feuille-route-ascalis/",
    requiresStatsEngine: true,
    badge: "Offres 5, 7",
  },
  {
    slug: "matrice-croissance-ascalis",
    title: "Matrice de croissance",
    description: "Arbitre les leviers de croissance ou transformation selon gains, risques et effort.",
    visibility: "pro",
    stage: "decision",
    legacyPath: "/matrice-croissance-ascalis.html",
    route: "/outils/matrice-croissance-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 5, 7, 8",
  },
  {
    slug: "selection-suivi-fournisseurs-ascalis",
    title: "Sélection, suivi et évaluation fournisseurs",
    description: "Qualifie les fournisseurs et structure leur suivi dans le temps.",
    visibility: "pro",
    stage: "diagnostic",
    legacyPath: "/selection-suivi-fournisseurs-ascalis.html",
    route: "/outils/selection-suivi-fournisseurs-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 1, 4, 8",
  },
  {
    slug: "comparateur-statistique-fournisseurs-ascalis",
    title: "Comparateur statistique fournisseurs",
    description: "Compare plusieurs fournisseurs sur des données objectives de qualité, délai et coût.",
    visibility: "pro",
    stage: "analyse",
    legacyPath: "/comparateur-statistique-fournisseurs-ascalis.html",
    route: "/outils/comparateur-statistique-fournisseurs-ascalis/",
    requiresStatsEngine: true,
    badge: "Offres 1, 4",
  },
  {
    slug: "plan-controle",
    title: "Plan de contrôle",
    description: "Définit les contrôles et surveillances critiques pour sécuriser un risque ou un fournisseur.",
    visibility: "pro",
    stage: "controle",
    legacyPath: "/plan-controle.html",
    route: "/outils/plan-controle/",
    requiresStatsEngine: false,
    badge: "Offres 1, 4, 8",
  },
  {
    slug: "parcours-client-ascalis",
    title: "Parcours client",
    description: "Cartographie les étapes, irritants et moments de vérité de l’expérience client.",
    visibility: "pro",
    stage: "diagnostic",
    legacyPath: "/parcours-client-ascalis.html",
    route: "/outils/parcours-client-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 7, 8",
  },
  {
    slug: "diagramme-kano-ascalis",
    title: "Diagramme de Kano",
    description: "Classe les attentes clients selon leur nature de valeur et leur pouvoir de différenciation.",
    visibility: "pro",
    stage: "analyse",
    legacyPath: "/diagramme-kano-ascalis.html",
    route: "/outils/diagramme-kano-ascalis/",
    requiresStatsEngine: false,
    badge: "Offres 7, 6",
  },
  {
    slug: "matrice-qualite",
    title: "Matrice de la qualité",
    description: "Traduit la voix du client en exigences internes et priorités techniques.",
    visibility: "pro",
    stage: "decision",
    legacyPath: "/matrice-qualite.html",
    route: "/outils/matrice-qualite/",
    requiresStatsEngine: false,
    badge: "Offres 7, 8",
  },
  {
    slug: "dmaic-navigator",
    title: "DMAIC Navigator",
    description: "Oriente un projet DMAIC vers les bons outils statistiques et les bonnes preuves.",
    visibility: "pro",
    stage: "analyse",
    legacyPath: "/dmaic-navigator.html",
    route: "/outils/dmaic-navigator/",
    requiresStatsEngine: true,
    badge: "Offres 3, 6",
  },
];

export const highlightedHomeToolSlugs = [
  "calculateur-cnq",
  "checklist-audit",
  "matrice-priorisation",
  "score-documentaire",
  "simulateur-roi",
  "seuil-rentabilite",
  "simulateur-prix",
  "diagnostic-dirigeant",
] as const;

export const highlightedHomeTools = highlightedHomeToolSlugs
  .map((slug) => toolRegistry.find((tool) => tool.slug === slug))
  .filter((tool): tool is ToolDefinition => Boolean(tool));

export const legacyRedirects = Object.fromEntries(
  toolRegistry.map((tool) => [tool.legacyPath, tool.route]),
) as Record<string, string>;

legacyRedirects["/index.html"] = "/";
legacyRedirects["/ascalis-site.html"] = "/";
legacyRedirects["/dashboard.html"] = "/dashboard/";
legacyRedirects["/abaque-outils.html"] = "/outils/";

export function getToolBySlug(slug: string) {
  return toolRegistry.find((tool) => tool.slug === slug) ?? null;
}

export const freeTools = toolRegistry.filter((tool) => tool.visibility === "free");
export const proTools = toolRegistry.filter((tool) => tool.visibility === "pro");
