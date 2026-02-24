CREATE TABLE github_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id BIGINT NOT NULL UNIQUE,
  account_login TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('User', 'Organization')),
  permissions JSONB,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE github_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID REFERENCES github_installations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  github_repo_id BIGINT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own installations"
  ON github_installations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users see repos from own installations"
  ON github_repos FOR ALL
  USING (
    installation_id IN (
      SELECT gi.id FROM github_installations gi
      WHERE gi.user_id = auth.uid()
    )
  );

CREATE INDEX idx_github_installations_user_id
  ON github_installations(user_id);

CREATE INDEX idx_github_repos_installation_id
  ON github_repos(installation_id);

CREATE INDEX idx_github_repos_project_id
  ON github_repos(project_id);
