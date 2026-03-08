-- Entity Relationships: Typed directional relations between catalog entries
-- Inspired by Backstage relation model (consumesAPI, providesAPI, dependsOn, etc.)

create type relation_type as enum (
  'dependsOn',
  'consumesAPI',
  'providesAPI',
  'ownedBy',
  'partOf',
  'hasPart',
  'implements',
  'deployedTo',
  'monitoredBy'
);

create table if not exists entity_relationships (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references catalog_entries(id) on delete cascade,
  target_id uuid not null references catalog_entries(id) on delete cascade,
  type relation_type not null,
  metadata jsonb not null default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint entity_relationships_no_self check (source_id != target_id),
  constraint entity_relationships_unique unique (source_id, target_id, type)
);

create index idx_entity_rel_source on entity_relationships(source_id);
create index idx_entity_rel_target on entity_relationships(target_id);
create index idx_entity_rel_type on entity_relationships(type);

-- RLS
alter table entity_relationships enable row level security;

create policy "Authenticated users can view all relationships"
  on entity_relationships for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create relationships"
  on entity_relationships for insert
  with check (auth.role() = 'authenticated');

create policy "Relationship creator can delete"
  on entity_relationships for delete
  using (auth.uid() = created_by);
