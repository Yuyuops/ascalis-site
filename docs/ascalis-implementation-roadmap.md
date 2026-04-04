# ASCALIS — Implementation roadmap

## Objectif

Mettre en place un socle propre pour faire évoluer ASCALIS vers une mini-app multi-client, sans casser les outils HTML existants ni imposer une refonte front lourde.

## Principe de déploiement

- on pose d'abord la donnée, l'auth et la sécurité
- on branche ensuite progressivement les outils les plus structurants
- on garde toujours un mode autonome comme filet de sécurité

---

## Phase 1 — Socle sécurisé et pilotage central

### Périmètre

- auth Supabase
- `profiles`
- `organizations`
- `organization_memberships`
- `workspaces`
- `workspace_memberships`
- `projects`
- `processes`
- `process_steps`
- `issues`
- `actions`
- `kpis`
- `kpi_measurements`
- `reviews`
- `review_decisions`

### But

Créer la colonne vertébrale du pilotage ASCALIS.

### Outils à brancher en priorité

1. `cartographie-processus-ascalis.html`
2. `fiche-identite-processus-ascalis.html`
3. `plan-action-central-ascalis.html`
4. `tableau-bord-qualite-ascalis.html`
5. `revue-processus-ascalis.html`
6. `revue-direction-ascalis.html`

### Ordre précis

#### Étape 1 — Auth et contexte tenant

- login Supabase
- récupération du profil utilisateur
- chargement des organisations accessibles
- chargement des workspaces accessibles
- sélection d'un workspace actif côté UI

#### Étape 2 — Projet actif

- création / choix d'un projet
- attachement du projet à une offre et à un parcours
- stockage du `project_id` courant comme contexte de navigation

#### Étape 3 — Cartographie des processus

`cartographie-processus-ascalis.html`

Lit / écrit :
- `processes`
- éventuellement `process_steps`

Mode connecté :
- chargement des processus du projet
- création / modification / archivage de processus

Mode autonome :
- fonctionnement actuel conservé

#### Étape 4 — Fiche identité processus

`fiche-identite-processus-ascalis.html`

Lit :
- `processes`
- `kpis`
- `actions`
- `reviews`
- `issues`

Écrit :
- enrichissement du processus
- création éventuelle de KPI de processus

#### Étape 5 — Plan d'action central

`plan-action-central-ascalis.html`

Lit / écrit :
- `actions`
- liens vers `issues`, `processes`, `reviews`

C'est la première vraie table transverse.
Elle devient la charnière entre diagnostic, décisions, pilotage et revue.

#### Étape 6 — Tableau de bord qualité

`tableau-bord-qualite-ascalis.html`

Lit :
- `kpis`
- `kpi_measurements`
- `actions`
- `issues`
- `reviews`

Écrit éventuellement :
- nouvelles mesures KPI

Le tableau de bord doit surtout lire de la donnée maître et de la donnée dérivée, pas devenir un tableur parallèle.

#### Étape 7 — Revue de processus

`revue-processus-ascalis.html`

Lit :
- `processes`
- `kpis`
- `actions`
- `issues`
- `audits` plus tard

Écrit :
- `reviews`
- `review_decisions`

#### Étape 8 — Revue de direction

`revue-direction-ascalis.html`

Lit :
- synthèse multi-processus
- KPI consolidés
- actions critiques
- décisions de revues processus

Écrit :
- `reviews`
- `review_decisions`
- actions système si nécessaire

### Critère de sortie phase 1

On doit pouvoir démontrer le cycle complet :

processus → action → KPI → revue processus → revue direction

---

## Phase 2 — Audit, documentation, fournisseurs

### Périmètre

- `audits`
- `audit_findings`
- `documents`
- `suppliers`
- `supplier_assessments`

### But

Rattacher les briques de conformité, preuve et évaluation externe au noyau déjà créé.

### Effets attendus

- les audits alimentent les issues ou findings
- les documents deviennent pilotables par projet / processus
- les fournisseurs alimentent décisions et plans d'action

### Outils candidats à brancher ensuite

- `grille-audit.html`
- `score-documentaire.html`
- `matrice-documentaire-ascalis.html`
- `selection-suivi-fournisseurs-ascalis.html`
- `comparateur-statistique-fournisseurs-ascalis.html`
- `plan-controle.html`

### Critère de sortie phase 2

On doit pouvoir tracer :

audit / document / fournisseur → constat → action → KPI / revue

---

## Phase 3 — Voix du client / valeur

### Périmètre

- `customer_needs`
- `customer_journey_items`

### But

Brancher la logique voix du client / valeur sans polluer le socle initial.

### Outils candidats

- `parcours-client-ascalis.html`
- `diagramme-kano-ascalis.html`
- `matrice-qualite.html`

### Critère de sortie phase 3

On doit pouvoir relier :

besoin client → parcours → arbitrage → action → KPI / revue

---

## Règles de branchement outil par outil

### Règle 1

Toujours commencer par lecture seule.

### Règle 2

Conserver le mode autonome tant que le mode connecté n'est pas stabilisé.

### Règle 3

Ne jamais faire d'un outil une source de vérité parallèle si la donnée existe déjà dans Supabase.

### Règle 4

Les écritures sensibles ou multi-tables passent par Netlify Functions.

---

## Ce que consomment les 6 outils prioritaires

### 1. cartographie-processus-ascalis.html

**Source maître :** `processes`

Consomme :
- liste des processus du projet
- codes / finalités / statuts

Produit :
- création / mise à jour / archivage de processus

### 2. fiche-identite-processus-ascalis.html

**Source maître :** `processes`

Consomme :
- processus sélectionné
- KPI liés
- actions liées
- revues liées

Produit :
- enrichissement du process
- standard de pilotage

### 3. plan-action-central-ascalis.html

**Source maître :** `actions`

Consomme :
- actions du projet
- contexte process / issue / review

Produit :
- nouvelles actions
- statuts
- responsables
- échéances

### 4. tableau-bord-qualite-ascalis.html

**Source maître :** `kpis`, `kpi_measurements`

Consomme :
- KPI projet / processus
- mesures
- avancement actions

Produit :
- éventuellement saisie de mesures
- vues dérivées uniquement

### 5. revue-processus-ascalis.html

**Source maître :** `reviews`, `review_decisions`

Consomme :
- processus
- KPI
- actions
- issues

Produit :
- revue processus
- décisions
- actions de relance

### 6. revue-direction-ascalis.html

**Source maître :** `reviews`, `review_decisions`

Consomme :
- synthèse multi-processus
- KPI consolidés
- décisions précédentes

Produit :
- arbitrages direction
- décisions système
- actions transverses

---

## Recommandation pratique

Commencer par un seul workspace de démonstration et un seul projet client réel ou fictif.

Ne cherche pas à brancher dix outils à la fois.
Branche d'abord le noyau qui crée la continuité métier.
C'est lui qui donnera de la valeur au reste.
