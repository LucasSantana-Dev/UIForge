-- Siza Webapp - Seed Data
-- Version: 0.1.1
-- Created: 2026-02-15
-- Description: Sample data for development and testing

-- ============================================================================
-- SEED DATA (Development Only)
-- ============================================================================

-- Note: This seed data is for local development only
-- Do not run this in production

-- Insert sample template projects (requires manual user creation first)
-- These will be created by the first admin user

-- Example template project structure:
-- insert into public.projects (user_id, name, description, framework, is_template, is_public)
-- values (
--   'user-uuid-here',
--   'Landing Page Template',
--   'Modern landing page with hero section, features, and CTA',
--   'nextjs',
--   true,
--   true
-- );

-- For now, seed data will be minimal
-- Real templates will be created through the UI

-- ============================================================================
-- DEVELOPMENT HELPERS
-- ============================================================================

-- Function to reset all user data (development only)
create or replace function public.dev_reset_user_data(user_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Delete in order due to foreign key constraints
  delete from public.generations where user_id = user_uuid;
  delete from public.components where user_id = user_uuid;
  delete from public.projects where user_id = user_uuid;
  delete from public.api_keys where user_id = user_uuid;
  
  raise notice 'Reset all data for user: %', user_uuid;
end;
$$;

comment on function public.dev_reset_user_data is 'Development helper to reset all user data (DO NOT USE IN PRODUCTION)';
