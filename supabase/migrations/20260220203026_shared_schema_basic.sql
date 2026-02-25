-- Shared Schema Setup for Cross-Project Integration
-- Create shared tables for unified user management and analytics across Forge ecosystem

-- Extend existing profiles table for cross-project access
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS project_access jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS global_preferences jsonb DEFAULT '{}'::jsonb;

-- Cross-project permissions
CREATE TABLE public.project_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_name text NOT NULL,
  permissions text[] NOT NULL,
  granted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  granted_by uuid references auth.users(id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Cross-project usage analytics
CREATE SCHEMA analytics;

CREATE TABLE analytics.usage_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name text NOT NULL,
  user_id uuid references auth.users(id),
  action_type text NOT NULL,
  resource_type text,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_project_permissions_user_id ON public.project_permissions (user_id);
CREATE INDEX idx_project_permissions_project ON public.project_permissions (project_name);
CREATE INDEX idx_usage_metrics_project ON analytics.usage_metrics (project_name);
CREATE INDEX idx_usage_metrics_user ON analytics.usage_metrics (user_id);
CREATE INDEX idx_usage_metrics_timestamp ON analytics.usage_metrics (timestamp DESC);

-- Comments
COMMENT ON TABLE public.project_permissions IS 'Cross-project permissions for Forge ecosystem users';
COMMENT ON TABLE analytics.usage_metrics IS 'Cross-project usage analytics and metrics';
COMMENT ON SCHEMA analytics IS 'Analytics schema for cross-project insights';;
