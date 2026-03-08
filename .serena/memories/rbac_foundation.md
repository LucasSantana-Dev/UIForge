# RBAC Foundation (v0.39.1+)

## Status
- **Branch**: `feat/teams-ui` (PR #387)
- **PRs**: 
  - #386 MERGED (foundation — database schema + repository layer + API routes + hooks)
  - #387 OPEN (Teams UI — list/create/detail/member management)
- **Feature Flag**: `ENABLE_RBAC` (35th flag, disabled by default)

## Implementation

### Database Schema (`supabase/migrations/20260309000003_team_rbac.sql`)
- **teams**: id, name, slug, avatar_url, settings (jsonb), created_at, updated_at
- **team_members**: id, team_id, user_id, role (owner|admin|member|viewer), joined_at
- **entity_permissions**: id, team_id, entity_type (project|template|generation), entity_id, permission_level (owner|write|read|none), created_at, updated_at
- **RLS Policies**: Authenticated users read teams they're members of, owners write, admins manage members

### Repository Layer (`apps/web/src/lib/repositories/rbac.repo.ts`)
- `createTeam()`, `getTeam()`, `updateTeam()`, `deleteTeam()`
- `addTeamMember()`, `removeTeamMember()`, `updateMemberRole()`
- `getTeamMembers()`, `getUserTeams()`
- `setEntityPermission()`, `getEntityPermission()`, `checkEntityPermission()`
- **Permission Hierarchy**: owner > write > read > none (owner = full CRUD, write = modify, read = view, none = hidden)

### API Routes
- `apps/web/src/app/api/teams/route.ts` — GET (list user teams), POST (create team)
- `apps/web/src/app/api/teams/[slug]/route.ts` — GET team, POST add member, PATCH update member, DELETE remove member

### Frontend Integration
- `apps/web/src/hooks/use-teams.ts` — TanStack Query hooks (useTeams, useTeam, useCreateTeam, useTeamMembers, useAddMember, useUpdateMember, useRemoveMember)
- Sidebar navigation: Teams entry gated by `ENABLE_RBAC` flag

## Teams UI Files (PR #387)
- `apps/web/src/app/(dashboard)/teams/page.tsx` — Teams list page (server component)
- `apps/web/src/app/(dashboard)/teams/teams-client.tsx` — Team list + create form (client component)
- `apps/web/src/app/(dashboard)/teams/[id]/page.tsx` — Team detail page (server component)
- `apps/web/src/app/(dashboard)/teams/[id]/team-detail-client.tsx` — Member management with inline role editing (client component)

**Pattern**: Permission hierarchy uses ordered array `indexOf()` for both `checkEntityPermission()` in repository layer AND member role sorting in UI.

## Next Steps (not yet implemented)
1. Permission checks in project/template/generation flows
2. Team switcher in app header
3. Workspace-level permission inheritance
4. Audit log integration for permission changes

## Gotchas
- Feature flag count is now **35** (updated from 34 in flags.test.ts)
- RBAC is disabled by default — must enable flag in Supabase dashboard or env
- Permission hierarchy enforced at repository layer, NOT database constraints
- RLS policies use `user_id = auth.uid()` for security
