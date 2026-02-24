-- Feature Flags - Centralized Toggle System
-- Migration: 20260224000003
-- Description: Database-backed feature flags with audit logging and role-based access

-- ============================================================================
-- ADD ROLE TO PROFILES
-- ============================================================================

alter table public.profiles
  add column if not exists role text default 'user'
  check (role in ('user', 'admin'));

-- ============================================================================
-- FEATURE FLAGS TABLE
-- ============================================================================

create table public.feature_flags (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  name text not null unique,
  description text,
  category text not null default 'system',
  scope text[] not null default '{global}',
  enabled boolean not null default false,
  enabled_for_users uuid[] default '{}',

  constraint flag_name_format check (name ~ '^[A-Z][A-Z0-9_]+$'),
  constraint category_values check (
    category in (
      'auth', 'ui', 'generation', 'storage', 'analytics',
      'system', 'integration', 'quality', 'email', 'billing'
    )
  )
);

alter table public.feature_flags enable row level security;

create policy "Authenticated users can read feature flags"
  on public.feature_flags for select
  to authenticated
  using (true);

create policy "Admins can manage feature flags"
  on public.feature_flags for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================================
-- FEATURE FLAG CHANGES (AUDIT LOG)
-- ============================================================================

create table public.feature_flag_changes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  flag_id uuid references public.feature_flags on delete cascade not null,
  changed_by uuid references auth.users on delete set null,
  field text not null,
  old_value text,
  new_value text
);

alter table public.feature_flag_changes enable row level security;

create policy "Admins can read audit log"
  on public.feature_flag_changes for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

create or replace function public.update_feature_flag_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger feature_flags_updated_at
  before update on public.feature_flags
  for each row
  execute function public.update_feature_flag_timestamp();

-- ============================================================================
-- AUDIT LOG TRIGGER
-- ============================================================================

create or replace function public.log_feature_flag_change()
returns trigger as $$
begin
  if old.enabled is distinct from new.enabled then
    insert into public.feature_flag_changes (flag_id, changed_by, field, old_value, new_value)
    values (new.id, auth.uid(), 'enabled', old.enabled::text, new.enabled::text);
  end if;
  if old.enabled_for_users is distinct from new.enabled_for_users then
    insert into public.feature_flag_changes (flag_id, changed_by, field, old_value, new_value)
    values (new.id, auth.uid(), 'enabled_for_users',
      array_to_string(old.enabled_for_users, ','),
      array_to_string(new.enabled_for_users, ',')
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger feature_flags_audit
  after update on public.feature_flags
  for each row
  execute function public.log_feature_flag_change();

-- ============================================================================
-- SEED EXISTING FLAGS
-- ============================================================================

insert into public.feature_flags (name, description, category, enabled) values
  ('ENABLE_GOOGLE_SSO', 'Allow users to sign in with Google OAuth', 'auth', true),
  ('ENABLE_GITHUB_SSO', 'Allow users to sign in with GitHub OAuth', 'auth', true),
  ('ENABLE_EMAIL_SIGNUP', 'Allow users to sign up with email and password', 'auth', true),
  ('ENABLE_COMPONENT_GENERATION', 'Enable AI-powered component generation', 'generation', true),
  ('ENABLE_PROJECT_THUMBNAILS', 'Allow uploading project thumbnail images', 'storage', true),
  ('ENABLE_REALTIME_UPDATES', 'Enable real-time updates via Supabase Realtime', 'system', true),
  ('ENABLE_DARK_MODE', 'Allow users to toggle dark mode', 'ui', true),
  ('ENABLE_ANALYTICS', 'Track user analytics and usage metrics', 'analytics', false),
  ('ENABLE_MAINTENANCE_MODE', 'Enable maintenance mode (blocks all access)', 'system', false),
  ('ENABLE_BETA_FEATURES', 'Enable experimental beta features', 'system', false),
  ('ENABLE_GITHUB_APP', 'Enable GitHub App integration for repo linking', 'integration', false),
  ('ENABLE_QUALITY_GATES', 'Run quality checks before PR creation', 'quality', false),
  ('ENABLE_MULTI_LLM', 'Allow selecting between AI providers', 'generation', false),
  ('ENABLE_RESEND_EMAILS', 'Send transactional emails via Resend SDK', 'email', false),
  ('ENABLE_CENTRALIZED_FEATURE_FLAGS', 'Use database-backed feature flags instead of env vars', 'system', false)
on conflict (name) do nothing;
