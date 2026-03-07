-- Golden Path Templates for IDP
-- Backstage-inspired project scaffolding blueprints

create table public.golden_path_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null,

  -- Template identity
  name text not null unique,
  display_name text not null,
  description text,
  owner_id uuid references auth.users on delete set null,

  -- Classification
  type text not null check (type in ('service', 'library', 'website', 'worker', 'api', 'package')),
  lifecycle text not null default 'beta' check (lifecycle in ('draft', 'beta', 'ga', 'deprecated')),

  -- Template content
  framework text not null,
  language text not null default 'typescript',
  tags text[] default '{}',
  parameters jsonb default '[]',
  steps jsonb default '[]',

  -- Metadata
  repository_url text,
  documentation_url text,
  icon text,
  metadata jsonb default '{}'
);

alter table public.golden_path_templates enable row level security;

create policy "Golden paths viewable by everyone"
  on public.golden_path_templates for select
  to authenticated, anon using (true);

create policy "Authenticated users can create golden paths"
  on public.golden_path_templates for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their golden paths"
  on public.golden_path_templates for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their golden paths"
  on public.golden_path_templates for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create index gpt_type_idx on public.golden_path_templates (type);
create index gpt_lifecycle_idx on public.golden_path_templates (lifecycle);
create index gpt_framework_idx on public.golden_path_templates (framework);
create index gpt_tags_idx on public.golden_path_templates using gin (tags);
create index gpt_owner_idx on public.golden_path_templates (owner_id);

create trigger on_golden_path_updated
  before update on public.golden_path_templates
  for each row execute function public.handle_updated_at();

-- Seed: Forge Space golden paths
insert into public.golden_path_templates (name, display_name, description, type, lifecycle, framework, language, tags, parameters, steps) values
('forge-next-service', 'Next.js Service', 'Production-ready Next.js service with Supabase auth, Tailwind, and CI/CD', 'service', 'ga', 'next.js', 'typescript',
  array['next.js', 'supabase', 'tailwind', 'ci-cd'],
  '[{"name":"projectName","type":"string","required":true,"description":"Project name (kebab-case)"},{"name":"description","type":"string","required":false,"description":"Short description"},{"name":"includeAuth","type":"boolean","default":true,"description":"Include Supabase auth setup"}]'::jsonb,
  '[{"id":"scaffold","name":"Scaffold project","action":"create-files","description":"Create Next.js project structure with App Router"},{"id":"configure","name":"Configure CI/CD","action":"create-files","description":"Add GitHub Actions workflows"},{"id":"register","name":"Register in catalog","action":"register-catalog","description":"Create catalog entry for the new service"}]'::jsonb),
('forge-mcp-server', 'MCP Server', 'MCP server template with tool definitions, testing, and npm publishing', 'service', 'ga', 'node.js', 'typescript',
  array['mcp', 'sdk', 'npm'],
  '[{"name":"serverName","type":"string","required":true,"description":"Server name (kebab-case)"},{"name":"description","type":"string","required":false,"description":"Server description"},{"name":"tools","type":"string","required":false,"description":"Comma-separated initial tool names"}]'::jsonb,
  '[{"id":"scaffold","name":"Scaffold MCP server","action":"create-files","description":"Create MCP server with SDK setup"},{"id":"tools","name":"Create tool stubs","action":"create-files","description":"Generate initial tool definitions"},{"id":"test","name":"Setup testing","action":"create-files","description":"Jest + ESM test configuration"},{"id":"register","name":"Register in catalog","action":"register-catalog","description":"Create catalog entry"}]'::jsonb),
('forge-react-library', 'React Component Library', 'Shared React component library with Storybook, tests, and npm publishing', 'library', 'ga', 'react', 'typescript',
  array['react', 'storybook', 'npm', 'components'],
  '[{"name":"packageName","type":"string","required":true,"description":"Package name (@scope/name)"},{"name":"description","type":"string","required":false,"description":"Library description"}]'::jsonb,
  '[{"id":"scaffold","name":"Scaffold library","action":"create-files","description":"Create component library structure"},{"id":"storybook","name":"Setup Storybook","action":"create-files","description":"Configure Storybook for component development"},{"id":"register","name":"Register in catalog","action":"register-catalog","description":"Create catalog entry"}]'::jsonb),
('forge-python-api', 'Python API Service', 'FastAPI service with Docker, pytest, and CI/CD', 'api', 'beta', 'fastapi', 'python',
  array['python', 'fastapi', 'docker', 'api'],
  '[{"name":"serviceName","type":"string","required":true,"description":"Service name (kebab-case)"},{"name":"description","type":"string","required":false,"description":"API description"},{"name":"includeDocker","type":"boolean","default":true,"description":"Include Dockerfile and docker-compose"}]'::jsonb,
  '[{"id":"scaffold","name":"Scaffold API","action":"create-files","description":"Create FastAPI project with routers"},{"id":"docker","name":"Setup Docker","action":"create-files","description":"Add Dockerfile and compose config"},{"id":"register","name":"Register in catalog","action":"register-catalog","description":"Create catalog entry"}]'::jsonb),
('forge-cloudflare-worker', 'Cloudflare Worker', 'Edge worker with KV storage, rate limiting, and wrangler deploy', 'worker', 'beta', 'cloudflare', 'typescript',
  array['cloudflare', 'workers', 'edge', 'serverless'],
  '[{"name":"workerName","type":"string","required":true,"description":"Worker name (kebab-case)"},{"name":"includeKV","type":"boolean","default":false,"description":"Include KV namespace binding"}]'::jsonb,
  '[{"id":"scaffold","name":"Scaffold worker","action":"create-files","description":"Create Cloudflare Worker project"},{"id":"deploy","name":"Configure deployment","action":"create-files","description":"Setup wrangler.toml and deploy scripts"},{"id":"register","name":"Register in catalog","action":"register-catalog","description":"Create catalog entry"}]'::jsonb);
