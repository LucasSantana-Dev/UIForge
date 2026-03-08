-- Team-based RBAC: Teams, membership, and entity permissions
-- Extends existing profiles.role (user/admin) with team-level granular permissions

-- Teams table
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  owner_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_teams_slug on teams(slug);
create index idx_teams_owner on teams(owner_id);

-- Team membership with roles
create type team_role as enum ('viewer', 'editor', 'admin', 'owner');

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role team_role not null default 'viewer',
  invited_by uuid references profiles(id) on delete set null,
  joined_at timestamptz not null default now(),
  constraint team_members_unique unique (team_id, user_id)
);

create index idx_team_members_team on team_members(team_id);
create index idx_team_members_user on team_members(user_id);

-- Entity-level permissions (catalog entries, projects)
create type entity_permission as enum ('view', 'edit', 'admin', 'delete');

create table if not exists entity_permissions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('catalog_entry', 'project', 'template', 'golden_path')),
  entity_id uuid not null,
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  permission entity_permission not null default 'view',
  granted_by uuid references profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  constraint entity_permissions_has_grantee check (team_id is not null or user_id is not null),
  constraint entity_permissions_unique unique (entity_type, entity_id, team_id, user_id, permission)
);

create index idx_entity_perms_entity on entity_permissions(entity_type, entity_id);
create index idx_entity_perms_team on entity_permissions(team_id);
create index idx_entity_perms_user on entity_permissions(user_id);

-- RLS
alter table teams enable row level security;
alter table team_members enable row level security;
alter table entity_permissions enable row level security;

create policy "Authenticated users can view teams"
  on teams for select
  using (auth.role() = 'authenticated');

create policy "Team owners can manage teams"
  on teams for all
  using (auth.uid() = owner_id);

create policy "Members can view their memberships"
  on team_members for select
  using (auth.uid() = user_id or team_id in (
    select team_id from team_members where user_id = auth.uid() and role in ('admin', 'owner')
  ));

create policy "Team admins can manage members"
  on team_members for all
  using (team_id in (
    select team_id from team_members where user_id = auth.uid() and role in ('admin', 'owner')
  ));

create policy "Users can view their entity permissions"
  on entity_permissions for select
  using (auth.role() = 'authenticated');

create policy "Entity admins can manage permissions"
  on entity_permissions for all
  using (
    granted_by = auth.uid() or
    auth.uid() in (
      select user_id from team_members
      where team_id = entity_permissions.team_id and role in ('admin', 'owner')
    )
  );
