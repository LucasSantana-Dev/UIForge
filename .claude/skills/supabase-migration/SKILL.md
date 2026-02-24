---
name: supabase-migration
description: Scaffold and validate Supabase database migrations for Siza
disable-model-invocation: true
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
- **11 tables with RLS**: profiles, projects, components, generations, api_keys, feature_flags, feature_flag_changes, subscriptions, plan_limits, usage_tracking, stripe_events
- **4 storage buckets**: avatars, project-thumbnails, project-files, user-uploads
- **10 existing migrations** in `supabase/migrations/`
- **Naming pattern**: `YYYYMMDDHHMMSS_description.sql`

## Workflow

### 1. Scaffold Migration
Create file at `supabase/migrations/YYYYMMDDHHMMSS_{{migration-name}}.sql` using current timestamp.

### 2. Follow Established Patterns
Reference existing migrations for style:
- Always include `-- Migration: description` header comment
- Enable RLS on new tables: `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;`
- Create RLS policies for authenticated users
- Use `uuid_generate_v4()` for primary keys
- Add `created_at TIMESTAMPTZ DEFAULT NOW()` and `updated_at TIMESTAMPTZ DEFAULT NOW()` to all tables
- Create updated_at trigger: `CREATE TRIGGER set_updated_at BEFORE UPDATE ON tablename FOR EACH ROW EXECUTE FUNCTION update_updated_at();`
- Reference `auth.uid()` for user ownership in RLS policies

### 3. Validate Migration
```bash
# Check SQL syntax (basic validation)
supabase db lint --level warning 2>&1

# Test migration locally (requires local Supabase running)
supabase db reset 2>&1

# Generate updated TypeScript types
supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts
```

### 4. Update CLAUDE.md
If adding new tables, update the schema section in CLAUDE.md:
- Table count
- Table names
- Migration count

### 5. Verify Rollback
Ensure the migration can be rolled back if needed. For each CREATE TABLE, note what DROP TABLE would reverse it. For ALTER TABLE, note the reverse ALTER.

## Output
- Migration SQL file created at `supabase/migrations/`
- TypeScript types regenerated (if local Supabase is running)
- CLAUDE.md updated with new schema info
- Rollback instructions documented

## Example Migration
```sql
-- Migration: Add user preferences table

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
