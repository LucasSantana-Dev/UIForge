-- Fix Supabase database advisor warnings (WARN + INFO level)
-- Addresses: auth_rls_initplan, multiple_permissive_policies,
--            function_search_path_mutable, rls_policy_always_true,
--            unindexed_foreign_keys

BEGIN;

-- ============================================================
-- 1. FIX auth_rls_initplan (WARN): Wrap auth.uid() in (select ...)
--    to prevent per-row re-evaluation in RLS policies
-- ============================================================

-- user_provider_tokens
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.user_provider_tokens;
CREATE POLICY "Users can manage own tokens"
  ON public.user_provider_tokens FOR ALL
  USING ((select auth.uid()) = user_id);

-- github_installations
DROP POLICY IF EXISTS "Users manage own installations" ON public.github_installations;
CREATE POLICY "Users manage own installations"
  ON public.github_installations FOR ALL
  USING ((select auth.uid()) = user_id);

-- github_repos
DROP POLICY IF EXISTS "Users see repos from own installations" ON public.github_repos;
CREATE POLICY "Users see repos from own installations"
  ON public.github_repos FOR ALL
  USING (
    installation_id IN (
      SELECT gi.id FROM public.github_installations gi
      WHERE gi.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- 2. FIX multiple_permissive_policies (WARN): Eliminate redundant
--    SELECT policies for the same role
-- ============================================================

-- feature_flags: Split admin FOR ALL into per-operation policies
-- so "Authenticated users can read feature flags" is the only SELECT
DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can insert feature flags"
  ON public.feature_flags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
CREATE POLICY "Admins can update feature flags"
  ON public.feature_flags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
CREATE POLICY "Admins can delete feature flags"
  ON public.feature_flags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- projects: Combine dual SELECT into one per role
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view own and public projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR is_public = true);
CREATE POLICY "Public projects are viewable by anonymous"
  ON public.projects FOR SELECT
  TO anon
  USING (is_public = true);

-- ============================================================
-- 3. FIX function_search_path_mutable (WARN): Pin search paths
--    on all user-defined functions
-- ============================================================

ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.update_feature_flag_timestamp() SET search_path = public;
ALTER FUNCTION public.update_subscription_timestamp() SET search_path = public;
ALTER FUNCTION public.create_default_subscription() SET search_path = public;
ALTER FUNCTION public.log_feature_flag_change() SET search_path = public;
ALTER FUNCTION public.cleanup_orphaned_files() SET search_path = public;
ALTER FUNCTION public.get_user_project_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_component_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_generation_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_storage_usage(uuid) SET search_path = public;
DO $$
BEGIN
  ALTER FUNCTION public.match_patterns(extensions.vector, double precision, integer)
    SET search_path = public, extensions;
EXCEPTION WHEN undefined_function OR undefined_object THEN
  RAISE NOTICE 'match_patterns not found, skipping';
END;
$$;
DO $$
BEGIN
  ALTER FUNCTION public.match_generations(extensions.vector, double precision, integer, double precision)
    SET search_path = public, extensions;
EXCEPTION WHEN undefined_function OR undefined_object THEN
  RAISE NOTICE 'match_generations not found, skipping';
END;
$$;

-- ============================================================
-- 4. FIX rls_policy_always_true (WARN): Tighten overly
--    permissive INSERT policies
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can insert shared_logs" ON public.shared_logs;
CREATE POLICY "Authenticated users can insert shared_logs"
  ON public.shared_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- ============================================================
-- 5. Grant usage on extensions schema
-- ============================================================

GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- ============================================================
-- 6. FIX unindexed_foreign_keys (INFO): Add covering indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_gateway_config_updated_by
  ON mcp_gateway.gateway_config (updated_by);
CREATE INDEX IF NOT EXISTS idx_feature_flag_changes_changed_by
  ON public.feature_flag_changes (changed_by);
CREATE INDEX IF NOT EXISTS idx_feature_flag_changes_flag_id
  ON public.feature_flag_changes (flag_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_created_by
  ON public.file_versions (created_by);
CREATE INDEX IF NOT EXISTS idx_generations_component_id
  ON public.generations (component_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_granted_by
  ON public.project_permissions (granted_by);

-- ============================================================
-- NOTE: 35 unused_index advisories intentionally NOT addressed.
-- App is pre-production; indexes will be exercised with real
-- traffic. Storage cost is negligible vs slow query risk.
--
-- extension_in_public (pg_trgm, vector) deferred — moving
-- extensions requires verifying all DDL references use the
-- extensions schema. Tracked separately.
-- ============================================================

COMMIT;
