export const ABAQUE_TOOL_OVERRIDES = {
  "Diagnostic terrain (grille d'observation + radar)": {
    status: "built",
    link: "diagnostic-terrain.html"
  },
  "Fiche 8D (formulaire interactif complet)": {
    status: "built",
    link: "fiche-8d.html"
  },
  "Diagramme d'Ishikawa (5M+1 interactif)": {
    status: "built",
    link: "ishikawa.html"
  },
  "Diagramme de Pareto (analyse fréquence/impact)": {
    status: "built",
    link: "pareto.html"
  },
  "VSM — Cartographie de chaîne de valeur": {
    status: "built",
    link: "vsm.html"
  },
  "SIPOC (vue macro d'un processus)": {
    status: "built",
    link: "sipoc.html"
  },
  "Grille d'audit à blanc ISO 9001 / EN 9100": {
    status: "built",
    link: "grille-audit.html"
  },
  "Checklist pré-audit (version allégée/gratuite)": {
    status: "built",
    link: "checklist-audit.html"
  },
  "Plan de contrôle / surveillance": {
    status: "built",
    link: "plan-controle.html"
  },
  "SPC / Cartes de contrôle": {
    status: "built",
    link: "spc.html"
  },
  "Sélection et suivi des fournisseurs": {
    status: "built",
    link: "selection-suivi-fournisseurs-ascalis.html"
  },
  "Tableau de bord qualité (template)": {
    status: "built",
    link: "tableau-bord-qualite-ascalis.html"
  },
  "Revue de direction (trame)": {
    status: "built",
    link: "revue-direction-ascalis.html"
  },
  "Diagramme de Kano": {
    status: "built",
    link: "diagramme-kano-ascalis.html"
  },
  "Parcours client": {
    status: "built",
    link: "parcours-client-ascalis.html"
  },
  "Auto-diagnostic dirigeant (radar profil)": {
    status: "built",
    link: "diagnostic-dirigeant.html",
    note: "Outil gratuit site disponible"
  },
  "Calculateur seuil de rentabilité": {
    status: "built",
    link: "seuil-rentabilite.html",
    note: "Outil gratuit site disponible"
  },
  "Simulateur prix de vente": {
    status: "built",
    link: "simulateur-prix.html",
    note: "Outil gratuit site disponible"
  },
  "Cartographie des processus": {
    status: "built",
    link: "cartographie-processus-ascalis.html"
  },
  "Fiche d'identité du processus": {
    status: "built",
    link: "fiche-identite-processus-ascalis.html"
  },
  "Revue de processus (trame)": {
    status: "built",
    link: "revue-processus-ascalis.html"
  },
  "Matrice Hoshin": {
    status: "built",
    link: "matrice-hoshin-ascalis.html"
  },
  "Matrice de croissance (scoring gains/risques/effort)": {
    status: "built",
    link: "matrice-croissance-ascalis.html"
  },
  "Audit maturité digitale + feuille de route": {
    status: "built",
    link: "audit-maturite-digitale-feuille-route-ascalis.html"
  }
};

export const DASHBOARD_LIBRARY = {
  pro: [
    { key: "diag-terrain", name: "Diagnostic terrain", desc: "Grille 8 domaines + radar", status: "built", icon: "green", link: "diagnostic-terrain.html" },
    { key: "fiche-8d", name: "Fiche 8D", desc: "Résolution de problème 8 disciplines", status: "built", icon: "green", link: "fiche-8d.html" },
    { key: "grille-audit", name: "Grille d'audit à blanc", desc: "ISO 9001 / EN 9100", status: "built", icon: "green", link: "grille-audit.html", adminOnly: true },
    { key: "plan-controle", name: "Plan de contrôle", desc: "Tableau éditable + export CSV", status: "built", icon: "green", link: "plan-controle.html", adminOnly: true },
    { key: "pareto", name: "Pareto interactif", desc: "Analyse fréquence / impact", status: "built", icon: "green", link: "pareto.html" },
    { key: "vsm", name: "VSM — Cartographie", desc: "Chaîne de valeur interactive", status: "built", icon: "green", link: "vsm.html" },
    { key: "sipoc", name: "SIPOC", desc: "Vue macro processus", status: "built", icon: "green", link: "sipoc.html" },
    { key: "ishikawa", name: "Ishikawa interactif", desc: "5M+1 standalone", status: "built", icon: "green", link: "ishikawa.html" },
    { key: "spc", name: "SPC / Cartes de contrôle", desc: "Contrôle statistique", status: "built", icon: "green", link: "spc.html" },
    { key: "selection-fournisseurs", name: "Sélection fournisseurs", desc: "Suivi & évaluation fournisseurs", status: "built", icon: "green", link: "selection-suivi-fournisseurs-ascalis.html" },
    { key: "comparateur-fournisseurs", name: "Comparateur fournisseurs", desc: "Comparaison statistique", status: "built", icon: "green", link: "comparateur-statistique-fournisseurs-ascalis.html" },
    { key: "cartographie-processus", name: "Cartographie processus", desc: "Cartographie interactive", status: "built", icon: "green", link: "cartographie-processus-ascalis.html" },
    { key: "fiche-identite-processus", name: "Fiche identité processus", desc: "Fiche processus standard", status: "built", icon: "green", link: "fiche-identite-processus-ascalis.html" },
    { key: "plan-action-central", name: "Plan d'action central", desc: "Suivi plan d'actions global", status: "built", icon: "green", link: "plan-action-central-ascalis.html" },
    { key: "tableau-bord-qualite", name: "Tableau de bord qualité", desc: "KPI qualité temps réel", status: "built", icon: "green", link: "tableau-bord-qualite-ascalis.html" },
    { key: "revue-processus", name: "Revue de processus", desc: "Revue périodique processus", status: "built", icon: "green", link: "revue-processus-ascalis.html" },
    { key: "revue-direction", name: "Revue de direction", desc: "Revue de direction annuelle", status: "built", icon: "green", link: "revue-direction-ascalis.html" },
    { key: "matrice-hoshin", name: "Matrice Hoshin", desc: "Déploiement stratégie Hoshin", status: "built", icon: "green", link: "matrice-hoshin-ascalis.html" },
    { key: "diagramme-kano", name: "Diagramme de Kano", desc: "Priorisation des attentes client", status: "built", icon: "green", link: "diagramme-kano-ascalis.html" },
    { key: "parcours-client", name: "Parcours client", desc: "Cartographie expérience client", status: "built", icon: "green", link: "parcours-client-ascalis.html" },
    { key: "matrice-croissance", name: "Matrice de croissance", desc: "Analyse initiatives de croissance", status: "built", icon: "green", link: "matrice-croissance-ascalis.html" },
    { key: "audit-maturite-digitale", name: "Audit maturité digitale", desc: "Diagnostic + feuille de route", status: "built", icon: "green", link: "audit-maturite-digitale-feuille-route-ascalis.html" }
  ],
  free: [
    { key: "calculateur-cnq", name: "Calculateur CNQ", desc: "Coûts de non-qualité", status: "built", icon: "copper", link: "calculateur-cnq.html" },
    { key: "checklist-audit", name: "Checklist pré-audit", desc: "ISO 9001 / EN 9100", status: "built", icon: "copper", link: "checklist-audit.html" },
    { key: "matrice-priorisation", name: "Matrice priorisation", desc: "Impact vs. Effort", status: "built", icon: "copper", link: "matrice-priorisation.html" },
    { key: "score-documentaire", name: "Score documentaire", desc: "Maturité documentaire", status: "built", icon: "copper", link: "score-documentaire.html" },
    { key: "simulateur-roi", name: "Simulateur ROI", desc: "ROI automatisation qualité", status: "built", icon: "copper", link: "simulateur-roi.html" },
    { key: "seuil-rentabilite", name: "Seuil de rentabilité", desc: "Point mort & volume min", status: "built", icon: "copper", link: "seuil-rentabilite.html" },
    { key: "simulateur-prix", name: "Simulateur prix", desc: "Prix de vente optimal", status: "built", icon: "copper", link: "simulateur-prix.html" },
    { key: "diagnostic-dirigeant", name: "Diagnostic dirigeant", desc: "Radar de profil", status: "built", icon: "copper", link: "diagnostic-dirigeant.html" },
    { key: "dashboard-dirigeant", name: "Dashboard dirigeant", desc: "KPI essentiels PME", status: "soon", icon: "blue" }
  ]
};

export function applyAbaqueOverrides(tool) {
  const override = ABAQUE_TOOL_OVERRIDES[tool.name];
  if (!override) return tool;
  return { ...tool, ...override };
}

export function getDashboardTools(role = "client") {
  const pro = role === "admin"
    ? DASHBOARD_LIBRARY.pro.slice()
    : DASHBOARD_LIBRARY.pro.filter((tool) => !tool.adminOnly);
  return { pro, free: DASHBOARD_LIBRARY.free.slice() };
}

export function countByStatus(tools, status) {
  return tools.filter((tool) => tool.status === status).length;
}

export function getDashboardSummary(role = "client") {
  const { pro, free } = getDashboardTools(role);
  const all = [...pro, ...free];
  return {
    proCount: pro.length,
    freeCount: free.length,
    totalCount: all.length,
    builtCount: countByStatus(all, "built"),
    pendingCount: countByStatus(all, "soon") + countByStatus(all, "planned")
  };
}
