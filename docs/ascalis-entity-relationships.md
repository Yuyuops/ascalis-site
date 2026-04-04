# ASCALIS — Entity relationships & source-of-truth mapping

## Vue d'ensemble

Le modèle cible repose sur quatre couches :

1. **Identité**
   - `profiles`
2. **Tenanting**
   - `organizations`
   - `organization_memberships`
   - `workspaces`
   - `workspace_memberships`
3. **Pilotage projet**
   - `projects`
4. **Objets métier**
   - `issues`
   - `processes`
   - `process_steps`
   - `actions`
   - `kpis`
   - `kpi_measurements`
   - `audits`
   - `audit_findings`
   - `documents`
   - `suppliers`
   - `supplier_assessments`
   - `reviews`
   - `review_decisions`
   - `customer_needs`
   - `customer_journey_items`

## Relations principales

### Auth → profil

- `auth.users.id` = `profiles.id`
- le profil porte les métadonnées applicatives minimales

### Organisation → workspace → projet

- une `organization` possède plusieurs `workspaces`
- un `workspace` appartient à une seule `organization`
- un `project` appartient à une `organization` et à un `workspace`

### Projet → processus / problèmes / actions / KPI / revues

- un `project` possède plusieurs `processes`
- un `project` possède plusieurs `issues`
- un `project` possède plusieurs `actions`
- un `project` possède plusieurs `kpis`
- un `project` possède plusieurs `reviews`

### Processus

- un `process` peut avoir plusieurs `process_steps`
- un `process` peut être lié à plusieurs `issues`, `actions`, `audits`, `documents`, `kpis`, `reviews`

### Issues / actions / audits

- une `issue` peut générer plusieurs `actions`
- un `audit` peut générer plusieurs `audit_findings`
- un `audit_finding` peut référencer une `issue`
- une `review_decision` peut créer ou référencer une `action`

### KPI

- un `kpi` possède plusieurs `kpi_measurements`
- les KPI peuvent être rattachés à un `process`, un `project` ou une logique de revue

### Fournisseurs

- un `supplier` peut avoir plusieurs `supplier_assessments`
- un fournisseur peut être lié à un projet ou géré à un niveau plus transverse

### Voix du client

- un `customer_need` peut alimenter un projet
- un `customer_journey_item` peut être lié à un `customer_need`

## Source maîtres / enrichies / dérivées

## A. Sources maîtres

Ce sont les données qui font autorité.

### Identité / accès

- `profiles`
- `organizations`
- `organization_memberships`
- `workspaces`
- `workspace_memberships`

### Cadrage projet

- `projects`
  - source maître pour :
    - `offer_id`
    - `pathway_id`
    - code projet
    - propriétaire principal

### Exécution métier

- `processes`
- `process_steps`
- `issues`
- `actions`
- `kpis`
- `audits`
- `documents`
- `suppliers`
- `reviews`
- `customer_needs`
- `customer_journey_items`

## B. Données enrichies par les outils

Ces données sont alimentées ou enrichies au fil des usages.

### `cartographie-processus-ascalis.html`

Enrichit :
- `processes`
- éventuellement `process_steps`

### `fiche-identite-processus-ascalis.html`

Enrichit :
- `processes`
- `kpis`
- liens vers `issues`, `actions`, `reviews`

### `plan-action-central-ascalis.html`

Enrichit :
- `actions`
- liens `issue_id`
- liens `process_id`
- liens `review_id`

### `tableau-bord-qualite-ascalis.html`

Enrichit ou consolide :
- `kpi_measurements`
- statut des actions et synthèses projet

### `revue-processus-ascalis.html`

Enrichit :
- `reviews`
- `review_decisions`
- rattachements à `processes`, `actions`, `issues`, `audits`

### `revue-direction-ascalis.html`

Enrichit :
- `reviews`
- `review_decisions`
- arbitrages système au niveau projet / organisation

### Outils diagnostics / audits

Enrichissent selon le cas :
- `issues`
- `audits`
- `audit_findings`
- `documents`
- `supplier_assessments`
- `customer_needs`

## C. Données dérivées

Ces données ne doivent pas être ressaisies à plusieurs endroits.

### Pilotage

- nombre d'actions ouvertes / en retard
- taux d'avancement projet
- couverture des KPI
- tendances KPI
- nombre d'écarts d'audit par processus
- synthèse des décisions de revue

### Fournisseurs

- score fournisseur consolidé
- classement fournisseurs
- statut de risque calculé

### Voix du client

- priorités client consolidées
- irritants majeurs
- besoins récurrents

## Mapping clé pour éviter les doublons

### Offre / parcours

**Maître :** `projects.offer_id`, `projects.pathway_id`

Utilisation :
- rappel contexte dans les outils
- filtrage des vues
- continuité avec la map écosystème JSON

### Processus

**Maître :** `processes`

Utilisation :
- cartographie
- fiche processus
- revues processus
- KPI de processus
- actions liées

### Problèmes / écarts

**Maître :** `issues`

Utilisation :
- actions correctives
- plans d'action
- audits
- tableaux de bord
- revues

### Actions

**Maître :** `actions`

Utilisation :
- plan d'action central
- KPI d'avancement
- décisions de revue

### KPI

**Maître :** `kpis`

Mesures :
- `kpi_measurements`

### Revues

**Maître :** `reviews`

Décisions :
- `review_decisions`

## Mapping des IDs métier ASCALIS

Le front et la donnée doivent rester compatibles avec la logique métier déjà existante.

### IDs à exposer ou manipuler logiquement

- `projectId` → `projects.id`
- `offerId` → `projects.offer_id` ou champ métier associé
- `pathwayId` → `projects.pathway_id` ou champ métier associé
- `processId` → `processes.id`
- `issueId` → `issues.id`
- `actionId` → `actions.id`
- `kpiId` → `kpis.id`
- `auditId` → `audits.id`
- `documentId` → `documents.id`
- `supplierId` → `suppliers.id`
- `reviewId` → `reviews.id`
- `customerNeedId` → `customer_needs.id`

## Lecture simple du système

- le **projet** cadre l'offre, le parcours et le tenant
- le **processus** structure le fonctionnement
- l'**issue** matérialise le problème
- l'**action** matérialise la réponse
- le **KPI** mesure l'effet
- la **review** arbitre la suite

C'est cette logique qui permet la continuité entre outils sans refaire le front en entier.
