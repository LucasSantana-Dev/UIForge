-- Fix Supabase linter warnings: RLS initplan, multiple permissive policies, unindexed FKs
-- Addresses 5 WARN-level and 6 INFO-level issues from database advisor
BEGIN;
-- ============================================================
-- 1. FIX auth_rls_initplan: Wrap auth.uid() in (select ...)
--    to prevent per-row re-evaluation in RLS policies
-- ============================================================
-- 1a. user_provider_tokens: "Users can manage own tokens"
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.user_provider_tokens;
CREATE POLICY "Users can manage own tokens"
  ON public.user_provider_tokens FOR ALL
  USING ((select auth.uid()) = user_id);
-- 1b. github_installations: "Users manage own installations"
DROP POLICY IF EXISTS "Users manage own installations" ON public.github_installations;
CREATE POLICY "Users manage own installations"
  ON public.github_installations FOR ALL
  USING ((select auth.uid()) = user_id);
-- 1c. github_repos: "Users see repos from own installations"
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
-- 2. FIX multiple_permissive_policies: Combine redundant
--    SELECT policies into single policies per role
-- ============================================================
-- 2a. feature_flags: "Admins can manage feature flags" (FOR ALL)
--     overlaps with "Authenticated users can read feature flags" (FOR SELECT)
--     on the authenticated role for SELECT action.
--     Fix: Split admin policy into INSERT/UPDATE/DELETE only,
--     keep the read-all policy as the single SELECT policy.
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
-- 2b. projects: "Public projects are viewable by everyone" (SELECT, authenticated+anon)
--     overlaps with "Users can view their own projects" (SELECT, authenticated)
--     on the authenticated role for SELECT action.
--     Fix: Combine into one authenticated SELECT + one anon SELECT.
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
-- 3. FIX unindexed_foreign_keys: Add covering indexes
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
-- NOTE: 35 unused_index advisories are intentionally NOT addressed.
-- The app is pre-production and many code paths haven't been
-- exercised yet. These indexes back queries that will be needed
-- with real traffic. Storage cost is negligible.
-- ============================================================
COMMIT;
