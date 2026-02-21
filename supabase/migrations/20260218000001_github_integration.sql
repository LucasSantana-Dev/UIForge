-- GitHub Integration - Database Schema Extensions
-- Version: 0.1.1
-- Created: 2026-02-18
-- Description: Add tables for GitHub repository integration and sync tracking

-- ============================================================================
-- GITHUB REPOSITORIES TABLE
-- ============================================================================
-- Stores GitHub repositories connected to user accounts

CREATE TABLE public.github_repositories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Ownership
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- GitHub repository details
  github_repo_id integer NOT NULL,
  repo_name text NOT NULL,
  repo_owner text NOT NULL,
  default_branch text DEFAULT 'main',
  is_private boolean DEFAULT false,
  repo_url text NOT NULL,

  -- Authentication and access
  access_token_encrypted text, -- Encrypted GitHub access token
  token_scope text DEFAULT 'repo', -- GitHub token scope
  token_expires_at timestamp with time zone,

  -- Configuration
  auto_sync_enabled boolean DEFAULT true,
  sync_frequency_minutes integer DEFAULT 30,

  -- Constraints
  constraint unique_user_repo unique (user_id, github_repo_id),
  constraint repo_name_length check (char_length(repo_name) >= 1 and char_length(repo_name) <= 255)
);

-- Enable RLS
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for github_repositories
CREATE POLICY "Users can view their own GitHub repositories"
  ON public.github_repositories FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own GitHub repositories"
  ON public.github_repositories FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own GitHub repositories"
  ON public.github_repositories FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own GitHub repositories"
  ON public.github_repositories FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX github_repositories_user_id_idx ON public.github_repositories (user_id);
CREATE INDEX github_repositories_github_repo_id_idx ON public.github_repositories (github_repo_id);

-- ============================================================================
-- GITHUB REPO CONFIG TABLE
-- ============================================================================
-- Stores user preferences for repository structure and organization

CREATE TABLE public.github_repo_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Relationships
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  github_repo_id uuid REFERENCES public.github_repositories ON DELETE CASCADE NOT NULL,

  -- Architecture configuration
  architecture_type text NOT NULL DEFAULT 'atomic' CHECK (architecture_type IN ('atomic', 'fsd', 'custom')),

  -- Folder structure configuration (JSON)
  folder_config jsonb DEFAULT '{}',

  -- File naming conventions
  component_naming_pattern text DEFAULT 'PascalCase',
  file_extension text DEFAULT '.tsx',
  generate_index_files boolean DEFAULT true,

  -- Sync preferences
  sync_style_files boolean DEFAULT true,
  sync_test_files boolean DEFAULT false,
  sync_story_files boolean DEFAULT false,

  -- Branch configuration
  default_sync_branch text DEFAULT 'main',
  create_pr_for_sync boolean DEFAULT false,

  -- Constraints
  constraint unique_user_repo_config unique (user_id, github_repo_id)
);

-- Enable RLS
ALTER TABLE public.github_repo_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for github_repo_config
CREATE POLICY "Users can view their own repo configurations"
  ON public.github_repo_config FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own repo configurations"
  ON public.github_repo_config FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own repo configurations"
  ON public.github_repo_config FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own repo configurations"
  ON public.github_repo_config FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX github_repo_config_user_id_idx ON public.github_repo_config (user_id);
CREATE INDEX github_repo_config_github_repo_id_idx ON public.github_repo_config (github_repo_id);

-- ============================================================================
-- GITHUB SYNC STATUS TABLE
-- ============================================================================
-- Track sync operations between projects and GitHub repositories

CREATE TABLE public.github_sync_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Relationships
  project_id uuid REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  github_repo_id uuid REFERENCES public.github_repositories ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Sync details
  branch text NOT NULL,
  last_sync_at timestamp with time zone,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'in_progress', 'success', 'error', 'conflict')),

  -- GitHub details
  commit_hash text,
  commit_url text,
  pr_number integer,
  pr_url text,

  -- Error handling
  error_message text,
  error_details jsonb,
  retry_count integer DEFAULT 0,

  -- Sync statistics
  files_synced integer DEFAULT 0,
  files_created integer DEFAULT 0,
  files_updated integer DEFAULT 0,
  files_deleted integer DEFAULT 0,

  -- Metadata
  sync_type text DEFAULT 'component' CHECK (sync_type IN ('component', 'project', 'import', 'full')),
  sync_direction text DEFAULT 'to_github' CHECK (sync_direction IN ('to_github', 'from_github', 'bidirectional')),
  triggered_by text DEFAULT 'user' CHECK (triggered_by IN ('user', 'auto', 'system'))
);

-- Enable RLS
ALTER TABLE public.github_sync_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for github_sync_status
CREATE POLICY "Users can view their own sync status"
  ON public.github_sync_status FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own sync status"
  ON public.github_sync_status FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own sync status"
  ON public.github_sync_status FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own sync status"
  ON public.github_sync_status FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX github_sync_status_project_id_idx ON public.github_sync_status (project_id);
CREATE INDEX github_sync_status_github_repo_id_idx ON public.github_sync_status (github_repo_id);
CREATE INDEX github_sync_status_user_id_idx ON public.github_sync_status (user_id);
CREATE INDEX github_sync_status_status_idx ON public.github_sync_status (sync_status);
CREATE INDEX github_sync_status_last_sync_idx ON public.github_sync_status (last_sync_at DESC);

-- ============================================================================
-- UPDATE PROJECTS TABLE
-- ============================================================================
-- Add GitHub integration fields to existing projects table

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS github_repo_id uuid REFERENCES public.github_repositories ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS github_branch text DEFAULT 'main',
ADD COLUMN IF NOT EXISTS repo_structure jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS github_sync_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_github_sync_at timestamp with time zone;

-- Add indexes for new GitHub fields
CREATE INDEX projects_github_repo_id_idx ON public.projects (github_repo_id) WHERE github_repo_id IS NOT NULL;
CREATE INDEX projects_github_sync_enabled_idx ON public.projects (github_sync_enabled) WHERE github_sync_enabled = true;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER on_github_repositories_updated
  BEFORE UPDATE ON public.github_repositories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_github_repo_config_updated
  BEFORE UPDATE ON public.github_repo_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_github_sync_status_updated
  BEFORE UPDATE ON public.github_sync_status
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.github_repositories IS 'GitHub repositories connected to user accounts';
COMMENT ON TABLE public.github_repo_config IS 'User preferences for repository structure and organization';
COMMENT ON TABLE public.github_sync_status IS 'Track sync operations between projects and GitHub repositories';

COMMENT ON COLUMN public.github_repositories.access_token_encrypted IS 'Encrypted GitHub access token for API operations';
COMMENT ON COLUMN public.github_repositories.auto_sync_enabled IS 'Whether automatic sync is enabled for this repository';
COMMENT ON COLUMN public.github_repo_config.architecture_type IS 'Type of React architecture (atomic, fsd, custom)';
COMMENT ON COLUMN public.github_repo_config.folder_config IS 'JSON configuration for folder structure';
COMMENT ON COLUMN public.github_sync_status.sync_status IS 'Current status of sync operation';
COMMENT ON COLUMN public.github_sync_status.commit_hash IS 'GitHub commit hash for last successful sync';
COMMENT ON COLUMN public.projects.github_repo_id IS 'Connected GitHub repository ID (nullable)';
COMMENT ON COLUMN public.projects.github_branch IS 'Default branch for GitHub operations';
COMMENT ON COLUMN public.projects.repo_structure IS 'JSON configuration for repository structure';
