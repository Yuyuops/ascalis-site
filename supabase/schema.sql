create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_internal_ascalis boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_email_unique on public.profiles (lower(email));

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('org_admin','org_manager','org_member','org_viewer','ascalis_admin','ascalis_consultant')),
  status text not null default 'active' check (status in ('active','invited','suspended','revoked')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create index if not exists organization_memberships_org_idx on public.organization_memberships (organization_id);
create index if not exists organization_memberships_user_idx on public.organization_memberships (user_id);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, slug)
);

create index if not exists workspaces_org_idx on public.workspaces (organization_id);

create table if not exists public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('workspace_admin','workspace_editor','workspace_viewer')),
  status text not null default 'active' check (status in ('active','invited','suspended','revoked')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, user_id)
);

create index if not exists workspace_memberships_workspace_idx on public.workspace_memberships (workspace_id);
create index if not exists workspace_memberships_user_idx on public.workspace_memberships (user_id);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  code text,
  offer_id text,
  pathway_id text,
  status text not null default 'active' check (status in ('draft','active','on_hold','closed','archived')),
  owner_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, code)
);

create index if not exists projects_org_idx on public.projects (organization_id);
create index if not exists projects_workspace_idx on public.projects (workspace_id);
create index if not exists projects_offer_idx on public.projects (offer_id);
create index if not exists projects_pathway_idx on public.projects (pathway_id);

create table if not exists public.processes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  code text,
  name text not null,
  purpose text,
  description text,
  status text not null default 'active' check (status in ('draft','active','inactive','archived')),
  pilot_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, code)
);

create index if not exists processes_project_idx on public.processes (project_id);

create table if not exists public.process_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  process_id uuid not null references public.processes(id) on delete cascade,
  step_order integer not null,
  name text not null,
  description text,
  input_summary text,
  output_summary text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (process_id, step_order)
);

create index if not exists process_steps_process_idx on public.process_steps (process_id);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  process_id uuid references public.processes(id) on delete set null,
  offer_id text,
  pathway_id text,
  title text not null,
  issue_type text not null default 'issue' check (issue_type in ('issue','nc','complaint','risk','opportunity','finding')),
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','investigating','planned','resolved','closed','archived')),
  problem_statement text,
  source_tool_file text,
  detected_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists issues_project_idx on public.issues (project_id);
create index if not exists issues_process_idx on public.issues (process_id);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  issue_id uuid references public.issues(id) on delete set null,
  process_id uuid references public.processes(id) on delete set null,
  review_id uuid,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled','blocked')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  owner_user_id uuid references public.profiles(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists actions_project_idx on public.actions (project_id);
create index if not exists actions_issue_idx on public.actions (issue_id);
create index if not exists actions_process_idx on public.actions (process_id);

create table if not exists public.kpis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  process_id uuid references public.processes(id) on delete set null,
  code text,
  name text not null,
  definition text,
  unit text,
  direction text not null default 'increase' check (direction in ('increase','decrease','target_range','stabilize')),
  target_value numeric,
  warning_threshold numeric,
  alert_threshold numeric,
  status text not null default 'active' check (status in ('draft','active','inactive','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, code)
);

create index if not exists kpis_project_idx on public.kpis (project_id);
create index if not exists kpis_process_idx on public.kpis (process_id);

create table if not exists public.kpi_measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  kpi_id uuid not null references public.kpis(id) on delete cascade,
  measured_at timestamptz not null,
  value numeric not null,
  note text,
  source text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists kpi_measurements_kpi_idx on public.kpi_measurements (kpi_id, measured_at desc);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  process_id uuid references public.processes(id) on delete set null,
  title text not null,
  audit_type text not null default 'internal' check (audit_type in ('internal','supplier','client','certification','process')),
  status text not null default 'planned' check (status in ('planned','in_progress','completed','cancelled')),
  planned_at timestamptz,
  performed_at timestamptz,
  lead_auditor_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists audits_project_idx on public.audits (project_id);

create table if not exists public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  audit_id uuid not null references public.audits(id) on delete cascade,
  issue_id uuid references public.issues(id) on delete set null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  clause_ref text,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','planned','resolved','closed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists audit_findings_audit_idx on public.audit_findings (audit_id);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  process_id uuid references public.processes(id) on delete set null,
  code text,
  title text not null,
  document_type text not null default 'procedure' check (document_type in ('policy','procedure','instruction','record','template','report','other')),
  version text,
  status text not null default 'draft' check (status in ('draft','active','obsolete','archived')),
  storage_provider text,
  storage_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists documents_project_idx on public.documents (project_id);
create index if not exists documents_process_idx on public.documents (process_id);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  supplier_code text,
  status text not null default 'active' check (status in ('active','inactive','blacklisted','archived')),
  risk_level text not null default 'medium' check (risk_level in ('low','medium','high','critical')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists suppliers_org_idx on public.suppliers (organization_id);

create table if not exists public.supplier_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  assessment_date date not null,
  quality_score numeric,
  delivery_score numeric,
  cost_score numeric,
  service_score numeric,
  recommendation text,
  notes text,
  assessor_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists supplier_assessments_supplier_idx on public.supplier_assessments (supplier_id, assessment_date desc);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  process_id uuid references public.processes(id) on delete set null,
  review_type text not null default 'process' check (review_type in ('process','direction','project','supplier')),
  title text not null,
  status text not null default 'planned' check (status in ('planned','completed','cancelled')),
  scheduled_for timestamptz,
  reviewed_at timestamptz,
  facilitator_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists reviews_project_idx on public.reviews (project_id);
create index if not exists reviews_process_idx on public.reviews (process_id);

alter table public.actions
  add constraint actions_review_fk
  foreign key (review_id) references public.reviews(id) on delete set null;

create table if not exists public.review_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  review_id uuid not null references public.reviews(id) on delete cascade,
  action_id uuid references public.actions(id) on delete set null,
  decision_text text not null,
  owner_user_id uuid references public.profiles(id) on delete set null,
  due_date date,
  status text not null default 'open' check (status in ('open','implemented','cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists review_decisions_review_idx on public.review_decisions (review_id);

create table if not exists public.customer_needs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  external_reference text,
  title text not null,
  need_statement text not null,
  importance integer check (importance between 1 and 5),
  category text,
  source text,
  status text not null default 'open' check (status in ('open','translated','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_needs_project_idx on public.customer_needs (project_id);

create table if not exists public.customer_journey_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  customer_need_id uuid references public.customer_needs(id) on delete set null,
  step_order integer,
  journey_stage text not null,
  touchpoint text,
  pain_point text,
  expectation text,
  opportunity text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_journey_items_project_idx on public.customer_journey_items (project_id);
create index if not exists customer_journey_items_need_idx on public.customer_journey_items (customer_need_id);

create or replace trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create or replace trigger trg_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create or replace trigger trg_organization_memberships_updated_at before update on public.organization_memberships for each row execute function public.set_updated_at();
create or replace trigger trg_workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create or replace trigger trg_workspace_memberships_updated_at before update on public.workspace_memberships for each row execute function public.set_updated_at();
create or replace trigger trg_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create or replace trigger trg_processes_updated_at before update on public.processes for each row execute function public.set_updated_at();
create or replace trigger trg_process_steps_updated_at before update on public.process_steps for each row execute function public.set_updated_at();
create or replace trigger trg_issues_updated_at before update on public.issues for each row execute function public.set_updated_at();
create or replace trigger trg_actions_updated_at before update on public.actions for each row execute function public.set_updated_at();
create or replace trigger trg_kpis_updated_at before update on public.kpis for each row execute function public.set_updated_at();
create or replace trigger trg_kpi_measurements_updated_at before update on public.kpi_measurements for each row execute function public.set_updated_at();
create or replace trigger trg_audits_updated_at before update on public.audits for each row execute function public.set_updated_at();
create or replace trigger trg_audit_findings_updated_at before update on public.audit_findings for each row execute function public.set_updated_at();
create or replace trigger trg_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();
create or replace trigger trg_suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create or replace trigger trg_supplier_assessments_updated_at before update on public.supplier_assessments for each row execute function public.set_updated_at();
create or replace trigger trg_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create or replace trigger trg_review_decisions_updated_at before update on public.review_decisions for each row execute function public.set_updated_at();
create or replace trigger trg_customer_needs_updated_at before update on public.customer_needs for each row execute function public.set_updated_at();
create or replace trigger trg_customer_journey_items_updated_at before update on public.customer_journey_items for each row execute function public.set_updated_at();
