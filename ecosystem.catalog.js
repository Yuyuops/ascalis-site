export const ASCALIS_OFFERS = {
  1: "Diagnostic Flash Qualité",
  2: "Remise en conformité documentaire",
  3: "NC récurrentes : traitement à la racine",
  4: "Structuration du SMQ",
  5: "Automatisation des processus qualité",
  6: "Accompagnement performance continue",
  7: "Diagnostic Performance & Maturité Numérique",
  8: "Structuration opérationnelle PME"
};

export const ASCALIS_STAGES = [
  { id: "probleme", label: "Problème", description: "Formaliser le point de départ réel" },
  { id: "diagnostic", label: "Diagnostic", description: "Évaluer la situation actuelle" },
  { id: "analyse", label: "Analyse", description: "Comprendre les causes, écarts et priorités" },
  { id: "decision", label: "Décision", description: "Choisir quoi faire et dans quel ordre" },
  { id: "action", label: "Action", description: "Déployer les actions" },
  { id: "controle", label: "Contrôle", description: "Mesurer l’effet et surveiller" },
  { id: "revue", label: "Revue", description: "Arbitrer et relancer le système" }
];

export const ASCALIS_PARCOURS = {
  "parcours-1": {
    title: "Problème qualité / NC / réclamation",
    problem: "Des non-conformités, réclamations ou défauts se répètent.",
    offers: [1, 3, 5, 6],
    tools: ["diagnostic-terrain.html", "checklist-audit.html", "grille-audit.html", "pareto.html", "ishikawa.html", "fiche-8d.html", "plan-action-central-ascalis.html", "tableau-bord-qualite-ascalis.html", "revue-processus-ascalis.html", "revue-direction-ascalis.html"]
  },
  "parcours-2": {
    title: "Documentation / conformité / SMQ",
    problem: "La documentation est confuse, incomplète ou déconnectée du terrain.",
    offers: [1, 2, 4, 6],
    tools: ["score-documentaire.html", "matrice-documentaire-ascalis.html", "cartographie-processus-ascalis.html", "fiche-identite-processus-ascalis.html", "plan-action-central-ascalis.html", "revue-processus-ascalis.html", "revue-direction-ascalis.html"]
  },
  "parcours-3": {
    title: "Pilotage de la performance",
    problem: "Les objectifs existent mais ne sont ni déployés ni reliés aux processus.",
    offers: [4, 5, 6, 7],
    tools: ["matrice-hoshin-ascalis.html", "cartographie-processus-ascalis.html", "fiche-identite-processus-ascalis.html", "tableau-bord-qualite-ascalis.html", "plan-action-central-ascalis.html", "revue-processus-ascalis.html", "revue-direction-ascalis.html"]
  },
  "parcours-4": {
    title: "Maturité digitale / transformation",
    problem: "Les priorités digitales sont floues et les investissements mal arbitrés.",
    offers: [5, 7, 8],
    tools: ["diagnostic-dirigeant.html", "audit-maturite-digitale-feuille-route-ascalis.html", "matrice-croissance-ascalis.html", "simulateur-roi.html", "matrice-hoshin-ascalis.html", "plan-action-central-ascalis.html", "tableau-bord-qualite-ascalis.html", "revue-direction-ascalis.html"]
  },
  "parcours-5": {
    title: "Fournisseurs / sous-traitants",
    problem: "La performance fournisseurs est mal suivie et le contrôle n’est pas stabilisé.",
    offers: [3, 4, 5, 6],
    tools: ["selection-suivi-fournisseurs-ascalis.html", "comparateur-statistique-fournisseurs-ascalis.html", "plan-controle.html", "tableau-bord-qualite-ascalis.html", "revue-processus-ascalis.html", "revue-direction-ascalis.html"]
  },
  "parcours-6": {
    title: "Voix du client / valeur / expérience",
    problem: "Les attentes client sont mal traduites en décisions de valeur.",
    offers: [7, 8],
    tools: ["parcours-client-ascalis.html", "diagramme-kano-ascalis.html", "matrice-qualite.html", "matrice-croissance-ascalis.html", "plan-action-central-ascalis.html", "tableau-bord-qualite-ascalis.html"]
  }
};

export const ASCALIS_PROBLEM_ENTRIES = {
  "nc-reclamation": { label: "NC / réclamation / défaut récurrent", parcours: "parcours-1", offerIds: [1, 3, 6], startTool: "diagnostic-terrain.html" },
  "documentation-smq": { label: "Documentation / conformité / audit", parcours: "parcours-2", offerIds: [2, 4], startTool: "score-documentaire.html" },
  "pilotage-performance": { label: "Pilotage / objectifs / indicateurs", parcours: "parcours-3", offerIds: [4, 6, 7], startTool: "matrice-hoshin-ascalis.html" },
  "transformation-digitale": { label: "Maturité digitale / transformation", parcours: "parcours-4", offerIds: [5, 7, 8], startTool: "diagnostic-dirigeant.html" },
  "fournisseurs": { label: "Fournisseurs / sous-traitants", parcours: "parcours-5", offerIds: [3, 5], startTool: "selection-suivi-fournisseurs-ascalis.html" },
  "voix-client": { label: "Voix du client / valeur / expérience", parcours: "parcours-6", offerIds: [7, 8], startTool: "parcours-client-ascalis.html" }
};

export const ASCALIS_TOOLS = {
  "diagnostic-terrain.html": { name: "Diagnostic terrain", stage: "diagnostic", offers: [1, 3, 7], parcours: ["parcours-1"], process: "Production / opérations", problem: "Des écarts sont visibles mais mal qualifiés.", why: "Poser un état des lieux terrain avant de traiter à l’aveugle.", when: "Au démarrage d’un problème récurrent ou d’un chantier de performance.", inputs: ["Observations", "Écarts", "Interviews", "Données qualité"], outputs: ["Constats", "Radar", "Hypothèses", "Écarts structurés"], pilot: "Qualité / production", previous: null, next: "checklist-audit.html" },
  "checklist-audit.html": { name: "Checklist pré-audit", stage: "diagnostic", offers: [1, 2, 4], parcours: ["parcours-1", "parcours-2"], process: "SMQ / conformité", problem: "Un audit arrive et personne ne sait où ça coince.", why: "Vérifier vite la conformité attendue.", when: "Avant audit ou revue documentaire.", inputs: ["Référentiel", "Documents", "Pratiques terrain"], outputs: ["Écarts", "Préparation", "Points manquants"], pilot: "Responsable qualité", previous: "diagnostic-terrain.html", next: "grille-audit.html" },
  "grille-audit.html": { name: "Grille d’audit", stage: "diagnostic", offers: [1, 2, 4], parcours: ["parcours-1", "parcours-2"], process: "Audit / conformité", problem: "Les écarts sont supposés, pas prouvés.", why: "Passer d’une intuition à une évaluation traçable.", when: "Pendant audit blanc ou revue de conformité.", inputs: ["Référentiel", "Preuves", "Interviews"], outputs: ["Constats", "Écarts", "Pistes d’actions"], pilot: "Auditeur / qualité", previous: "checklist-audit.html", next: "pareto.html" },
  "pareto.html": { name: "Pareto interactif", stage: "analyse", offers: [3, 6], parcours: ["parcours-1"], process: "Qualité / amélioration", problem: "Trop de problèmes à la fois.", why: "Concentrer l’effort sur les quelques causes qui pèsent le plus.", when: "Quand il faut arbitrer entre plusieurs défauts ou causes.", inputs: ["Occurrences", "Coûts", "Familles de défauts"], outputs: ["Priorités", "Top contributeurs"], pilot: "Qualité / amélioration", previous: "grille-audit.html", next: "ishikawa.html" },
  "ishikawa.html": { name: "Ishikawa interactif", stage: "analyse", offers: [3, 6], parcours: ["parcours-1"], process: "Résolution de problème", problem: "On traite les symptômes au lieu des causes.", why: "Structurer l’analyse causale.", when: "Après avoir confirmé le problème à traiter.", inputs: ["Problème formulé", "Données", "Participants métier"], outputs: ["Causes potentielles", "Pistes d’investigation"], pilot: "Animateur résolution de problème", previous: "pareto.html", next: "fiche-8d.html" },
  "fiche-8d.html": { name: "Fiche 8D", stage: "action", offers: [3, 6], parcours: ["parcours-1"], process: "Traitement NC", problem: "Une NC revient parce qu’elle n’est jamais traitée jusqu’au bout.", why: "Piloter le traitement à la racine d’une NC.", when: "Sur NC importante, récurrente ou client.", inputs: ["Description NC", "Analyse", "Actions", "Équipe"], outputs: ["Plan 8D", "Traçabilité", "Validation d’efficacité"], pilot: "Qualité / pilote 8D", previous: "ishikawa.html", next: "plan-action-central-ascalis.html" },
  "plan-action-central-ascalis.html": { name: "Plan d’action central", stage: "action", offers: [3, 4, 5, 6, 7, 8], parcours: ["parcours-1", "parcours-2", "parcours-3", "parcours-4", "parcours-6"], process: "Pilotage transverse", problem: "Les décisions meurent dans les comptes-rendus.", why: "Transformer les décisions en exécution suivie.", when: "Dès qu’un parcours produit des actions à piloter.", inputs: ["Actions", "Responsables", "Échéances", "Priorités"], outputs: ["Plan consolidé", "Suivi", "Relances"], pilot: "Pilote de processus / direction", previous: "fiche-8d.html", next: "tableau-bord-qualite-ascalis.html" },
  "tableau-bord-qualite-ascalis.html": { name: "Tableau de bord qualité", stage: "controle", offers: [5, 6, 7, 8], parcours: ["parcours-1", "parcours-3", "parcours-4", "parcours-5", "parcours-6"], process: "Pilotage / qualité", problem: "On agit mais personne ne sait si ça marche.", why: "Suivre l’effet réel des actions.", when: "Une fois les actions lancées et les données structurées.", inputs: ["Indicateurs", "Périodes", "Seuils", "Données"], outputs: ["KPI", "Alertes", "Tendances"], pilot: "Qualité / direction", previous: "plan-action-central-ascalis.html", next: "revue-processus-ascalis.html" },
  "revue-processus-ascalis.html": { name: "Revue de processus", stage: "revue", offers: [4, 6], parcours: ["parcours-1", "parcours-2", "parcours-3", "parcours-5"], process: "Pilotage processus", problem: "Le processus tourne mais personne ne le revoit sérieusement.", why: "Faire le point sur résultats, écarts et actions.", when: "Périodiquement ou après un cycle d’actions.", inputs: ["Indicateurs", "Écarts", "Actions", "Risques"], outputs: ["Décisions", "Compte-rendu", "Relances"], pilot: "Pilote de processus", previous: "tableau-bord-qualite-ascalis.html", next: "revue-direction-ascalis.html" },
  "revue-direction-ascalis.html": { name: "Revue de direction", stage: "revue", offers: [4, 6, 7, 8], parcours: ["parcours-1", "parcours-2", "parcours-3", "parcours-4", "parcours-5"], process: "Direction / gouvernance", problem: "La direction décide sans vision consolidée.", why: "Arbitrer à froid avec une vision système.", when: "Après revues processus ou bilan d’un parcours.", inputs: ["Résultats consolidés", "Indicateurs", "Risques"], outputs: ["Arbitrages", "Nouvelles priorités", "Actions"], pilot: "Direction", previous: "revue-processus-ascalis.html", next: null },
  "score-documentaire.html": { name: "Score documentaire", stage: "diagnostic", offers: [2, 4], parcours: ["parcours-2"], process: "Documentation / SMQ", problem: "Les documents existent mais ne tiennent pas le système.", why: "Mesurer la maturité documentaire avant de produire plus de papier.", when: "Au début d’un chantier documentaire.", inputs: ["Liste documentaire", "Échantillon", "Règles"], outputs: ["Score", "Faiblesses", "Priorités"], pilot: "Qualité / documentation", previous: null, next: "matrice-documentaire-ascalis.html" },
  "matrice-documentaire-ascalis.html": { name: "Matrice documentaire", stage: "analyse", offers: [2, 4], parcours: ["parcours-2"], process: "Documentation / SMQ", problem: "Personne ne sait quels documents manquent ou font doublon.", why: "Visualiser les documents attendus et leur état.", when: "Après le diagnostic documentaire.", inputs: ["Processus", "Documents", "Référentiel"], outputs: ["Matrice", "Manques", "Responsables"], pilot: "Qualité / GED", previous: "score-documentaire.html", next: "cartographie-processus-ascalis.html" },
  "cartographie-processus-ascalis.html": { name: "Cartographie processus", stage: "diagnostic", offers: [4, 7], parcours: ["parcours-2", "parcours-3"], process: "Pilotage / SMQ", problem: "Le système est piloté par habitude.", why: "Donner une vue claire des processus et interfaces.", when: "Dès qu’il faut structurer un SMQ ou un pilotage.", inputs: ["Périmètre", "Activités", "Interfaces"], outputs: ["Carte des processus", "Vision d’ensemble"], pilot: "Qualité / direction", previous: "matrice-documentaire-ascalis.html", next: "fiche-identite-processus-ascalis.html" },
  "fiche-identite-processus-ascalis.html": { name: "Fiche identité processus", stage: "analyse", offers: [4, 6], parcours: ["parcours-2", "parcours-3"], process: "Pilotage processus", problem: "Le processus existe, mais pas sa logique de pilotage.", why: "Formaliser finalité, pilote, indicateurs et risques.", when: "Après la cartographie.", inputs: ["Processus", "Objectifs", "Indicateurs"], outputs: ["Fiche processus", "Pilotage clarifié"], pilot: "Pilote de processus", previous: "cartographie-processus-ascalis.html", next: "plan-action-central-ascalis.html" },
  "matrice-hoshin-ascalis.html": { name: "Matrice Hoshin", stage: "decision", offers: [6, 7, 8], parcours: ["parcours-3", "parcours-4"], process: "Stratégie / pilotage", problem: "Les objectifs existent en slides mais ne pilotent rien.", why: "Relier stratégie, processus, actions et indicateurs.", when: "Quand il faut déployer une stratégie sérieusement.", inputs: ["Axes", "Objectifs", "KPI", "Projets"], outputs: ["Alignement", "Déploiement", "Priorités"], pilot: "Direction / performance", previous: null, next: "cartographie-processus-ascalis.html" },
  "diagnostic-dirigeant.html": { name: "Diagnostic dirigeant", stage: "diagnostic", offers: [7, 8], parcours: ["parcours-4"], process: "Direction / organisation", problem: "L’entreprise tient trop sur le dirigeant.", why: "Qualifier la maturité de pilotage avant de transformer.", when: "Au démarrage d’un chantier de structuration PME ou digital.", inputs: ["Réponses dirigeant", "Organisation actuelle"], outputs: ["Radar", "Priorités", "Points d’attention"], pilot: "Dirigeant / consultant", previous: null, next: "audit-maturite-digitale-feuille-route-ascalis.html" },
  "audit-maturite-digitale-feuille-route-ascalis.html": { name: "Audit maturité digitale", stage: "analyse", offers: [5, 7, 8], parcours: ["parcours-4"], process: "Transformation / digital", problem: "On veut digitaliser sans savoir quoi ni pourquoi.", why: "Évaluer la maturité digitale réelle.", when: "Avant tout investissement digital important.", inputs: ["Outils", "Usages", "Friction"], outputs: ["Diagnostic", "Feuille de route", "Chantiers"], pilot: "Direction / transformation", previous: "diagnostic-dirigeant.html", next: "matrice-croissance-ascalis.html" },
  "matrice-croissance-ascalis.html": { name: "Matrice de croissance", stage: "decision", offers: [7, 8], parcours: ["parcours-4", "parcours-6"], process: "Développement / stratégie", problem: "Trop d’idées, pas assez de capacité.", why: "Comparer gains, risques et effort.", when: "Quand plusieurs pistes existent et qu’il faut arbitrer.", inputs: ["Opportunités", "Efforts", "Risques"], outputs: ["Classement", "Décision", "Priorités"], pilot: "Direction", previous: "audit-maturite-digitale-feuille-route-ascalis.html", next: "simulateur-roi.html" },
  "simulateur-roi.html": { name: "Simulateur ROI", stage: "decision", offers: [5, 7], parcours: ["parcours-4"], process: "Transformation / finance", problem: "Le gain annoncé reste flou.", why: "Tester la valeur attendue d’une automatisation.", when: "Avant investissement ou arbitrage digital.", inputs: ["Temps", "Coûts", "Hypothèses"], outputs: ["ROI", "Retour sur investissement"], pilot: "Direction / finance", previous: "matrice-croissance-ascalis.html", next: "matrice-hoshin-ascalis.html" },
  "selection-suivi-fournisseurs-ascalis.html": { name: "Sélection et suivi fournisseurs", stage: "diagnostic", offers: [3, 4, 5], parcours: ["parcours-5"], process: "Achats / fournisseurs", problem: "Les fournisseurs posent problème mais rien n’est objectivé.", why: "Structurer l’évaluation fournisseurs.", when: "Quand il faut sélectionner, requalifier ou suivre des fournisseurs.", inputs: ["Critères", "Historique", "Périmètre"], outputs: ["Évaluation", "Suivi", "Priorisation"], pilot: "Achats / qualité fournisseurs", previous: null, next: "comparateur-statistique-fournisseurs-ascalis.html" },
  "comparateur-statistique-fournisseurs-ascalis.html": { name: "Comparateur statistique fournisseurs", stage: "analyse", offers: [5, 8], parcours: ["parcours-5"], process: "Achats / fournisseurs", problem: "Personne ne tranche sur des bases stables.", why: "Comparer les fournisseurs avec des données.", when: "Après collecte des données comparatives.", inputs: ["Données", "Critères"], outputs: ["Classement", "Comparaison", "Choix"], pilot: "Achats / qualité", previous: "selection-suivi-fournisseurs-ascalis.html", next: "plan-controle.html" },
  "plan-controle.html": { name: "Plan de contrôle", stage: "action", offers: [3, 5], parcours: ["parcours-5"], process: "Contrôle / fournisseurs", problem: "Le contrôle est dans les têtes, pas dans le système.", why: "Formaliser le contrôle attendu.", when: "Après décision sur le dispositif de maîtrise.", inputs: ["Exigences", "Points de contrôle", "Criticité"], outputs: ["Plan de contrôle", "Fréquences", "Preuves"], pilot: "Qualité / production / fournisseurs", previous: "comparateur-statistique-fournisseurs-ascalis.html", next: "tableau-bord-qualite-ascalis.html" },
  "parcours-client-ascalis.html": { name: "Parcours client", stage: "diagnostic", offers: [7, 8], parcours: ["parcours-6"], process: "Client / expérience", problem: "On parle du client sans voir son parcours réel.", why: "Visualiser l’expérience client réelle.", when: "Quand on veut traduire la voix du client en décision.", inputs: ["Étapes client", "Verbatims", "Friction"], outputs: ["Carte du parcours", "Douleurs", "Moments de vérité"], pilot: "Direction / commercial / qualité", previous: null, next: "diagramme-kano-ascalis.html" },
  "diagramme-kano-ascalis.html": { name: "Diagramme de Kano", stage: "analyse", offers: [7, 8], parcours: ["parcours-6"], process: "Client / offre", problem: "Tout semble important, donc rien n’est priorisé.", why: "Classer les attentes client par type de valeur.", when: "Après collecte des besoins.", inputs: ["Attentes", "Hypothèses", "Éléments d’offre"], outputs: ["Priorités Kano", "Lecture des attentes"], pilot: "Direction / marketing / qualité", previous: "parcours-client-ascalis.html", next: "matrice-qualite.html" },
  "matrice-qualite.html": { name: "Matrice de la qualité", stage: "decision", offers: [7, 8], parcours: ["parcours-6"], process: "Client / conception / offre", problem: "Les attentes client sont mal traduites en exigences.", why: "Transformer la voix du client en exigences arbitrables.", when: "Quand il faut passer des attentes aux décisions de conception / service.", inputs: ["Besoins", "Critères", "Contraintes"], outputs: ["Matrice qualité", "Décisions de valeur"], pilot: "Direction / produit / qualité", previous: "diagramme-kano-ascalis.html", next: "matrice-croissance-ascalis.html" },
  "dmaic-navigator.html": { name: "DMAIC Navigator", stage: "analyse", offers: [3, 6, 7], parcours: ["parcours-1", "parcours-3"], process: "Amélioration continue", problem: "On saute des étapes et les chantiers s’essoufflent.", why: "Structurer un chantier selon une logique DMAIC robuste.", when: "Quand un problème complexe demande une progression méthodique.", inputs: ["Problème cadré", "Données", "Hypothèses"], outputs: ["Cadre DMAIC", "Séquençage"], pilot: "Pilote amélioration", previous: null, next: null }
};

export function getOfferName(id) { return ASCALIS_OFFERS[id] || `Offre ${id}`; }
export function getParcours(id) { return ASCALIS_PARCOURS[id] || null; }
export function getStage(id) { return ASCALIS_STAGES.find((stage) => stage.id === id) || null; }
export function getProblemEntry(id) { return ASCALIS_PROBLEM_ENTRIES[id] || null; }
export function getTool(file) { return ASCALIS_TOOLS[file] || null; }
export function getToolsForOffer(offerId) { return Object.entries(ASCALIS_TOOLS).filter(([, tool]) => (tool.offers || []).includes(Number(offerId))).map(([file, tool]) => ({ file, ...tool })); }
export function getToolsForStage(stageId) { return Object.entries(ASCALIS_TOOLS).filter(([, tool]) => tool.stage === stageId).map(([file, tool]) => ({ file, ...tool })); }
export function getRecommendedChain(file) {
  const tool = getTool(file);
  if (!tool) return null;
  return {
    current: { file, ...tool },
    previous: tool.previous ? { file: tool.previous, ...getTool(tool.previous) } : null,
    next: tool.next ? { file: tool.next, ...getTool(tool.next) } : null,
    parcours: (tool.parcours || []).map((id) => ({ id, ...getParcours(id) }))
  };
}
