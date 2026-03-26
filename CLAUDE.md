# ASCALIS — Projet Consultant Performance Qualité & Amélioration Continue

## Contexte
ASCALIS est une activité de consultant indépendant en performance qualité et amélioration continue, ciblant les PME/ETI industrielles de 10-250 personnes dans 3 secteurs : Aéronautique, BTP/Construction, Transport & Logistique.

## Architecture du site

Tous les fichiers sont des HTML statiques autonomes (zéro dépendance backend), hébergés au même niveau sur Netlify. Les liens entre pages utilisent des chemins relatifs simples.

### Navigation
```
ascalis-site.html       ← Point d'entrée public (site vitrine)
├── dashboard.html      ← Espace Pro (login requis : admin@ascalis.fr / ascalis2026)
│   ├── abaque-outils.html    (admin uniquement, iframe dans dashboard)
│   ├── dmaic-navigator.html  (outil DMAIC 5 phases avec stats intégrées)
│   └── [liens vers tous les outils pro et gratuits]
├── [6 outils gratuits fonctionnels]
└── [3 outils gratuits en attente de construction]
```

### Inventaire des fichiers

| Fichier | Type | Statut |
|---------|------|--------|
| `index.html` | Site vitrine | ✅ OK |
| `dashboard.html` | Espace Pro avec auth | ✅ OK |
| `abaque-outils.html` | Navigation 99 outils | ✅ OK |
| `dmaic-navigator.html` | DMAIC 5 phases + stats | ✅ OK |
| `diagnostic-terrain.html` | Outil Pro | ✅ OK |
| `fiche-8d.html` | Outil Pro | ✅ OK |
| `grille-audit.html` | Outil Pro | ✅ OK |
| `plan-controle.html` | Outil Pro | ✅ OK |
| `calculateur-cnq.html` | Outil Gratuit | ✅ OK |
| `checklist-audit.html` | Outil Gratuit | ✅ OK |
| `matrice-priorisation.html` | Outil Gratuit | ✅ OK |
| `score-documentaire.html` | Outil Gratuit | ✅ OK |
| `simulateur-roi.html` | Outil Gratuit | ✅ OK |
| `seuil-rentabilite.html` | Outil Gratuit | ⚠️ À CONSTRUIRE |
| `simulateur-prix.html` | Outil Gratuit | ⚠️ À CONSTRUIRE |
| `diagnostic-dirigeant.html` | Outil Gratuit | ⚠️ À CONSTRUIRE |

### Outils prioritaires à digitaliser (prochains lots)
1. Pareto (analyse fréquence/impact avec diagramme barres + courbe cumulative)
2. VSM (cartographie chaîne de valeur interactive)
3. SIPOC (vue macro processus avec drag & drop)
4. Ishikawa interactif (5M+1 standalone, séparé du 8D)
5. SPC / Cartes de contrôle (I-MR, X-bar R, p-chart avec graphiques SVG)

## Design System (UI/UX Pro Max)

### Style
- **Approche** : Minimalism + Trust & Authority
- **Landing pattern** : Hero-Centric + Trust & Authority + Conversion

### Typographie (Corporate Trust — Pairing #16)
```css
--font-heading: 'Lexend', sans-serif;      /* Headings — conçu pour la lisibilité */
--font-body: 'Source Sans 3', sans-serif;   /* Body — professionnel, accessible */
--font-display: 'Instrument Serif', serif;  /* Display — titres hero, scores */
```
Google Fonts import :
```
https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap
```

### Palette (B2B Service adaptée + cuivre ASCALIS)
```css
--color-primary: #0F1A2E;          /* Bleu nuit — backgrounds sombres, nav */
--color-primary-light: #1B3A4B;    /* Teal — variante */
--color-accent: #B07642;           /* Cuivre ASCALIS — CTA, accents, marque */
--color-accent-light: #D4956A;     /* Cuivre clair — texte sur fond sombre */
--color-surface: #FFFFFF;
--color-surface-alt: #F8FAFC;
--color-surface-warm: #FAF9F6;     /* Crème — background body */
--color-on-surface: #020617;
--color-on-surface-secondary: #475569;
--color-on-surface-muted: #94A3B8;
--color-border: #E2E8F0;
--color-success: #059669;
--color-warning: #D97706;
--color-error: #DC2626;
--color-info: #2563EB;
```

### Spacing (système 8dp)
```css
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-5: 20px; --space-6: 24px; --space-7: 32px; --space-8: 40px;
--space-9: 48px; --space-10: 56px; --space-11: 64px; --space-12: 80px;
```

### Elevation
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,.05);
--shadow-md: 0 4px 12px rgba(0,0,0,.06);
--shadow-lg: 0 8px 24px rgba(0,0,0,.06);
```

### Radius
```css
--radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;
```

### Transitions
```css
--ease-spring: cubic-bezier(.16,1,.3,1);    /* Entrées, reveals */
--ease-bounce: cubic-bezier(.34,1.56,.64,1); /* Hover icons, press feedback */
--duration-fast: 150ms;     /* Micro-interactions */
--duration-normal: 250ms;   /* Transitions standard */
--duration-slow: 400ms;     /* Reveals scroll */
```

## Conventions de code

### Accessibilité (WCAG AA obligatoire)
- `skip-link` en haut de chaque page
- `aria-label` sur tous les liens et boutons sans texte
- `aria-labelledby` sur chaque section
- `aria-hidden="true"` sur les éléments décoratifs (engrenages, icônes)
- Heading hierarchy h1→h6 sans saut
- `focus-visible` avec outline 3px sur tous les éléments interactifs
- Formulaires : labels associés par for/id, autocomplete attributes
- Touch targets : min-height 44px
- `prefers-reduced-motion` : désactiver toutes les animations

### Icônes
- SVG uniquement, JAMAIS d'emoji
- Style Lucide : stroke-width="1.5", stroke-linecap="round"
- Taille standard : 16-24px inline, 28-36px cards, 44px piliers

### Animations
- Durées : 150-300ms micro, ≤400ms complex
- Easing : ease-out (spring) pour entrées, ease-in pour sorties
- Stagger : 40ms par sibling dans les grilles
- transform/opacity uniquement (jamais width/height)
- Engrenages SVG entre sections : rotation CW/CCW, réactifs au scroll

### Structure HTML des outils
Chaque outil suit le même pattern :
```html
<!-- Header avec logo ASCALIS + boutons export/print -->
<div class="hd">...</div>
<!-- Hero avec titre + description -->
<div class="hero"><h1>Nom de l'outil</h1><p>Description</p></div>
<!-- Barre de métadonnées (entreprise, date, consultant) -->
<div class="meta">...</div>
<!-- Contenu principal -->
<div class="container">...</div>
<!-- Script JS autonome (zéro dépendance externe) -->
<script>...</script>
```

### Logo ASCALIS (SVG inline)
```html
<svg viewBox="0 0 240 40" height="22" fill="none">
  <path d="M4 36 L14 6 L24 36" stroke="#B07642" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="34" y="32" font-family="'Lexend',sans-serif" font-size="24" font-weight="500" fill="#0F1A2E" letter-spacing="4.5">SCALIS</text>
</svg>
```

### Export CSV
Tous les outils pro supportent l'export CSV avec :
- BOM UTF-8 (`\uFEFF` en préfixe)
- Séparateur `;`
- Nommage : `ASCALIS_[outil]_[contexte]_[date].csv`

## Offres ASCALIS (8 offres)

1. Diagnostic Flash Qualité (3-5j, 3-5k€)
2. Remise en conformité documentaire (10-20j, 8-20k€)
3. NC récurrentes : traitement à la racine (10-15j, 8-15k€)
4. Structuration du SMQ (20-40j, 18-40k€)
5. Automatisation des processus qualité (5-15j, 5-15k€)
6. Accompagnement performance continue (1-2j/mois, 1-2k€/mois)
7. Diagnostic Performance & Maturité Numérique (3-8j, 2.5-8k€) ← Point d'entrée stratégique
8. Structuration opérationnelle PME (15-30j, 12-30k€) ← Offre pilotage/commercial/organisation

## Moteur statistique (dans dmaic-navigator.html)

Le DMAIC Navigator contient un moteur stats pur JavaScript (objet `S`) avec :
- Anderson-Darling (test de normalité)
- Capabilité : Cp, Cpk, Pp, Ppk, Z-bench, DPMO
- t-test 1 et 2 échantillons (Welch), t-test pairé
- ANOVA one-way
- Chi² (table de contingence)
- Tests de proportions (1 et 2 échantillons)
- Régression linéaire simple (r, R², p-value)
- Cartes de contrôle I-MR et X-bar R
- Gage R&R (méthode ANOVA croisée)
- Distribution normale CDF + inverse
- t-distribution, F-distribution, Beta incomplète, Gamma incomplète

Et un moteur de visualisation SVG (objet `Chart`) :
- Histogramme avec courbe normale + LSL/USL
- Scatter plot avec droite de régression
- Carte de contrôle avec UCL/LCL/CL et détection points hors contrôle

## Comptes dashboard

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@ascalis.fr | ascalis2026 | Admin (accès complet) |
| client@demo.fr | demo2026 | Client (accès limité) |

Auth côté client (localStorage). Pour production : prévoir un backend.
