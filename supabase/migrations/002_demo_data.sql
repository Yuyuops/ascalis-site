-- ============================================================
-- ASCALIS — Migration 002 : Données de démonstration
-- À exécuter après 001_schema.sql
-- ============================================================

DO $$
DECLARE
  ws_id    uuid;
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@ascalis.fr';
  SELECT id INTO ws_id FROM public.workspaces WHERE created_by = admin_id LIMIT 1;

  IF ws_id IS NULL THEN
    RAISE NOTICE 'Workspace introuvable — lancez 001_schema.sql en premier.';
    RETURN;
  END IF;

  -- ── PROCESSUS ────────────────────────────────────────────
  INSERT INTO public.processes (workspace_id, code, name, pilot_id) VALUES
    (ws_id, 'PROC-001', 'Achats & Approvisionnement', admin_id),
    (ws_id, 'PROC-002', 'Production & Fabrication',   admin_id),
    (ws_id, 'PROC-003', 'Contrôle Qualité',           admin_id),
    (ws_id, 'PROC-004', 'Livraison & Expédition',     admin_id),
    (ws_id, 'PROC-005', 'SAV & Réclamations clients', admin_id)
  ON CONFLICT DO NOTHING;

  -- ── ACTIONS (mix retard / en cours / ok) ─────────────────
  INSERT INTO public.actions
    (workspace_id, title, source, owner_id, process_id, expected_effect, due_date, status, priority, progress, created_by)
  SELECT
    ws_id, a.title, a.source, admin_id,
    (SELECT id FROM public.processes WHERE workspace_id = ws_id AND code = a.proc LIMIT 1),
    a.effect,
    (CURRENT_DATE + a.delta)::date,
    a.status, a.priority, a.progress, admin_id
  FROM (VALUES
    ('Mise à jour du plan de surveillance fournisseur',  'Audit interne', 'PROC-001', 'Réduire les NC à réception',        -15, 'in_progress', 'high',     60),
    ('Révision des critères d''acceptation soudure',     'NC client',     'PROC-002', 'Zéro défaut soudure série',         -8,  'open',        'critical',  0),
    ('Formation opérateurs contrôle dimensionnel',       'Plan formation','PROC-003', 'Fiabiliser les mesures terrain',    -3,  'open',        'high',      0),
    ('Déploiement check-list pré-expédition',            'Audit terrain', 'PROC-004', 'Réduire les erreurs livraison',     -1,  'in_progress', 'medium',   40),
    ('Mise à jour procédure gestion des réclamations',   'Revue Q1',      'PROC-005', 'Délai réponse client < 48h',        7,  'open',        'medium',    0),
    ('Étalonnage des équipements de mesure (EMM)',        'Audit EN9100',  'PROC-003', 'Conformité plan de surveillance',  14,  'open',        'high',      0),
    ('Analyse Pareto des NC du trimestre',               'Revue Q1',      'PROC-002', 'Identifier top 3 causes racines',  21,  'open',        'medium',    0),
    ('Requalification fournisseur aciers spéciaux',      'Audit fourn.',  'PROC-001', 'Maintien approbation EN9100',      30,  'open',        'high',      0),
    ('Clôture 8D fournisseur ref. F-2026-041',           'NC fournisseur','PROC-001', 'Validation efficacité action',     -5,  'open',        'critical',  20),
    ('Mise à jour FMEA ligne assemblage B',              'Retour terrain','PROC-002', 'Prévention défauts série',         -10, 'in_progress', 'high',      45)
  ) AS a(title, source, proc, effect, delta, status, priority, progress);

  -- ── KPIs ─────────────────────────────────────────────────
  INSERT INTO public.kpis
    (workspace_id, name, kpi_group, owner_id, period, target_value, target_operator, current_value, unit, status, trend, comment)
  VALUES
    (ws_id, 'Taux de NC internes',         'Qualité',    admin_id, '2026-Q2', 2.0,  '<=', 3.8,  '%',   'red',    'up',     'En hausse depuis le changement de fournisseur acier'),
    (ws_id, 'Taux de rebuts',              'Qualité',    admin_id, '2026-Q2', 0.5,  '<=', 0.9,  '%',   'red',    'stable', 'Ligne B hors cible'),
    (ws_id, 'OTD (On Time Delivery)',      'Délai',      admin_id, '2026-Q2', 95.0, '>=', 91.2, '%',   'red',    'down',   'Retards sous-traitance'),
    (ws_id, 'Satisfaction client (score)', 'Client',     admin_id, '2026-Q2', 4.0,  '>=', 3.7,  '/5',  'orange', 'stable', 'Enquête Q1 — relance planifiée'),
    (ws_id, 'Délai traitement réclamation','Client',     admin_id, '2026-Q2', 48.0, '<=', 72.0, 'h',   'orange', 'down',   'Sous-effectif équipe SAV'),
    (ws_id, 'Taux de conformité livraison','Qualité',    admin_id, '2026-Q2', 98.0, '>=', 97.1, '%',   'orange', 'stable', 'Proche cible'),
    (ws_id, 'Couverture plan de contrôle', 'Conformité', admin_id, '2026-Q2', 100.0,'>=', 100.0,'%',   'green',  'stable', 'Conforme'),
    (ws_id, 'Efficacité actions correctives','Amélioration',admin_id,'2026-Q2',80.0,'>=', 75.0, '%',   'orange', 'up',     'Progression vs Q1'),
    (ws_id, 'Taux de démérites fournisseurs','Achats',   admin_id, '2026-Q2', 5.0,  '<=', 4.2,  '%',   'green',  'down',   'Amélioration après audit'),
    (ws_id, 'Productivité ligne A',        'Performance',admin_id, '2026-Q2', 92.0, '>=', 94.5, '%',   'green',  'up',     'Optimisation gamme opératoire OK');

  -- ── REVUES DE PROCESSUS ───────────────────────────────────
  INSERT INTO public.process_reviews
    (workspace_id, process_id, period, review_date, pilot_id, status, conclusion)
  SELECT
    ws_id,
    (SELECT id FROM public.processes WHERE workspace_id = ws_id AND code = r.proc LIMIT 1),
    r.period,
    (CURRENT_DATE + r.delta)::date,
    admin_id,
    r.status,
    r.conclusion
  FROM (VALUES
    ('PROC-001', '2026-Q2',  12, 'planned',     NULL),
    ('PROC-002', '2026-Q2',   5, 'planned',     NULL),
    ('PROC-003', '2026-Q2',  -2, 'in_progress', 'En cours — points ouverts sur étalonnage'),
    ('PROC-004', '2026-Q2',  18, 'planned',     NULL),
    ('PROC-005', '2026-Q1', -25, 'done',        'Actions identifiées, délais respectés')
  ) AS r(proc, period, delta, status, conclusion);

  RAISE NOTICE 'Données de démonstration insérées dans workspace %', ws_id;
END $$;
