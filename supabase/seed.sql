-- Demo seed minimal. Replace UUIDs for real environments if needed.

insert into public.organizations (id, name, slug, status)
values
  ('11111111-1111-1111-1111-111111111111', 'ASCALIS Demo Client', 'ascalis-demo-client', 'active')
on conflict (id) do nothing;

insert into public.workspaces (id, organization_id, name, slug, status)
values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Qualité & Performance', 'qualite-performance', 'active')
on conflict (id) do nothing;

insert into public.projects (id, organization_id, workspace_id, name, code, offer_id, pathway_id, status)
values
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Projet démo pilotage qualité',
    'ASC-DEMO-001',
    'offer-performance-continue',
    'pathway-performance-pilotage',
    'active'
  )
on conflict (id) do nothing;

insert into public.processes (id, organization_id, workspace_id, project_id, code, name, purpose, status)
values
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'PR5',
    'Planifier et suivre la production',
    'Piloter les jalons, livrables et interfaces du projet',
    'active'
  )
on conflict (id) do nothing;

insert into public.actions (id, organization_id, workspace_id, project_id, process_id, title, description, status, priority)
values
  (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'Mettre en place un suivi mensuel des actions par processus',
    'Action transverse de pilotage pour fiabiliser les revues processus.',
    'todo',
    'high'
  )
on conflict (id) do nothing;

insert into public.kpis (id, organization_id, workspace_id, project_id, process_id, code, name, definition, unit, direction, target_value, status)
values
  (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'KPI-ACT-001',
    'Taux de clôture des actions dans les délais',
    'Part des actions clôturées avant ou à échéance.',
    '%',
    'increase',
    90,
    'active'
  )
on conflict (id) do nothing;

insert into public.kpi_measurements (id, organization_id, workspace_id, project_id, kpi_id, measured_at, value, note, source)
values
  (
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '66666666-6666-6666-6666-666666666666',
    timezone('utc', now()),
    78,
    'Mesure initiale démo',
    'seed'
  )
on conflict (id) do nothing;

insert into public.reviews (id, organization_id, workspace_id, project_id, process_id, review_type, title, status, scheduled_for)
values
  (
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'process',
    'Revue processus mensuelle démo',
    'planned',
    timezone('utc', now())
  )
on conflict (id) do nothing;
