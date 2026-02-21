-- ============================================================================
-- GITHUB SYNC CONFLICTS TABLE
-- ============================================================================
-- Track conflicts between UIForge and GitHub during sync operations

CREATE TABLE public.github_sync_conflicts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at timestamp with time zone,

  -- Relationships
  project_id uuid REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  component_id uuid REFERENCES public.components ON DELETE CASCADE NOT NULL,

  -- Conflict details
  component_name text NOT NULL,
  github_path text NOT NULL,
  conflict_type text NOT NULL CHECK (conflict_type IN ('content_modified_both', 'structure_mismatch', 'file_deleted', 'permission_denied')),
  resolution_status text DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved_local', 'resolved_github', 'resolved_manual', 'ignored')),

  -- Content snapshots for comparison
  local_content text,
  github_content text,

  -- Resolution tracking
  resolved_by uuid REFERENCES auth.users,
  resolution_action text,
  resolution_notes text,

  -- Metadata
  sync_operation_id uuid REFERENCES public.github_sync_status,
  github_commit_hash text,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS
ALTER TABLE public.github_sync_conflicts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for github_sync_conflicts
CREATE POLICY "Users can view their own conflicts"
  ON public.github_sync_conflicts FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can insert their own conflicts"
  ON public.github_sync_conflicts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can update their own conflicts"
  ON public.github_sync_conflicts FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = (SELECT user_id FROM public.projects WHERE id = project_id))
  WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can delete their own conflicts"
  ON public.github_sync_conflicts FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = (SELECT user_id FROM public.projects WHERE id = project_id));

-- Indexes
CREATE INDEX github_sync_conflicts_project_id_idx ON public.github_sync_conflicts (project_id);
CREATE INDEX github_sync_conflicts_component_id_idx ON public.github_sync_conflicts (component_id);
CREATE INDEX github_sync_conflicts_status_idx ON public.github_sync_conflicts (resolution_status);
CREATE INDEX github_sync_conflicts_created_at_idx ON public.github_sync_conflicts (created_at);

-- Trigger for updated_at
CREATE TRIGGER on_github_sync_conflicts_updated
  BEFORE UPDATE ON public.github_sync_conflicts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.github_sync_conflicts IS 'Track conflicts between UIForge and GitHub during sync operations';
COMMENT ON COLUMN public.github_sync_conflicts.conflict_type IS 'Type of conflict that occurred during sync';
COMMENT ON COLUMN public.github_sync_conflicts.resolution_status IS 'Current status of conflict resolution';
COMMENT ON COLUMN public.github_sync_conflicts.local_content IS 'Snapshot of local component content at time of conflict';
COMMENT ON COLUMN public.github_sync_conflicts.github_content IS 'Snapshot of GitHub file content at time of conflict';
COMMENT ON COLUMN public.github_sync_conflicts.severity IS 'Severity level of the conflict for prioritization';
