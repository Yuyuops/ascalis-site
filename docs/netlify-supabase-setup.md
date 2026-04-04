# Netlify + Supabase setup

## Objectif

Préparer un socle simple et propre :
- Netlify pour héberger le front statique et les fonctions
- Supabase pour l'authentification et la base relationnelle
- RLS pour isoler les données par client

## Pré-requis

- un site Netlify existant pour ASCALIS
- un projet Supabase créé
- accès aux variables d'environnement Netlify

## 1. Créer le projet Supabase

Dans Supabase :
- créer un nouveau projet
- récupérer :
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 2. Appliquer le SQL

Ordre recommandé :

1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/seed.sql`

### Depuis le SQL editor Supabase

- ouvrir l'éditeur SQL
- exécuter le schéma
- exécuter ensuite le fichier RLS
- exécuter enfin le seed

## 3. Configurer les variables côté Netlify

Déclarer au minimum :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `NETLIFY_SITE_URL`

## 4. Portée des variables

Les variables sensibles doivent être disponibles pour les Functions.
Elles ne doivent jamais être injectées telles quelles dans le navigateur.

## 5. Helpers fournis

### `netlify/functions/_lib/supabaseAdmin.js`

Usage :
- opérations serveur sensibles
- lecture / écriture admin
- orchestration multi-tables

### `netlify/functions/_lib/supabaseClient.js`

Usage :
- client côté function avec jeton utilisateur
- lecture sécurisée via RLS

### `netlify/functions/_lib/authz.js`

Usage :
- extraire le bearer token
- charger l'utilisateur authentifié
- vérifier l'accès organisation / workspace / projet

## 6. Recommandation de flux front

### Lecture simple

Le front peut appeler Supabase avec la clé `anon` pour lire :
- le profil connecté
- ses organisations
- ses workspaces
- ses projets
- la donnée métier autorisée par RLS

### Écriture simple

Tu peux lire/écrire côté front pour des cas très simples si :
- la table est protégée par RLS
- aucune logique sensible supplémentaire n'est requise

### Écriture sensible

Passer par Netlify Functions quand :
- l'opération touche plusieurs tables
- il faut contrôler le rôle finement
- il faut produire de la logique métier dérivée
- il faut journaliser ou sécuriser la mutation

## 7. Exemple de branchement progressif

### Étape 1

Brancher l'auth et la sélection du contexte :
- utilisateur connecté
- organisation active
- workspace actif
- projet actif

### Étape 2

Brancher en lecture seule :
- `cartographie-processus-ascalis.html`
- `fiche-identite-processus-ascalis.html`

### Étape 3

Brancher l'écriture contrôlée :
- `plan-action-central-ascalis.html`
- `tableau-bord-qualite-ascalis.html`

### Étape 4

Brancher la logique de revue :
- `revue-processus-ascalis.html`
- `revue-direction-ascalis.html`

## 8. Ce qu'il ne faut pas faire

- ne jamais exposer la service role key au navigateur
- ne jamais compter uniquement sur le front pour filtrer les données
- ne jamais utiliser `localStorage` comme stockage principal métier
- ne pas dupliquer les règles d'autorisation dans dix fichiers front

## 9. Vérifications manuelles après setup

### Auth

- un utilisateur peut se connecter
- un utilisateur voit son profil

### Tenanting

- un utilisateur A ne voit pas les organisations de B
- un utilisateur voit seulement ses workspaces

### Donnée métier

- un projet n'est visible que depuis le bon scope
- les actions et KPI du projet courant sont isolés

### Functions

- une function lit bien les variables d'environnement
- une function avec service role peut exécuter une écriture admin contrôlée

## 10. Notes importantes

- les variables d'environnement Netlify sont disponibles dans les Functions quand elles sont déclarées avec le bon scope. citeturn583497search1
- côté Supabase, les tables exposées au navigateur doivent avoir le RLS activé et des policies explicites, sinon rien n'est lisible avec la clé `anon`. citeturn583497search0turn583497search2
