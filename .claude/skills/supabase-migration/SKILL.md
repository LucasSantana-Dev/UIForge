---
name: supabase-migration
description: Scaffold and validate Supabase database migrations for Siza
version: 2.0.0
tags: [supabase, database, migration, rls, postgres]
args:
  - name: migration-name
    description: Name for the migration (e.g., add_user_preferences)
    required: true
---

# Supabase Migration

Create, validate, and prepare Supabase database migrations following Siza's established patterns.

## Arguments
- `migration-name`: Snake_case name for the migration (e.g., `add_user_preferences`)

## Existing Schema Context

**Tables with RLS**: profiles, projects, components, generations, api_keys, feature_flags, feature_flag_changes, subscriptions, plan_limits, usage_tracking, stripe_events, teams, team_members, roles, permissions, entity_permissions, entity_relationships, plugins, user_plugins, skills

**Storage buckets**: avatars, project-thumbnails, project-files, user-uploads

**Key foreign keys**: Most tables reference `auth.users(id)`. Team-scoped tables reference `teams(id)`. Entity tables reference `catalog_entries(id)`.

**Migrations directory**: `supabase/migrations/`
**Naming pattern**: `YYYYMMDDHHMMSS_description.sql`

## Workflow

### 1. Scaffold Migration
Create file at `supabase/migrations/YYYYMMDDHHMMSS_{{migration-name}}.sql` using current timestamp.

### 2. Follow Established Patterns

#### Table Creation
```sql
-- Migration: <description>

CREATE TABLE IF NOT EXISTS public.<table_name> (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- columns here
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.<table_name>
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### RLS Policy Templates

**User-owned resources** (most common):
```sql
CREATE POLICY "Users can view own <resource>"
  ON public.<table_name> FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own <resource>"
  ON public.<table_name> FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own <resource>"
  ON public.<table_name> FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own <resource>"
  ON public.<table_name> FOR DELETE
  USING (auth.uid() = user_id);
```

**Team-scoped resources** (RBAC pattern):
```sql
-- Team members can view
CREATE POLICY "Team members can view <resource>"
  ON public.<table_name> FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = <table_name>.team_id
        AND tm.user_id = auth.uid()
    )
  );

-- Team admins/owners can manage
CREATE POLICY "Team admins can manage <resource>"
  ON public.<table_name> FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = <table_name>.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );
```

**Public read, authenticated write**:
```sql
CREATE POLICY "Anyone can view <resource>"
  ON public.<table_name> FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create <resource>"
  ON public.<table_name> FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

**Admin-only** (service role or admin flag):
```sql
CREATE POLICY "Admins can manage <resource>"
  ON public.<table_name> FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### Feature Flag Column (if feature-gated)
```sql
-- Add to feature_flags if gating this feature
INSERT INTO public.feature_flags (name, enabled, description)
VALUES ('ENABLE_<FEATURE>', false, '<description>')
ON CONFLICT (name) DO NOTHING;
```

#### Adding Columns to Existing Tables
```sql
-- Migration: Add <column> to <table>

ALTER TABLE public.<table_name>
  ADD COLUMN IF NOT EXISTS <column_name> <type> DEFAULT <default>;

-- If adding an indexed column
CREATE INDEX IF NOT EXISTS idx_<table>_<column>
  ON public.<table_name> (<column_name>);
```

#### GIN Index for Array/JSONB Columns
```sql
CREATE INDEX IF NOT EXISTS idx_<table>_<column>_gin
  ON public.<table_name> USING GIN (<column_name>);
```

### 3. Validate Migration
```bash
# Check SQL syntax (basic validation)
supabase db lint --level warning 2>&1

# Test migration locally (requires local Supabase running)
supabase db reset 2>&1

# Generate updated TypeScript types
supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts
```

### 4. Update Documentation
If adding new tables, update `CLAUDE.md` and `AGENTS.md`:
- Table count and names in schema section
- Migration count
- Any new storage buckets

### 5. Document Rollback
For each migration, include rollback SQL as comments at the bottom:
```sql
-- ROLLBACK:
-- DROP TABLE IF EXISTS public.<table_name>;
-- or
-- ALTER TABLE public.<table_name> DROP COLUMN IF EXISTS <column_name>;
```

## Common Gotchas
- Always use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- `auth.uid()` returns NULL for unauthenticated requests — RLS must handle this
- `supabase link` and `supabase db push` require `supabase login` first
- Migrations run in filename order — timestamp prefix ensures correct ordering
- Test RLS policies with both authenticated and unauthenticated queries
- For team-scoped resources, always join through `team_members` — never trust client-provided `team_id`

## Output
- Migration SQL file created at `supabase/migrations/`
- TypeScript types regenerated (if local Supabase is running)
- Documentation updated with new schema info
- Rollback instructions documented in migration file
