-- UIForge Webapp - Templates and File Versions
-- Version: 0.1.1
-- Created: 2026-02-15
-- Description: Templates for project scaffolding and file version history

-- ============================================================================
-- TEMPLATES TABLE
-- ============================================================================
-- Store reusable project templates (official and user-created)

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Template metadata
  name text not null,
  description text,
  category text not null check (category in ('landing', 'dashboard', 'auth', 'ecommerce', 'blog', 'portfolio', 'admin', 'other')),
  framework text not null check (framework in ('react', 'vue', 'angular', 'svelte')),

  -- Template content
  thumbnail_url text,
  code jsonb not null, -- { files: [{ path: string, content: string }] }

  -- Ownership
  is_official boolean default false,
  created_by uuid references auth.users on delete set null,

  -- Constraints
  constraint name_length check (char_length(name) >= 3 and char_length(name) <= 100),
  constraint description_length check (char_length(description) <= 500)
);

-- Enable RLS
alter table public.templates enable row level security;

-- RLS Policies for templates
create policy "Public templates are viewable by everyone"
  on public.templates for select
  to authenticated, anon
  using (true);

create policy "Authenticated users can create templates"
  on public.templates for insert
  to authenticated
  with check (
    (select auth.uid()) = created_by
    and (
      is_official = false
      or exists (
        select 1 from auth.users
        where id = auth.uid()
        and raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

create policy "Users can update their own templates"
  on public.templates for update
  to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

create policy "Users can delete their own templates"
  on public.templates for delete
  to authenticated
  using ((select auth.uid()) = created_by);

-- Indexes
create index templates_category_idx on public.templates (category);
create index templates_framework_idx on public.templates (framework);
create index templates_created_by_idx on public.templates (created_by);
create index templates_is_official_idx on public.templates (is_official);

-- Trigger to update updated_at timestamp
create trigger on_template_updated
  before update on public.templates
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- FILE_VERSIONS TABLE
-- ============================================================================
-- Store version history for project files (last 10 versions per file)

create table public.file_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Version metadata
  project_id uuid references public.projects on delete cascade not null,
  file_path text not null,
  content text not null,
  version_number integer not null,

  -- Ownership
  created_by uuid references auth.users on delete set null,

  -- Constraints
  constraint version_number_positive check (version_number > 0),
  constraint file_path_length check (char_length(file_path) >= 1 and char_length(file_path) <= 500),
  unique (project_id, file_path, version_number)
);

-- Enable RLS
alter table public.file_versions enable row level security;

-- RLS Policies for file_versions
create policy "Users can view versions of their own projects"
  on public.file_versions for select
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = file_versions.project_id
      and projects.user_id = (select auth.uid())
    )
  );

create policy "Users can create versions for their own projects"
  on public.file_versions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects
      where projects.id = file_versions.project_id
      and projects.user_id = (select auth.uid())
    )
  );

create policy "Users can delete versions of their own projects"
  on public.file_versions for delete
  to authenticated
  using (
    exists (
      select 1 from public.projects
      where projects.id = file_versions.project_id
      and projects.user_id = (select auth.uid())
    )
  );

-- Indexes
create index file_versions_project_id_idx on public.file_versions (project_id);
create index file_versions_file_path_idx on public.file_versions (file_path);
create index file_versions_version_number_idx on public.file_versions (version_number);
create index file_versions_created_at_idx on public.file_versions (created_at desc);

-- Function to maintain only last 10 versions per file
create or replace function public.cleanup_old_file_versions()
returns trigger
security definer
set search_path = ''
language plpgsql
as $$
begin
  -- Delete versions older than the 10 most recent for this file
  delete from public.file_versions
  where project_id = new.project_id
  and file_path = new.file_path
  and id not in (
    select id from public.file_versions
    where project_id = new.project_id
    and file_path = new.file_path
    order by version_number desc
    limit 10
  );

  return new;
end;
$$;

-- Trigger to cleanup old versions after insert
create trigger on_file_version_created
  after insert on public.file_versions
  for each row execute function public.cleanup_old_file_versions();

-- ============================================================================
-- SEED DATA - Official Templates
-- ============================================================================

-- Blank React Template
insert into public.templates (name, description, category, framework, is_official, code)
values (
  'Blank React App',
  'A minimal React application with TypeScript and Tailwind CSS',
  'other',
  'react',
  true,
  '{
    "files": [
      {
        "path": "src/App.tsx",
        "content": "export default function App() {\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">\n      <h1 className=\"text-4xl font-bold text-gray-900\">Hello UIForge!</h1>\n    </div>\n  );\n}"
      },
      {
        "path": "src/index.tsx",
        "content": "import React from ''react'';\nimport ReactDOM from ''react-dom/client'';\nimport App from ''./App'';\nimport ''./index.css'';\n\nReactDOM.createRoot(document.getElementById(''root'')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);"
      },
      {
        "path": "src/index.css",
        "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;"
      }
    ]
  }'::jsonb
);

-- Landing Page Template
insert into public.templates (name, description, category, framework, is_official, code)
values (
  'Modern Landing Page',
  'A beautiful landing page with hero section, features, and CTA',
  'landing',
  'react',
  true,
  '{
    "files": [
      {
        "path": "src/App.tsx",
        "content": "export default function App() {\n  return (\n    <div className=\"min-h-screen bg-white\">\n      <nav className=\"bg-white border-b\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"flex justify-between h-16 items-center\">\n            <div className=\"text-2xl font-bold text-blue-600\">Brand</div>\n            <button className=\"bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700\">Get Started</button>\n          </div>\n        </div>\n      </nav>\n      <main>\n        <section className=\"py-20 px-4\">\n          <div className=\"max-w-7xl mx-auto text-center\">\n            <h1 className=\"text-5xl font-bold text-gray-900 mb-6\">Build Amazing Products</h1>\n            <p className=\"text-xl text-gray-600 mb-8\">The fastest way to ship your next project</p>\n            <button className=\"bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700\">Start Building</button>\n          </div>\n        </section>\n      </main>\n    </div>\n  );\n}"
      }
    ]
  }'::jsonb
);
