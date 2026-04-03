import { applyAbaqueOverrides } from "./tools.catalog.js";

export const ABAQUE_CATEGORIES = [
  { name: "Diagnostic & état des lieux", color: "#2563EB", tools: [
    { name: "Diagnostic terrain (grille d'observation + radar)", offers: ["1","7"], source: "Beunon & Sechet", status: "built", link: "diagnostic-terrain.html" },
    { name: "Diagnostic flash qualité (trame de restitution)", offers: ["1"], source: "Beunon & Sechet", status: "planned" },
    { name: "Radar de maturité (6 domaines / 24 questions)", offers: ["7"], source: "EFQM + Lyonnet", status: "built", link: "index.html#contact" },
    { name: "Score de maturité documentaire", offers: ["2"], source: "Gillet-Goinard", status: "built", link: "score-documentaire.html" },
    { name: "Coût d'obtention de la qualité (COQ)", offers: ["1","3"], source: "Gillet-Goinard", status: "built", link: "calculateur-cnq.html" },
    { name: "Analyse des surfaces (M03b)", offers: ["1"], source: "Beunon & Sechet", status: "planned" },
    { name: "Analyse des flux (M04)", offers: ["1","3"], source: "Beunon & Sechet", status: "planned" },
    { name: "Tableau de relevé du TRG (M06)", offers: ["1","5"], source: "Beunon & Sechet", status: "planned" },
    { name: "Fiche de dysfonctionnement", offers: ["1","3"], source: "Gillet-Goinard", status: "planned" },
    { name: "Muda (identification des 7 gaspillages)", offers: ["1","6"], source: "Gillet-Goinard", status: "planned" },
    { name: "Évaluation de maturité Lean (IEMSE / 20 pratiques)", offers: ["7"], source: "Lyonnet", status: "planned" },
    { name: "Grille RADAR€ simplifiée (EFQM)", offers: ["7"], source: "EFQM 2020", status: "planned" },
    { name: "Benchmark sectoriel", offers: ["7"], source: "EFQM 2020", status: "planned" },
    { name: "Schéma du ratio d'incertitude (M05)", offers: ["1"], source: "Beunon & Sechet", status: "planned" },
  ]},
  { name: "Résolution de problèmes", color: "#DC2626", tools: [
    { name: "Fiche 8D (formulaire interactif complet)", offers: ["3"], source: "Gillet-Goinard", status: "built", link: "fiche-8d.html" },
    { name: "Diagramme d'Ishikawa (5M+1 interactif)", offers: ["3"], source: "Gillet-Goinard", status: "priority" },
    { name: "Diagramme de Pareto (analyse fréquence/impact)", offers: ["3","1"], source: "Gillet-Goinard + Lyonnet", status: "priority" },
    { name: "QQOQCCP (système quintiliel)", offers: ["3"], source: "Gillet-Goinard", status: "planned" },
    { name: "5 Pourquoi (chaîne interactive)", offers: ["3"], source: "Gillet-Goinard", status: "planned", note: "Intégré dans 8D, version standalone prévue" },
    { name: "Arbre des causes", offers: ["3"], source: "Gillet-Goinard", status: "planned" },
    { name: "Grille de décision", offers: ["3","6"], source: "Gillet-Goinard", status: "planned" },
    { name: "QRQC (Quick Response Quality Control)", offers: ["3"], source: "Gillet-Goinard", status: "planned" },
    { name: "Fiche action corrective et préventive", offers: ["3","4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Matrice de priorisation (impact/effort)", offers: ["3","4","6"], source: "Beunon & Sechet", status: "built", link: "matrice-priorisation.html" },
    { name: "Rapport A3 (version simplifiée)", offers: ["3"], source: "Lyonnet", status: "planned" },
  ]},
  { name: "Maîtrise des processus & flux", color: "#059669", tools: [
    { name: "VSM — Cartographie de chaîne de valeur", offers: ["1","3","4"], source: "Lyonnet", status: "priority" },
    { name: "SIPOC (vue macro d'un processus)", offers: ["4","7"], source: "Gillet-Goinard", status: "priority" },
    { name: "Cartographie des processus", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Fiche d'identité du processus", offers: ["4","5"], source: "Gillet-Goinard", status: "planned" },
    { name: "Matrice de contribution fonctions/processus", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Matrice d'alignement stratégie/processus", offers: ["4","7"], source: "Gillet-Goinard", status: "planned" },
    { name: "Matrice d'alignement processus/attentes", offers: ["4","7"], source: "Gillet-Goinard", status: "planned" },
    { name: "Analyse de la valeur du processus", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Revue de processus (trame)", offers: ["4","6"], source: "Gillet-Goinard", status: "planned" },
    { name: "Mesure de maturité du processus", offers: ["4","7"], source: "Gillet-Goinard", status: "planned" },
  ]},
  { name: "Conformité, audit & certification", color: "#7C3AED", tools: [
    { name: "Grille d'audit à blanc ISO 9001 / EN 9100", offers: ["1","2","4"], source: "Gillet-Goinard + EN 9100", status: "built", link: "grille-audit.html" },
    { name: "Checklist pré-audit (version allégée/gratuite)", offers: ["1","2","4"], source: "Gillet-Goinard", status: "built", link: "checklist-audit.html" },
    { name: "Plan d'action de certification", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Manuel qualité (trame type)", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Procédures (modèle type)", offers: ["2","4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Instructions de travail / modes opératoires", offers: ["2"], source: "Gillet-Goinard", status: "planned" },
    { name: "Tableau des enregistrements", offers: ["2","4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Grille d'utilisation des standards (M07)", offers: ["1","4"], source: "Beunon & Sechet", status: "planned" },
    { name: "Matrice documentaire (inventaire)", offers: ["2"], source: "Gillet-Goinard", status: "planned" },
  ]},
  { name: "Contrôle, mesure & SPC", color: "#B07642", tools: [
    { name: "Plan de contrôle / surveillance", offers: ["3","5"], source: "Gillet-Goinard", status: "built", link: "plan-controle.html" },
    { name: "SPC / Cartes de contrôle", offers: ["3","5"], source: "Gillet-Goinard", status: "priority" },
    { name: "Calcul de capabilité (Cp, Cpk)", offers: ["3"], source: "Gillet-Goinard", status: "planned" },
    { name: "AMDEC produit", offers: ["3"], source: "Gillet-Goinard", status: "planned" },
    { name: "AMDEC processus", offers: ["3","4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Analyse fonctionnelle du produit", offers: ["3"], source: "Gillet-Goinard", status: "planned" },
    { name: "5S (grille évaluation)", offers: ["6"], source: "Gillet-Goinard", status: "planned" },
    { name: "Sélection et suivi des fournisseurs", offers: ["3","4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Fiche de chiffrage des enjeux (M09)", offers: ["1","7"], source: "Beunon & Sechet", status: "planned" },
  ]},
  { name: "Pilotage, indicateurs & restitution", color: "#0369A1", tools: [
    { name: "Simulateur ROI automatisation", offers: ["5"], source: "Industrie 4.0", status: "built", link: "simulateur-roi.html" },
    { name: "Tableau de bord qualité (template)", offers: ["5","6"], source: "Gillet-Goinard", status: "planned" },
    { name: "Balanced Scorecard (BSC)", offers: ["4","7"], source: "Gillet-Goinard", status: "planned" },
    { name: "Déclinaison des objectifs qualité", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Diagramme de Gantt (suivi plan d'action)", offers: ["4","6"], source: "Gillet-Goinard", status: "planned" },
    { name: "Feuille de route chantier (M11)", offers: ["3","4","6"], source: "Beunon & Sechet", status: "planned" },
    { name: "Support de validation (M12)", offers: ["1","7"], source: "Beunon & Sechet", status: "planned" },
    { name: "Grille de bilan de diagnostic (M13)", offers: ["1","7"], source: "Beunon & Sechet", status: "planned" },
    { name: "Politique qualité (trame)", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Revue de direction (trame)", offers: ["4","6"], source: "Gillet-Goinard", status: "planned" },
  ]},
  { name: "Client & satisfaction", color: "#EC4899", tools: [
    { name: "Enquête de satisfaction client (trame)", offers: ["7"], source: "Gillet-Goinard", status: "planned" },
    { name: "Mapping satisfaction client (matrice attentes/perf)", offers: ["7"], source: "Gillet-Goinard", status: "planned", note: "Prévu comme outil gratuit site" },
    { name: "Relation client-fournisseur interne", offers: ["4"], source: "Gillet-Goinard", status: "planned" },
    { name: "Diagramme des attentes clients", offers: ["7"], source: "Gillet-Goinard", status: "planned" },
    { name: "Diagramme de Kano", offers: ["7"], source: "Gillet-Goinard", status: "planned" },
    { name: "Parcours client", offers: ["7"], source: "Gillet-Goinard", status: "planned" },
    { name: "Matrice de la qualité (QFD)", offers: ["3","4"], source: "Gillet-Goinard", status: "planned" },
  ]},
  { name: "Management & animation d'équipe", color: "#F59E0B", tools: [
    { name: "Support d'animation pour engager l'équipe (M10)", offers: ["6"], source: "Beunon & Sechet", status: "planned" },
    { name: "Plan d'animation (M08b)", offers: ["6"], source: "Beunon & Sechet", status: "planned" },
    { name: "Grille d'analyse de l'organisation (M08a)", offers: ["1","7"], source: "Beunon & Sechet", status: "planned" },
    { name: "Flash info qualité", offers: ["6"], source: "Gillet-Goinard", status: "planned" },
    { name: "Plan de communication qualité", offers: ["4","6"], source: "Gillet-Goinard", status: "planned" },
    { name: "Balance gains-pertes", offers: ["6"], source: "Gillet-Goinard", status: "planned" },
  ]},
  { name: "Pilotage financier & gestion PME", color: "#0F766E", tools: [
    { name: "Auto-diagnostic dirigeant (radar profil)", offers: ["8","7"], source: "BAO TPE", status: "priority", note: "Outil gratuit site prévu" },
    { name: "Calculateur seuil de rentabilité", offers: ["8"], source: "BAO TPE", status: "priority", note: "Outil gratuit site prévu" },
    { name: "Tableau de bord dirigeant simplifié", offers: ["8","6"], source: "BAO TPE", status: "priority", note: "Outil gratuit site prévu" },
    { name: "Compte d'exploitation dynamique", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Bilan simplifié commenté + ratios", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Prévisionnel de trésorerie glissant (13 sem / 12 mois)", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Budget prévisionnel collaboratif", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Contrôle budgétaire (icarts + alertes)", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Business Model Canvas interactif", offers: ["8","7"], source: "BAO TPE", status: "planned" },
    { name: "Matrice de positionnement stratégique", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Matrice make-or-buy (externalisation)", offers: ["8"], source: "BAO TPE", status: "planned" },
  ]},
  { name: "Commercial & vente", color: "#9333EA", tools: [
    { name: "Simulateur prix de vente", offers: ["8"], source: "BAO TPE", status: "priority", note: "Outil gratuit site prévu" },
    { name: "Pipeline de prospection + séquences", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Générateur d'argumentaire par persona", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Objectifs commerciaux + tableau de suivi", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Fiche de préparation de négociation", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Programme de fidélisation (alertes inactifs)", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Workflow relance clients automatisé", offers: ["5","8"], source: "BAO TPE", status: "planned" },
    { name: "Aging balance + suivi encours", offers: ["5","8"], source: "BAO TPE", status: "planned" },
  ]},
  { name: "Communication & visibilité", color: "#E11D48", tools: [
    { name: "Plan de communication annuel", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Calendrier éditorial / social media", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Kit communication dirigeant (pitch + messages)", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Veille e-réputation + workflow réponse", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Module gestion de salon (leads + ROI)", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Brief de communication standardisé", offers: ["8"], source: "BAO TPE", status: "planned" },
  ]},
  { name: "Organisation & développement PME", color: "#CA8A04", tools: [
    { name: "Fiches de rôle + périmètres de responsabilité", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Rituels de management (trames points hebdo/mensuels)", offers: ["8","6"], source: "BAO TPE", status: "planned" },
    { name: "Matrice de délégation dirigeant", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Registre des assurances + échéancier", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Matrice de croissance (scoring gains/risques/effort)", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Workflow recrutement + onboarding", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Audit cyber simplifié + plan sécurité", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Audit maturité digitale + feuille de route", offers: ["7","8"], source: "BAO TPE + Industrie 4.0", status: "planned" },
    { name: "Assistant éligibilité aides/crédits", offers: ["8"], source: "BAO TPE", status: "planned" },
    { name: "Générateur de dossier bancaire", offers: ["8"], source: "BAO TPE", status: "planned" },
  ]}
];

export function getAbaqueCategories() {
  return ABAQUE_CATEGORIES.map((category) => ({
    ...category,
    tools: category.tools.map((tool) => applyAbaqueOverrides(tool))
  }));
}

export function getAbaqueStats(categories = getAbaqueCategories()) {
  const flat = categories.flatMap((category) => category.tools);
  const total = flat.length;
  const built = flat.filter((tool) => tool.status === "built").length;
  const priority = flat.filter((tool) => tool.status === "priority").length;
  const planned = flat.filter((tool) => tool.status === "planned").length;
  const coverage = total ? Math.round((built / total) * 100) : 0;
  return { total, built, priority, planned, coverage };
}
