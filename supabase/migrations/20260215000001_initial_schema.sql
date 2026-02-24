-- Siza Webapp - Initial Database Schema
-- Version: 0.1.1
-- Created: 2026-02-15
-- Description: Core tables for user profiles, projects, components, and generations with RLS

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Note: Postgres 17+ uses gen_random_uuid() by default (no extension needed)

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends auth.users with additional profile information
-- One-to-one relationship with auth.users

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Profile information
  username text unique,
  full_name text,
  avatar_url text,
  bio text,

  -- Preferences
  theme text default 'system' check (theme in ('light', 'dark', 'system')),

  -- Constraints
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint bio_length check (char_length(bio) <= 500)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  to authenticated, anon
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Indexes
create index profiles_username_idx on public.profiles (username);

-- Trigger to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = ''
language plpgsql
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
-- User projects containing generated components

create table public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ownership
  user_id uuid references auth.users on delete cascade not null,

  -- Project details
  name text not null,
  description text,
  thumbnail_url text,

  -- Project settings
  framework text not null default 'react' check (framework in ('react', 'nextjs', 'vue', 'angular', 'svelte', 'html')),
  component_library text default 'none' check (component_library in ('none', 'shadcn', 'radix', 'material', 'chakra', 'ant')),

  -- Metadata
  is_template boolean default false,
  is_public boolean default false,

  -- Constraints
  constraint name_length check (char_length(name) >= 1 and char_length(name) <= 100),
  constraint description_length check (char_length(description) <= 500)
);

-- Enable RLS
alter table public.projects enable row level security;

-- RLS Policies for projects
create policy "Users can view their own projects"
  on public.projects for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Public projects are viewable by everyone"
  on public.projects for select
  to authenticated, anon
  using (is_public = true);

create policy "Users can insert their own projects"
  on public.projects for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Indexes
create index projects_user_id_idx on public.projects (user_id);
create index projects_created_at_idx on public.projects (created_at desc);
create index projects_is_public_idx on public.projects (is_public) where is_public = true;
create index projects_is_template_idx on public.projects (is_template) where is_template = true;

-- Trigger to update updated_at
create trigger on_project_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- COMPONENTS TABLE
-- ============================================================================
-- Individual components within projects

create table public.components (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Relationships
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,

  -- Component details
  name text not null,
  description text,
  component_type text not null check (component_type in ('button', 'card', 'form', 'input', 'modal', 'navbar', 'sidebar', 'table', 'custom')),

  -- Code storage (references to Supabase Storage)
  code_file_path text, -- Path in storage bucket
  preview_image_url text,

  -- Component metadata
  framework text not null,
  props jsonb default '{}'::jsonb,

  -- Constraints
  constraint name_length check (char_length(name) >= 1 and char_length(name) <= 100),
  constraint description_length check (char_length(description) <= 500)
);

-- Enable RLS
alter table public.components enable row level security;

-- RLS Policies for components
create policy "Users can view components in their projects"
  on public.components for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.projects
      where projects.id = components.project_id
      and projects.is_public = true
    )
  );

create policy "Users can insert components in their projects"
  on public.components for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.projects
      where projects.id = project_id
      and projects.user_id = (select auth.uid())
    )
  );

create policy "Users can update their own components"
  on public.components for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own components"
  on public.components for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Indexes
create index components_project_id_idx on public.components (project_id);
create index components_user_id_idx on public.components (user_id);
create index components_created_at_idx on public.components (created_at desc);
create index components_component_type_idx on public.components (component_type);

-- Trigger to update updated_at
create trigger on_component_updated
  before update on public.components
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- GENERATIONS TABLE
-- ============================================================================
-- Track AI generation requests and results

create table public.generations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Relationships
  user_id uuid references auth.users on delete cascade not null,
  project_id uuid references public.projects on delete cascade,
  component_id uuid references public.components on delete set null,

  -- Generation details
  prompt text not null,
  framework text not null,
  component_type text,

  -- AI provider info (encrypted on client)
  ai_provider text check (ai_provider in ('openai', 'anthropic', 'google', 'gemini-fallback')),
  model_used text,

  -- Generation result
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result_file_path text, -- Path in storage bucket
  error_message text,

  -- Metadata
  tokens_used integer,
  generation_time_ms integer,

  -- Constraints
  constraint prompt_length check (char_length(prompt) >= 10 and char_length(prompt) <= 2000)
);

-- Enable RLS
alter table public.generations enable row level security;

-- RLS Policies for generations
create policy "Users can view their own generations"
  on public.generations for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own generations"
  on public.generations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own generations"
  on public.generations for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Indexes
create index generations_user_id_idx on public.generations (user_id);
create index generations_project_id_idx on public.generations (project_id);
create index generations_created_at_idx on public.generations (created_at desc);
create index generations_status_idx on public.generations (status);

-- ============================================================================
-- API KEYS TABLE (Encrypted on client)
-- ============================================================================
-- Store encrypted API key hashes for backup/sync (optional)

create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ownership
  user_id uuid references auth.users on delete cascade not null,

  -- Key details
  provider text not null check (provider in ('openai', 'anthropic', 'google')),
  encrypted_key_hash text not null, -- Client-side encrypted hash for verification
  key_name text, -- User-friendly name

  -- Metadata
  last_used_at timestamp with time zone,
  is_active boolean default true,

  -- Constraints
  constraint unique_user_provider unique (user_id, provider, key_name)
);

-- Enable RLS
alter table public.api_keys enable row level security;

-- RLS Policies for api_keys
create policy "Users can view their own API keys"
  on public.api_keys for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own API keys"
  on public.api_keys for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own API keys"
  on public.api_keys for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own API keys"
  on public.api_keys for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Indexes
create index api_keys_user_id_idx on public.api_keys (user_id);
create index api_keys_provider_idx on public.api_keys (provider);

-- Trigger to update updated_at
create trigger on_api_key_updated
  before update on public.api_keys
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get user's project count
create or replace function public.get_user_project_count(user_uuid uuid)
returns integer
language sql
security definer
as $$
  select count(*)::integer
  from public.projects
  where user_id = user_uuid;
$$;

-- Function to get user's component count
create or replace function public.get_user_component_count(user_uuid uuid)
returns integer
language sql
security definer
as $$
  select count(*)::integer
  from public.components
  where user_id = user_uuid;
$$;

-- Function to get user's generation count
create or replace function public.get_user_generation_count(user_uuid uuid)
returns integer
language sql
security definer
as $$
  select count(*)::integer
  from public.generations
  where user_id = user_uuid;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.profiles is 'User profile information extending auth.users';
comment on table public.projects is 'User projects containing generated components';
comment on table public.components is 'Individual UI components within projects';
comment on table public.generations is 'AI generation requests and results tracking';
comment on table public.api_keys is 'Encrypted API key hashes for backup (optional)';

comment on column public.profiles.theme is 'User preferred theme: light, dark, or system';
comment on column public.projects.is_template is 'Whether this project is a template available to others';
comment on column public.projects.is_public is 'Whether this project is publicly viewable';
comment on column public.components.code_file_path is 'Path to code file in Supabase Storage';
comment on column public.generations.ai_provider is 'AI provider used for generation';
comment on column public.api_keys.encrypted_key_hash is 'Client-side encrypted hash for verification only';
