alter table public.skills
  add column if not exists version text,
  add column if not exists author text,
  add column if not exists license text,
  add column if not exists tags text[] default '{}',
  add column if not exists allowed_tools text[] default '{}',
  add column if not exists argument_hint text,
  add column if not exists invocation_mode text default 'user'
    check (invocation_mode in ('user', 'auto', 'background')),
  add column if not exists raw_frontmatter jsonb;

create index if not exists idx_skills_tags
  on public.skills using gin (tags);

create policy "Users can create own skills" on public.skills
  for insert to authenticated
  with check ((select auth.uid()) = created_by);

create policy "Users can update own skills" on public.skills
  for update to authenticated
  using ((select auth.uid()) = created_by or source_type = 'official');

update public.skills set
  version = '1.0.0',
  author = 'Forge Space',
  tags = case slug
    when 'siza-component-generation' then
      array['ui','components','accessibility','responsive','typescript']
    when 'siza-form-builder' then
      array['forms','validation','zod','yup','multi-step']
    when 'siza-dashboard-scaffolding' then
      array['dashboard','layout','charts','data-table']
    when 'siza-design-to-code' then
      array['design','vision','screenshot','figma']
    when 'siza-accessibility-audit' then
      array['accessibility','wcag','aria','a11y']
    else '{}'
  end,
  license = 'MIT',
  invocation_mode = 'user'
where source_type = 'official';
