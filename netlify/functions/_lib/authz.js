const { getSupabaseAdmin } = require('./supabaseAdmin');
const { getAccessToken } = require('./supabaseClient');

async function getAuthenticatedUser(event) {
  const accessToken = getAccessToken(event);
  if (!accessToken) {
    return null;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error) {
    throw new Error(`Unable to validate access token: ${error.message}`);
  }

  return data?.user || null;
}

async function getUserContext(userId) {
  const admin = getSupabaseAdmin();

  const [profileResult, orgMembershipResult, workspaceMembershipResult] = await Promise.all([
    admin.from('profiles').select('*').eq('id', userId).maybeSingle(),
    admin.from('organization_memberships').select('*').eq('user_id', userId).eq('status', 'active'),
    admin.from('workspace_memberships').select('*').eq('user_id', userId).eq('status', 'active')
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (orgMembershipResult.error) throw new Error(orgMembershipResult.error.message);
  if (workspaceMembershipResult.error) throw new Error(workspaceMembershipResult.error.message);

  return {
    profile: profileResult.data,
    organizationMemberships: orgMembershipResult.data || [],
    workspaceMemberships: workspaceMembershipResult.data || []
  };
}

function hasOrganizationRole(context, organizationId, allowedRoles = []) {
  return (context.organizationMemberships || []).some((membership) =>
    membership.organization_id === organizationId &&
    (allowedRoles.length === 0 || allowedRoles.includes(membership.role))
  );
}

function hasWorkspaceRole(context, workspaceId, allowedRoles = []) {
  return (context.workspaceMemberships || []).some((membership) =>
    membership.workspace_id === workspaceId &&
    (allowedRoles.length === 0 || allowedRoles.includes(membership.role))
  );
}

async function requireUser(event) {
  const user = await getAuthenticatedUser(event);
  if (!user) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }
  const context = await getUserContext(user.id);
  return { user, context };
}

async function requireOrganizationAccess(event, organizationId, allowedRoles = []) {
  const { user, context } = await requireUser(event);
  if (!hasOrganizationRole(context, organizationId, allowedRoles)) {
    const error = new Error('Forbidden organization access');
    error.statusCode = 403;
    throw error;
  }
  return { user, context };
}

async function requireWorkspaceAccess(event, organizationId, workspaceId, options = {}) {
  const { user, context } = await requireUser(event);
  const orgRoles = options.organizationRoles || [];
  const workspaceRoles = options.workspaceRoles || [];

  const hasOrg = hasOrganizationRole(context, organizationId, orgRoles);
  const hasWorkspace = hasWorkspaceRole(context, workspaceId, workspaceRoles);

  if (!hasOrg || !hasWorkspace) {
    const error = new Error('Forbidden workspace access');
    error.statusCode = 403;
    throw error;
  }

  return { user, context };
}

async function requireProjectAccess(event, projectId, options = {}) {
  const admin = getSupabaseAdmin();
  const { data: project, error } = await admin
    .from('projects')
    .select('id, organization_id, workspace_id, owner_user_id')
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!project) {
    const notFound = new Error('Project not found');
    notFound.statusCode = 404;
    throw notFound;
  }

  const access = await requireWorkspaceAccess(event, project.organization_id, project.workspace_id, {
    organizationRoles: options.organizationRoles || ['org_admin', 'org_manager', 'org_member', 'org_viewer', 'ascalis_admin', 'ascalis_consultant'],
    workspaceRoles: options.workspaceRoles || ['workspace_admin', 'workspace_editor', 'workspace_viewer']
  });

  return { ...access, project };
}

module.exports = {
  getAuthenticatedUser,
  getUserContext,
  hasOrganizationRole,
  hasWorkspaceRole,
  requireUser,
  requireOrganizationAccess,
  requireWorkspaceAccess,
  requireProjectAccess
};
