export const DASHBOARD_LIBRARY = {
  pro: [
    { key: 'diag-terrain', name: 'Diagnostic terrain', desc: 'Grille 8 domaines + radar', status: 'built', icon: 'green', link: 'diagnostic-terrain.html' },
    { key: 'fiche-8d', name: 'Fiche 8D', desc: 'Résolution de problème 8 disciplines', status: 'built', icon: 'green', link: 'fiche-8d.html' },
    { key: 'grille-audit', name: "Grille d'audit à blanc", desc: 'ISO 9001 / EN 9100', status: 'built', icon: 'green', link: 'grille-audit.html', adminOnly: true },
    { key: 'plan-controle', name: 'Plan de contrôle', desc: 'Tableau éditable + export CSV', status: 'built', icon: 'green', link: 'plan-controle.html', adminOnly: true },
    { key: 'pareto', name: 'Pareto interactif', desc: 'Analyse fréquence / impact', status: 'built', icon: 'green', link: 'pareto.html' },
    { key: 'vsm', name: 'VSM — Cartographie', desc: 'Chaîne de valeur interactive', status: 'built', icon: 'green', link: 'vsm.html' },
    { key: 'sipoc', name: 'SIPOC', desc: 'Vue macro processus', status: 'built', icon: 'green', link: 'sipoc.html' },
    { key: 'ishikawa', name: 'Ishikawa interactif', desc: '5M+1 standalone', status: 'built', icon: 'green', link: 'ishikawa.html' },
    { key: 'spc', name: 'SPC / Cartes de contrôle', desc: 'Contrôle statistique', status: 'built', icon: 'green', link: 'spc.html' },
    { key: 'selection-fournisseurs', name: 'Sélection fournisseurs', desc: 'Suivi & évaluation fournisseurs', status: 'built', icon: 'green', link: 'selection-suivi-fournisseurs-ascalis.html' },
    { key: 'comparateur-fournisseurs', name: 'Comparateur fournisseurs', desc: 'Comparaison statistique', status: 'built', icon: 'green', link: 'comparateur-statistique-fournisseurs-ascalis.html' },
    { key: 'cartographie-processus', name: 'Cartographie processus', desc: 'Cartographie interactive', status: 'built', icon: 'green', link: 'cartographie-processus-ascalis.html' },
    { key: 'fiche-identite-processus', name: 'Fiche identité processus', desc: 'Fiche processus standard', status: 'built', icon: 'green', link: 'fiche-identite-processus-ascalis.html' },
    { key: 'plan-action-central', name: "Plan d'action central", desc: "Suivi plan d'actions global", status: 'built', icon: 'green', link: 'plan-action-central-ascalis.html' },
    { key: 'tableau-bord-qualite', name: 'Tableau de bord qualité', desc: 'KPI qualité temps réel', status: 'built', icon: 'green', link: 'tableau-bord-qualite-ascalis.html' },
    { key: 'revue-processus', name: 'Revue de processus', desc: 'Revue périodique processus', status: 'built', icon: 'green', link: 'revue-processus-ascalis.html' },
    { key: 'revue-direction', name: 'Revue de direction', desc: 'Revue de direction annuelle', status: 'built', icon: 'green', link: 'revue-direction-ascalis.html' },
    { key: 'matrice-hoshin', name: 'Matrice Hoshin', desc: 'Déploiement stratégie Hoshin', status: 'built', icon: 'green', link: 'matrice-hoshin-ascalis.html' },
    { key: 'diagramme-kano', name: 'Diagramme de Kano', desc: 'Priorisation des attentes client', status: 'built', icon: 'green', link: 'diagramme-kano-ascalis.html' },
    { key: 'parcours-client', name: 'Parcours client', desc: 'Cartographie expérience client', status: 'built', icon: 'green', link: 'parcours-client-ascalis.html' },
    { key: 'matrice-croissance', name: 'Matrice de croissance', desc: 'Analyse initiatives de croissance', status: 'built', icon: 'green', link: 'matrice-croissance-ascalis.html' },
    { key: 'audit-maturite-digitale', name: 'Audit maturité digitale', desc: 'Diagnostic + feuille de route', status: 'built', icon: 'green', link: 'audit-maturite-digitale-feuille-route-ascalis.html' }
  ],
  free: [
    { key: 'calculateur-cnq', name: 'Calculateur CNQ', desc: 'Coûts de non-qualité', status: 'built', icon: 'copper', link: 'calculateur-cnq.html' },
    { key: 'checklist-audit', name: 'Checklist pré-audit', desc: 'ISO 9001 / EN 9100', status: 'built', icon: 'copper', link: 'checklist-audit.html' },
    { key: 'matrice-priorisation', name: 'Matrice priorisation', desc: 'Impact vs. Effort', status: 'built', icon: 'copper', link: 'matrice-priorisation.html' },
    { key: 'score-documentaire', name: 'Score documentaire', desc: 'Maturité documentaire', status: 'built', icon: 'copper', link: 'score-documentaire.html' },
    { key: 'simulateur-roi', name: 'Simulateur ROI', desc: 'ROI automatisation qualité', status: 'built', icon: 'copper', link: 'simulateur-roi.html' },
    { key: 'seuil-rentabilite', name: 'Seuil de rentabilité', desc: 'Point mort & volume min', status: 'built', icon: 'copper', link: 'seuil-rentabilite.html' },
    { key: 'simulateur-prix', name: 'Simulateur prix', desc: 'Prix de vente optimal', status: 'built', icon: 'copper', link: 'simulateur-prix.html' },
    { key: 'diagnostic-dirigeant', name: 'Diagnostic dirigeant', desc: 'Radar de profil', status: 'built', icon: 'copper', link: 'diagnostic-dirigeant.html' },
    { key: 'dashboard-dirigeant', name: 'Dashboard dirigeant', desc: 'KPI essentiels PME', status: 'soon', icon: 'blue' }
  ]
};

export function getDashboardTools(role = 'client') {
  const pro = role === 'admin'
    ? DASHBOARD_LIBRARY.pro.slice()
    : DASHBOARD_LIBRARY.pro.filter(tool => !tool.adminOnly);
  return { pro, free: DASHBOARD_LIBRARY.free.slice() };
}

export function countByStatus(tools, status) {
  return tools.filter(tool => tool.status === status).length;
}

export function getDashboardSummary(role = 'client') {
  const { pro, free } = getDashboardTools(role);
  const all = [...pro, ...free];
  return {
    proCount: pro.length,
    freeCount: free.length,
    totalCount: all.length,
    builtCount: countByStatus(all, 'built'),
    pendingCount: countByStatus(all, 'soon') + countByStatus(all, 'planned')
  };
}
