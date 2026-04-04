# ASCALIS — Data architecture cible

## But

Faire évoluer ASCALIS d'un ensemble d'outils HTML statiques vers une mini-app métier multi-client, sans casser l'existant.

Le front HTML actuel reste en place.
La donnée et l'authentification deviennent progressives, centralisées et sécurisées.

## Principes d'architecture

- Front statique conservé et hébergé sur Netlify.
- Fonctions serveur via Netlify Functions pour les opérations sensibles.
- Authentification et base relationnelle via Supabase.
- Séparation stricte des données entre clients via Row Level Security.
- Aucun secret sensible côté navigateur.
- `localStorage` toléré uniquement comme cache local transitoire, jamais comme source de vérité métier.

## Architecture logique

### 1. Présentation

Couche actuelle conservée :
- `ascalis-site.html`
- `dashboard.html`
- `abaque-outils.html`
- outils HTML existants

Ajouts progressifs :
- lecture de données via Supabase côté navigateur quand le cas est simple
- écriture sensible via Netlify Functions
- contexte utilisateur injecté après authentification

### 2. Domaine métier

Le domaine ASCALIS reste structuré autour de la continuité :

**problème → diagnostic → analyse → décision → action → KPI → revue**

Le modèle relationnel doit permettre de rattacher les objets métier à :
- l'organisation cliente
- le workspace
- le projet
- l'offre ASCALIS
- le parcours
- le processus
- le problème initial
- les actions
- les KPI
- les revues

### 3. Accès aux données

Trois niveaux d'accès :

#### A. Lecture publique / anonyme

Uniquement pour les pages publiques qui n'exposent aucune donnée client.

#### B. Lecture authentifiée avec clé `anon`

Utilisée côté front quand :
- la donnée est filtrée par RLS
- l'utilisateur lit sa propre donnée de travail
- aucune opération sensible n'est nécessaire

#### C. Lecture / écriture serveur avec service role

Utilisée côté Netlify Functions quand :
- l'opération est sensible
- il faut valider des rôles plus finement
- il faut faire des écritures multi-tables
- il faut injecter de la logique métier contrôlée

## Modèle multi-tenant retenu

### Niveaux

- `organizations` = client / entité cliente
- `workspaces` = espace métier ou périmètre opérationnel au sein d'une organisation
- `projects` = dossier métier concret

### Appartenance

- `organization_memberships` gère l'accès organisation
- `workspace_memberships` gère l'accès workspace

### Rôles organisation

- `org_admin`
- `org_manager`
- `org_member`
- `org_viewer`
- `ascalis_admin`
- `ascalis_consultant`

### Rôles workspace

- `workspace_admin`
- `workspace_editor`
- `workspace_viewer`

## Objets métier cibles

Phase 1 :
- `projects`
- `processes`
- `process_steps`
- `issues`
- `actions`
- `kpis`
- `kpi_measurements`
- `reviews`
- `review_decisions`

Phase 2 :
- `audits`
- `audit_findings`
- `documents`
- `suppliers`
- `supplier_assessments`

Phase 3 :
- `customer_needs`
- `customer_journey_items`

## Règles structurantes

### 1. Scope explicite

Toute table métier doit porter le scope minimal utile :
- `organization_id`
- `workspace_id` si pertinent
- `project_id` si pertinent
- `created_at`
- `updated_at`
- `created_by` si pertinent

### 2. Pas de duplication métier inutile

Exemple :
- l'offre et le parcours sont maîtres au niveau projet
- une action peut référencer un `issue_id`, un `process_id` et un `review_id`
- on évite de répéter partout des champs descriptifs déjà maîtrisés dans l'objet source

### 3. Les champs dérivés restent dérivés

Exemples :
- score global fournisseur
- avancement global d'un projet
- tendance KPI
- nombre d'actions en retard

Ils doivent être calculés côté requête, vue SQL ou fonction, pas saisis à la main plusieurs fois.

## Intégration front progressive

Les outils existants ne sont pas tous branchés immédiatement.
Le socle vise d'abord ces 6 outils :

1. `cartographie-processus-ascalis.html`
2. `fiche-identite-processus-ascalis.html`
3. `plan-action-central-ascalis.html`
4. `tableau-bord-qualite-ascalis.html`
5. `revue-processus-ascalis.html`
6. `revue-direction-ascalis.html`

## Stratégie de transition

### Mode autonome

Les outils continuent de fonctionner seuls avec leurs formulaires locaux et leur logique actuelle.

### Mode connecté

Quand un `project_id` ou un contexte workspace est présent :
- lecture des données réelles depuis Supabase
- préremplissage et persistance centralisée
- continuité entre outils

### Mode hybride

Le même outil peut :
- démarrer en mode autonome
- être branché plus tard sur la couche data sans refonte UI lourde

## Sécurité

- Front : jamais de secret sensible.
- RLS activé sur toutes les tables métier.
- Les Netlify Functions avec service role servent uniquement d'orchestrateur sécurisé.
- La sécurité critique ne repose jamais uniquement sur le front.

## Résultat attendu

À terme, ASCALIS devient :
- multi-client
- multi-utilisateur
- multi-workspace
- multi-projet
- orienté continuité métier
- toujours compatible avec l'architecture HTML actuelle
