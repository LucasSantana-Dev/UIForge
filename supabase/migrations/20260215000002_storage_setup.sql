-- UIForge Webapp - Storage Buckets and Policies
-- Version: 0.1.1
-- Created: 2026-02-15
-- Description: Supabase Storage buckets for project files, user uploads, and thumbnails

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Bucket for user avatars (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true, -- Public bucket for easy access
  2097152, -- 2MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Bucket for project thumbnails (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-thumbnails',
  'project-thumbnails',
  true, -- Public for easy sharing
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Bucket for generated code files (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files',
  'project-files',
  false, -- Private, requires authentication
  10485760, -- 10MB limit per file
  array[
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/typescript',
    'application/x-typescript'
  ]
)
on conflict (id) do nothing;

-- Bucket for user uploads (images, assets) (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-uploads',
  'user-uploads',
  false, -- Private
  10485760, -- 10MB limit
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/json'
  ]
)
on conflict (id) do nothing;

-- ============================================================================
-- STORAGE POLICIES - AVATARS BUCKET (PUBLIC)
-- ============================================================================

-- Anyone can view avatars (public bucket)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Authenticated users can upload avatars
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can update their own avatars
create policy "Users can update their own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can delete their own avatars
create policy "Users can delete their own avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- ============================================================================
-- STORAGE POLICIES - PROJECT THUMBNAILS BUCKET (PUBLIC)
-- ============================================================================

-- Anyone can view project thumbnails (public bucket)
create policy "Project thumbnails are publicly accessible"
  on storage.objects for select
  to public
  using (bucket_id = 'project-thumbnails');

-- Authenticated users can upload project thumbnails
create policy "Authenticated users can upload project thumbnails"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-thumbnails'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can update their own project thumbnails
create policy "Users can update their own project thumbnails"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-thumbnails'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'project-thumbnails'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can delete their own project thumbnails
create policy "Users can delete their own project thumbnails"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-thumbnails'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- ============================================================================
-- STORAGE POLICIES - PROJECT FILES BUCKET (PRIVATE)
-- ============================================================================

-- Users can view their own project files
create policy "Users can view their own project files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can upload their own project files
create policy "Users can upload their own project files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can update their own project files
create policy "Users can update their own project files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can delete their own project files
create policy "Users can delete their own project files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- ============================================================================
-- STORAGE POLICIES - USER UPLOADS BUCKET (PRIVATE)
-- ============================================================================

-- Users can view their own uploads
create policy "Users can view their own uploads"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can upload their own files
create policy "Users can upload their own files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can update their own uploads
create policy "Users can update their own uploads"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can delete their own uploads
create policy "Users can delete their own uploads"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR STORAGE
-- ============================================================================

-- Function to get user's storage usage
create or replace function public.get_user_storage_usage(user_uuid uuid)
returns bigint
language plpgsql
security definer
as $$
declare
  total_size bigint;
begin
  select coalesce(sum(metadata->>'size')::bigint, 0)
  into total_size
  from storage.objects
  where (metadata->>'owner')::uuid = user_uuid;
  
  return total_size;
end;
$$;

-- Function to clean up orphaned files (files not referenced in database)
create or replace function public.cleanup_orphaned_files()
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer := 0;
begin
  -- Delete project files not referenced in components table
  delete from storage.objects
  where bucket_id = 'project-files'
  and name not in (
    select code_file_path
    from public.components
    where code_file_path is not null
  );
  
  get diagnostics deleted_count = row_count;
  
  return deleted_count;
end;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on function public.get_user_storage_usage is 'Calculate total storage used by a user across all buckets';
comment on function public.cleanup_orphaned_files is 'Remove files from storage that are not referenced in the database';
