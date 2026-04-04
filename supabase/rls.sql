create or replace function public.current_user_is_internal_ascalis()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select p.is_internal_ascalis
    from public.profiles p
    where p.id = (select auth.uid())
  ), false);
$$;

create or replace function public.has_org_membership(target_organization_id uuid, allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.user_id = (select auth.uid())
      and om.status = 'active'
      and (allowed_roles is null or om.role = any(allowed_roles))
  );
$$;

create or replace function public.has_workspace_membership(target_workspace_id uuid, allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_memberships wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.status = 'active'
      and (allowed_roles is null or wm.role = any(allowed_roles))
  );
$$;

create or replace function public.can_access_workspace(target_organization_id uuid, target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    public.has_org_membership(target_organization_id, array['org_admin','org_manager','org_member','org_viewer','ascalis_admin','ascalis_consultant'])
    and public.has_workspace_membership(target_workspace_id, array['workspace_admin','workspace_editor','workspace_viewer'])
  );
$$;

create or replace function public.can_edit_workspace(target_organization_id uuid, target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    public.has_org_membership(target_organization_id, array['org_admin','org_manager','org_member','ascalis_admin','ascalis_consultant'])
    and public.has_workspace_membership(target_workspace_id, array['workspace_admin','workspace_editor'])
  );
$$;

create or replace function public.can_admin_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_membership(target_organization_id, array['org_admin','ascalis_admin']);
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.projects enable row level security;
alter table public.processes enable row level security;
alter table public.process_steps enable row level security;
alter table public.issues enable row level security;
alter table public.actions enable row level security;
alter table public.kpis enable row level security;
alter table public.kpi_measurements enable row level security;
alter table public.audits enable row level security;
alter table public.audit_findings enable row level security;
alter table public.documents enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_assessments enable row level security;
alter table public.reviews enable row level security;
alter table public.review_decisions enable row level security;
alter table public.customer_needs enable row level security;
alter table public.customer_journey_items enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member on public.organizations
for select to authenticated
using (public.has_org_membership(id));

drop policy if exists organizations_update_admin on public.organizations;
create policy organizations_update_admin on public.organizations
for update to authenticated
using (public.can_admin_organization(id))
with check (public.can_admin_organization(id));

drop policy if exists organization_memberships_select_member on public.organization_memberships;
create policy organization_memberships_select_member on public.organization_memberships
for select to authenticated
using (public.has_org_membership(organization_id));

drop policy if exists organization_memberships_insert_admin on public.organization_memberships;
create policy organization_memberships_insert_admin on public.organization_memberships
for insert to authenticated
with check (public.can_admin_organization(organization_id));

drop policy if exists organization_memberships_update_admin on public.organization_memberships;
create policy organization_memberships_update_admin on public.organization_memberships
for update to authenticated
using (public.can_admin_organization(organization_id))
with check (public.can_admin_organization(organization_id));

drop policy if exists workspaces_select_member on public.workspaces;
create policy workspaces_select_member on public.workspaces
for select to authenticated
using (public.has_org_membership(organization_id) and public.has_workspace_membership(id));

drop policy if exists workspaces_insert_org_admin on public.workspaces;
create policy workspaces_insert_org_admin on public.workspaces
for insert to authenticated
with check (public.can_admin_organization(organization_id));

drop policy if exists workspaces_update_org_admin on public.workspaces;
create policy workspaces_update_org_admin on public.workspaces
for update to authenticated
using (public.can_admin_organization(organization_id))
with check (public.can_admin_organization(organization_id));

drop policy if exists workspace_memberships_select_member on public.workspace_memberships;
create policy workspace_memberships_select_member on public.workspace_memberships
for select to authenticated
using (
  public.has_workspace_membership(workspace_id)
  or exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and public.can_admin_organization(w.organization_id)
  )
);

drop policy if exists workspace_memberships_insert_admin on public.workspace_memberships;
create policy workspace_memberships_insert_admin on public.workspace_memberships
for insert to authenticated
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and public.can_admin_organization(w.organization_id)
  )
);

drop policy if exists workspace_memberships_update_admin on public.workspace_memberships;
create policy workspace_memberships_update_admin on public.workspace_memberships
for update to authenticated
using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and public.can_admin_organization(w.organization_id)
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and public.can_admin_organization(w.organization_id)
  )
);

-- Generic workspace-scoped tables: select / insert / update / delete

drop policy if exists projects_select_member on public.projects;
create policy projects_select_member on public.projects
for select to authenticated
using (public.can_access_workspace(organization_id, workspace_id));

drop policy if exists projects_insert_editor on public.projects;
create policy projects_insert_editor on public.projects
for insert to authenticated
with check (public.can_edit_workspace(organization_id, workspace_id));

drop policy if exists projects_update_editor on public.projects;
create policy projects_update_editor on public.projects
for update to authenticated
using (public.can_edit_workspace(organization_id, workspace_id))
with check (public.can_edit_workspace(organization_id, workspace_id));

drop policy if exists projects_delete_admin on public.projects;
create policy projects_delete_admin on public.projects
for delete to authenticated
using (public.can_admin_organization(organization_id));

create policy processes_select_member on public.processes for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy processes_insert_editor on public.processes for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy processes_update_editor on public.processes for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy processes_delete_admin on public.processes for delete to authenticated using (public.can_admin_organization(organization_id));

create policy process_steps_select_member on public.process_steps for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy process_steps_insert_editor on public.process_steps for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy process_steps_update_editor on public.process_steps for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy process_steps_delete_admin on public.process_steps for delete to authenticated using (public.can_admin_organization(organization_id));

create policy issues_select_member on public.issues for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy issues_insert_editor on public.issues for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy issues_update_editor on public.issues for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy issues_delete_admin on public.issues for delete to authenticated using (public.can_admin_organization(organization_id));

create policy actions_select_member on public.actions for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy actions_insert_editor on public.actions for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy actions_update_editor on public.actions for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy actions_delete_admin on public.actions for delete to authenticated using (public.can_admin_organization(organization_id));

create policy kpis_select_member on public.kpis for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy kpis_insert_editor on public.kpis for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy kpis_update_editor on public.kpis for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy kpis_delete_admin on public.kpis for delete to authenticated using (public.can_admin_organization(organization_id));

create policy kpi_measurements_select_member on public.kpi_measurements for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy kpi_measurements_insert_editor on public.kpi_measurements for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy kpi_measurements_update_editor on public.kpi_measurements for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy kpi_measurements_delete_admin on public.kpi_measurements for delete to authenticated using (public.can_admin_organization(organization_id));

create policy audits_select_member on public.audits for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy audits_insert_editor on public.audits for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy audits_update_editor on public.audits for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy audits_delete_admin on public.audits for delete to authenticated using (public.can_admin_organization(organization_id));

create policy audit_findings_select_member on public.audit_findings for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy audit_findings_insert_editor on public.audit_findings for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy audit_findings_update_editor on public.audit_findings for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy audit_findings_delete_admin on public.audit_findings for delete to authenticated using (public.can_admin_organization(organization_id));

create policy documents_select_member on public.documents for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy documents_insert_editor on public.documents for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy documents_update_editor on public.documents for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy documents_delete_admin on public.documents for delete to authenticated using (public.can_admin_organization(organization_id));

create policy suppliers_select_member on public.suppliers for select to authenticated using ((workspace_id is null and public.has_org_membership(organization_id)) or (workspace_id is not null and public.can_access_workspace(organization_id, workspace_id)));
create policy suppliers_insert_editor on public.suppliers for insert to authenticated with check ((workspace_id is null and public.has_org_membership(organization_id, array['org_admin','org_manager','org_member','ascalis_admin','ascalis_consultant'])) or (workspace_id is not null and public.can_edit_workspace(organization_id, workspace_id)));
create policy suppliers_update_editor on public.suppliers for update to authenticated using ((workspace_id is null and public.has_org_membership(organization_id, array['org_admin','org_manager','org_member','ascalis_admin','ascalis_consultant'])) or (workspace_id is not null and public.can_edit_workspace(organization_id, workspace_id))) with check ((workspace_id is null and public.has_org_membership(organization_id, array['org_admin','org_manager','org_member','ascalis_admin','ascalis_consultant'])) or (workspace_id is not null and public.can_edit_workspace(organization_id, workspace_id)));
create policy suppliers_delete_admin on public.suppliers for delete to authenticated using (public.can_admin_organization(organization_id));

create policy supplier_assessments_select_member on public.supplier_assessments for select to authenticated using ((workspace_id is null and public.has_org_membership(organization_id)) or (workspace_id is not null and public.can_access_workspace(organization_id, workspace_id)));
create policy supplier_assessments_insert_editor on public.supplier_assessments for insert to authenticated with check ((workspace_id is null and public.has_org_membership(organization_id, array['org_admin','org_manager','org_member','ascalis_admin','ascalis_consultant'])) or (workspace_id is not null and public.can_edit_workspace(organization_id, workspace_id)));
create policy supplier_assessments_update_editor on public.supplier_assessments for update to authenticated using ((workspace_id is null and public.has_org_membership(organization_id, array['org_admin','org_manager','org_member','ascalis_admin','ascalis_consultant'])) or (workspace_id is not null and public.can_edit_workspace(organization_id, workspace_id))) with check ((workspace_id is null and public.has_org_membership(organization_id, array['org_admin','org_manager','org_member','ascalis_admin','ascalis_consultant'])) or (workspace_id is not null and public.can_edit_workspace(organization_id, workspace_id)));
create policy supplier_assessments_delete_admin on public.supplier_assessments for delete to authenticated using (public.can_admin_organization(organization_id));

create policy reviews_select_member on public.reviews for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy reviews_insert_editor on public.reviews for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy reviews_update_editor on public.reviews for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy reviews_delete_admin on public.reviews for delete to authenticated using (public.can_admin_organization(organization_id));

create policy review_decisions_select_member on public.review_decisions for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy review_decisions_insert_editor on public.review_decisions for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy review_decisions_update_editor on public.review_decisions for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy review_decisions_delete_admin on public.review_decisions for delete to authenticated using (public.can_admin_organization(organization_id));

create policy customer_needs_select_member on public.customer_needs for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy customer_needs_insert_editor on public.customer_needs for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy customer_needs_update_editor on public.customer_needs for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy customer_needs_delete_admin on public.customer_needs for delete to authenticated using (public.can_admin_organization(organization_id));

create policy customer_journey_items_select_member on public.customer_journey_items for select to authenticated using (public.can_access_workspace(organization_id, workspace_id));
create policy customer_journey_items_insert_editor on public.customer_journey_items for insert to authenticated with check (public.can_edit_workspace(organization_id, workspace_id));
create policy customer_journey_items_update_editor on public.customer_journey_items for update to authenticated using (public.can_edit_workspace(organization_id, workspace_id)) with check (public.can_edit_workspace(organization_id, workspace_id));
create policy customer_journey_items_delete_admin on public.customer_journey_items for delete to authenticated using (public.can_admin_organization(organization_id));
