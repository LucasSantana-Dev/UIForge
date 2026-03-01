create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  category text check (category in (
    'component', 'form', 'layout', 'dashboard',
    'design', 'accessibility', 'fullstack', 'custom'
  )),
  instructions text not null,
  source_url text,
  source_type text default 'official'
    check (source_type in ('official', 'community', 'user')),
  parameter_schema jsonb,
  preferred_provider text,
  complexity_boost numeric(3,2) default 0,
  requires_vision boolean default false,
  icon text,
  frameworks text[] default '{}',
  install_count integer default 0,
  is_active boolean default true,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.generation_skills (
  generation_id uuid references public.generations on delete cascade,
  skill_id uuid references public.skills on delete cascade,
  skill_parameters jsonb,
  primary key (generation_id, skill_id)
);

create table public.user_skill_favorites (
  user_id uuid references auth.users on delete cascade,
  skill_id uuid references public.skills on delete cascade,
  primary key (user_id, skill_id)
);

alter table public.skills enable row level security;
alter table public.generation_skills enable row level security;
alter table public.user_skill_favorites enable row level security;

create policy "Skills readable by all authenticated" on public.skills
  for select to authenticated using (is_active = true);

create policy "Users manage own skill favorites" on public.user_skill_favorites
  for all to authenticated using ((select auth.uid()) = user_id);

create policy "Generation skills readable by generation owner"
  on public.generation_skills
  for select to authenticated using (
    generation_id in (
      select id from public.generations
      where user_id = (select auth.uid())
    )
  );

create policy "Generation skills insertable by generation owner"
  on public.generation_skills
  for insert to authenticated with check (
    generation_id in (
      select id from public.generations
      where user_id = (select auth.uid())
    )
  );

create index idx_skills_category on public.skills (category);
create index idx_skills_source_type on public.skills (source_type);
create index idx_skills_slug on public.skills (slug);
create index idx_generation_skills_gen on public.generation_skills (generation_id);
