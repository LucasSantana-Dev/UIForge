-- Software Catalog: Service registry for IDP
create table if not exists catalog_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  type text not null check (type in ('service', 'component', 'api', 'library', 'website')),
  lifecycle text not null check (lifecycle in ('experimental', 'production', 'deprecated')),
  owner_id uuid not null references profiles(id) on delete cascade,
  team text,
  repository_url text,
  documentation_url text,
  tags text[] not null default '{}',
  dependencies text[] not null default '{}',
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_entries_name_format check (name ~ '^[a-z0-9-]+$')
);

-- Indexes
create index idx_catalog_entries_name on catalog_entries (name);
create index idx_catalog_entries_type on catalog_entries (type);
create index idx_catalog_entries_lifecycle on catalog_entries (lifecycle);
create index idx_catalog_entries_owner on catalog_entries (owner_id);
create index idx_catalog_entries_tags on catalog_entries using gin (tags);

-- RLS
alter table catalog_entries enable row level security;

create policy "Authenticated users can view all catalog entries"
  on catalog_entries for select
  using (auth.role() = 'authenticated');

create policy "Users can insert own catalog entries"
  on catalog_entries for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own catalog entries"
  on catalog_entries for update
  using (auth.uid() = owner_id);

create policy "Users can delete own catalog entries"
  on catalog_entries for delete
  using (auth.uid() = owner_id);

-- Updated at trigger (reuse existing function if available, otherwise create)
create or replace function handle_catalog_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger catalog_entries_updated_at
  before update on catalog_entries
  for each row
  execute function handle_catalog_updated_at();

-- Seed: 9 Forge Space repos
-- Seeds catalog entries using the first available profile as owner
-- In local dev, this runs after auth user creation via the app
do $$
declare
  seed_owner_id uuid;
begin
  select id into seed_owner_id from profiles limit 1;
  if seed_owner_id is null then
    return;
  end if;
  insert into catalog_entries (name, display_name, type, lifecycle, owner_id, repository_url, tags, dependencies) values
    ('siza', 'Siza Platform', 'website', 'production', seed_owner_id, 'https://github.com/Forge-Space/siza', array['idp', 'platform', 'next.js'], array['core', 'siza-gen', 'brand-guide']),
    ('ui-mcp', 'UI MCP Server', 'service', 'production', seed_owner_id, 'https://github.com/Forge-Space/ui-mcp', array['mcp', 'ai', 'generation'], array['core', 'siza-gen']),
    ('mcp-gateway', 'MCP Gateway', 'service', 'production', seed_owner_id, 'https://github.com/Forge-Space/mcp-gateway', array['gateway', 'routing', 'python'], array['core']),
    ('core', 'Forge Patterns Core', 'library', 'production', seed_owner_id, 'https://github.com/Forge-Space/core', array['patterns', 'shared', 'typescript'], array[]::text[]),
    ('branding-mcp', 'Branding MCP', 'service', 'production', seed_owner_id, 'https://github.com/Forge-Space/branding-mcp', array['mcp', 'branding', 'design'], array['core', 'brand-guide']),
    ('siza-gen', 'Siza Gen', 'library', 'production', seed_owner_id, 'https://github.com/Forge-Space/siza-gen', array['generation', 'ai', 'context'], array['core']),
    ('brand-guide', 'Brand Guide', 'library', 'production', seed_owner_id, 'https://github.com/Forge-Space/brand-guide', array['brand', 'design', 'astro'], array[]::text[]),
    ('forgespace-web', 'Forge Space Website', 'website', 'production', seed_owner_id, 'https://github.com/Forge-Space/forgespace-web', array['marketing', 'next.js', 'three.js'], array['brand-guide']),
    ('siza-desktop', 'Siza Desktop', 'component', 'experimental', seed_owner_id, 'https://github.com/Forge-Space/siza-desktop', array['desktop', 'electron', 'ollama'], array['core'])
  on conflict (name) do nothing;
end;
$$;
