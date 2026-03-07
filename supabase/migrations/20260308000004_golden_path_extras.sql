-- Add governance and usage columns to golden path templates
-- These support the IDP scaffold UI and catalog integration

alter table public.golden_path_templates
  add column if not exists stack text not null default 'nextjs',
  add column if not exists is_official boolean not null default false,
  add column if not exists includes_ci boolean not null default true,
  add column if not exists includes_testing boolean not null default true,
  add column if not exists includes_linting boolean not null default true,
  add column if not exists includes_monitoring boolean not null default false,
  add column if not exists includes_docker boolean not null default false,
  add column if not exists catalog_type text not null default 'service',
  add column if not exists catalog_lifecycle text not null default 'experimental',
  add column if not exists usage_count integer not null default 0;

-- Mark seed templates as official
update public.golden_path_templates
  set is_official = true,
      stack = case
        when framework = 'next.js' then 'nextjs'
        when framework = 'node.js' then 'api-service'
        when framework = 'react' then 'library'
        when framework = 'fastapi' then 'api-service'
        when framework = 'cloudflare' then 'worker'
        else 'nextjs'
      end,
      catalog_type = type,
      catalog_lifecycle = 'production',
      includes_docker = (framework = 'fastapi'),
      includes_monitoring = (lifecycle = 'ga')
  where name like 'forge-%';

create index if not exists gpt_stack_idx on public.golden_path_templates (stack);
