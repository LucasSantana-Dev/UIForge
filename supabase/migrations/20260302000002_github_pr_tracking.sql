CREATE TABLE IF NOT EXISTS github_prs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  repo_id UUID REFERENCES github_repos(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES github_installations(id) ON DELETE CASCADE,
  pr_number INTEGER NOT NULL,
  pr_url TEXT NOT NULL,
  pr_html_url TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'open'
    CHECK (state IN ('open', 'closed', 'merged')),
  merged_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  commit_sha TEXT,
  file_paths TEXT[],
  component_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE github_prs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own PRs"
  ON github_prs FOR ALL
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_github_prs_user ON github_prs (user_id);
CREATE INDEX idx_github_prs_project ON github_prs (project_id);
CREATE INDEX idx_github_prs_generation ON github_prs (generation_id);
CREATE INDEX idx_github_prs_state ON github_prs (state);
CREATE INDEX idx_github_prs_repo_number ON github_prs (repo_id, pr_number);

ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS github_pr_id UUID REFERENCES github_prs(id);
