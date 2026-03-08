import { getClient } from './base.repo';

export type TeamRole = 'viewer' | 'editor' | 'admin' | 'owner';
export type EntityPermission = 'view' | 'edit' | 'admin' | 'delete';
export type EntityType = 'catalog_entry' | 'project' | 'template' | 'golden_path';

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  profile?: { id: string; full_name: string; avatar_url: string | null };
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export async function getTeamsForUser(userId: string): Promise<Team[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('team:teams(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map((d) => d.team as unknown as Team).filter(Boolean);
}

export async function getTeamBySlug(slug: string): Promise<TeamWithMembers | null> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*, members:team_members(*, profile:profiles(id, full_name, avatar_url))')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as TeamWithMembers;
}

export async function createTeam(
  name: string,
  slug: string,
  ownerId: string,
  description?: string
): Promise<Team> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('teams')
    .insert({ name, slug, owner_id: ownerId, description })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('team_members').insert({ team_id: data.id, user_id: ownerId, role: 'owner' });

  return data;
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: TeamRole,
  invitedBy: string
): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: userId, role, invited_by: invitedBy });

  if (error) throw error;
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: TeamRole
): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getUserRoleInTeam(teamId: string, userId: string): Promise<TeamRole | null> {
  const supabase = await getClient();
  const { data } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single();

  return data?.role ?? null;
}

export async function checkEntityPermission(
  entityType: EntityType,
  entityId: string,
  userId: string,
  requiredPermission: EntityPermission
): Promise<boolean> {
  const supabase = await getClient();

  const permissionHierarchy: Record<EntityPermission, EntityPermission[]> = {
    view: ['view', 'edit', 'admin', 'delete'],
    edit: ['edit', 'admin', 'delete'],
    admin: ['admin', 'delete'],
    delete: ['delete'],
  };

  const validPermissions = permissionHierarchy[requiredPermission];

  const { data: directPerms } = await supabase
    .from('entity_permissions')
    .select('permission')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('user_id', userId)
    .in('permission', validPermissions);

  if (directPerms && directPerms.length > 0) return true;

  const { data: teamPerms } = await supabase
    .from('entity_permissions')
    .select('permission, team_id')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .in('permission', validPermissions)
    .not('team_id', 'is', null);

  if (!teamPerms || teamPerms.length === 0) return false;

  const teamIds = [...new Set(teamPerms.map((p) => p.team_id))];
  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .in('team_id', teamIds);

  return (memberships && memberships.length > 0) || false;
}
