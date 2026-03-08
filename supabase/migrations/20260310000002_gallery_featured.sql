alter table public.generations
  add column if not exists is_featured boolean not null default false;

create index if not exists generations_is_featured_idx
  on public.generations (is_featured)
  where is_featured = true;

create policy "Featured generations are viewable by everyone"
  on public.generations for select
  to authenticated, anon
  using (is_featured = true);
