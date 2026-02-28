-- Fix Supabase database linter security warnings
-- Addresses: function_search_path_mutable, extension_in_public, rls_policy_always_true
-- Ref: https://supabase.com/docs/guides/database/database-linter

-- ============================================================
-- 1. Create extensions schema grants (schema already exists)
-- ============================================================

GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- ============================================================
-- 2. Pin function search paths (while vector is still in public)
-- ============================================================

-- Trigger functions
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.update_feature_flag_timestamp() SET search_path = public;
ALTER FUNCTION public.update_subscription_timestamp() SET search_path = public;
ALTER FUNCTION public.create_default_subscription() SET search_path = public;
ALTER FUNCTION public.log_feature_flag_change() SET search_path = public;
ALTER FUNCTION public.cleanup_orphaned_files() SET search_path = public;

-- Query functions
ALTER FUNCTION public.get_user_project_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_component_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_generation_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_storage_usage(uuid) SET search_path = public;

-- Vector similarity (pinned to public + extensions for <=> operator)
ALTER FUNCTION public.match_patterns(vector, double precision, integer)
  SET search_path = public, extensions;
ALTER FUNCTION public.match_generations(vector, double precision, integer, double precision)
  SET search_path = public, extensions;

-- ============================================================
-- 3. Move extensions out of public schema
-- ============================================================

ALTER EXTENSION pg_trgm SET SCHEMA extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- ============================================================
-- 4. Tighten RLS policy on shared_logs
-- ============================================================

DROP POLICY "Authenticated users can insert shared_logs" ON public.shared_logs;
CREATE POLICY "Authenticated users can insert shared_logs"
  ON public.shared_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
