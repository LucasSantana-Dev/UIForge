# UIForge Webapp - Database Schema Documentation

> **Version**: 0.1.1  
> **Last Updated**: 2026-02-15  
> **Database**: PostgreSQL 15 (Supabase)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tables](#tables)
3. [Storage Buckets](#storage-buckets)
4. [Row Level Security](#row-level-security)
5. [Functions](#functions)
6. [Indexes](#indexes)
7. [Migration Guide](#migration-guide)

---

## Overview

The UIForge webapp uses Supabase (PostgreSQL 15) with Row Level Security (RLS) for secure, multi-tenant data access. The schema supports:

- User profiles extending `auth.users`
- Project management with components
- AI generation tracking
- Encrypted API key storage (client-side encrypted)
- File storage via Supabase Storage

### Key Features

- ✅ **Row Level Security**: All tables have RLS enabled
- ✅ **Automatic Timestamps**: `created_at` and `updated_at` managed by triggers
- ✅ **Cascade Deletes**: Foreign keys with proper cascade rules
- ✅ **Storage Integration**: 4 buckets with granular policies
- ✅ **Zero-Cost**: Fits within Supabase free tier (50,000 MAU, 500MB DB, 1GB storage)

---

## Tables

### `public.profiles`

Extends `auth.users` with additional profile information.

**Columns**:
- `id` (uuid, PK, FK → auth.users): User ID
- `created_at` (timestamptz): Profile creation timestamp
- `updated_at` (timestamptz): Last update timestamp
- `username` (text, unique): Unique username (3-30 chars)
- `full_name` (text): User's full name
- `avatar_url` (text): Path to avatar in Storage
- `bio` (text): User bio (max 500 chars)
- `theme` (text): Preferred theme ('light', 'dark', 'system')

**Constraints**:
- Username: 3-30 characters
- Bio: max 500 characters
- Theme: must be 'light', 'dark', or 'system'

**RLS Policies**:
- ✅ Public profiles viewable by everyone
- ✅ Users can insert their own profile
- ✅ Users can update their own profile

**Triggers**:
- Auto-create profile on user signup (`on_auth_user_created`)
- Auto-update `updated_at` on changes (`on_profile_updated`)

---

### `public.projects`

User projects containing generated components.

**Columns**:
- `id` (uuid, PK): Project ID
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update timestamp
- `user_id` (uuid, FK → auth.users): Project owner
- `name` (text): Project name (1-100 chars)
- `description` (text): Project description (max 500 chars)
- `thumbnail_url` (text): Path to thumbnail in Storage
- `framework` (text): Target framework ('react', 'nextjs', 'vue', 'angular', 'svelte', 'html')
- `component_library` (text): Component library ('none', 'shadcn', 'radix', 'material', 'chakra', 'ant')
- `is_template` (boolean): Whether project is a template
- `is_public` (boolean): Whether project is publicly viewable

**Constraints**:
- Name: 1-100 characters
- Description: max 500 characters
- Framework: must be valid framework
- Component library: must be valid library

**RLS Policies**:
- ✅ Users can view their own projects
- ✅ Public projects viewable by everyone
- ✅ Users can insert their own projects
- ✅ Users can update their own projects
- ✅ Users can delete their own projects

**Indexes**:
- `user_id` (for user's projects)
- `created_at DESC` (for sorting)
- `is_public` (for public projects)
- `is_template` (for templates)

---

### `public.components`

Individual UI components within projects.

**Columns**:
- `id` (uuid, PK): Component ID
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update timestamp
- `project_id` (uuid, FK → projects): Parent project
- `user_id` (uuid, FK → auth.users): Component owner
- `name` (text): Component name (1-100 chars)
- `description` (text): Component description (max 500 chars)
- `component_type` (text): Type ('button', 'card', 'form', 'input', 'modal', 'navbar', 'sidebar', 'table', 'custom')
- `code_file_path` (text): Path to code file in Storage
- `preview_image_url` (text): Path to preview image
- `framework` (text): Component framework
- `props` (jsonb): Component props as JSON

**Constraints**:
- Name: 1-100 characters
- Description: max 500 characters
- Component type: must be valid type

**RLS Policies**:
- ✅ Users can view components in their projects
- ✅ Users can view components in public projects
- ✅ Users can insert components in their projects
- ✅ Users can update their own components
- ✅ Users can delete their own components

**Indexes**:
- `project_id` (for project's components)
- `user_id` (for user's components)
- `created_at DESC` (for sorting)
- `component_type` (for filtering)

---

### `public.generations`

Track AI generation requests and results.

**Columns**:
- `id` (uuid, PK): Generation ID
- `created_at` (timestamptz): Request timestamp
- `user_id` (uuid, FK → auth.users): User who requested
- `project_id` (uuid, FK → projects): Target project (optional)
- `component_id` (uuid, FK → components): Generated component (optional)
- `prompt` (text): User's generation prompt (10-2000 chars)
- `framework` (text): Target framework
- `component_type` (text): Requested component type
- `ai_provider` (text): AI provider used ('openai', 'anthropic', 'google', 'gemini-fallback')
- `model_used` (text): Specific model used
- `status` (text): Generation status ('pending', 'processing', 'completed', 'failed')
- `result_file_path` (text): Path to result in Storage
- `error_message` (text): Error message if failed
- `tokens_used` (integer): Tokens consumed
- `generation_time_ms` (integer): Generation time in milliseconds

**Constraints**:
- Prompt: 10-2000 characters
- AI provider: must be valid provider
- Status: must be valid status

**RLS Policies**:
- ✅ Users can view their own generations
- ✅ Users can insert their own generations
- ✅ Users can update their own generations

**Indexes**:
- `user_id` (for user's generations)
- `project_id` (for project's generations)
- `created_at DESC` (for sorting)
- `status` (for filtering)

---

### `public.api_keys`

Store encrypted API key hashes for backup/sync (optional).

**Columns**:
- `id` (uuid, PK): Key ID
- `created_at` (timestamptz): Creation timestamp
- `updated_at` (timestamptz): Last update timestamp
- `user_id` (uuid, FK → auth.users): Key owner
- `provider` (text): AI provider ('openai', 'anthropic', 'google')
- `encrypted_key_hash` (text): Client-side encrypted hash
- `key_name` (text): User-friendly name
- `last_used_at` (timestamptz): Last usage timestamp
- `is_active` (boolean): Whether key is active

**Constraints**:
- Unique: (user_id, provider, key_name)
- Provider: must be valid provider

**RLS Policies**:
- ✅ Users can view their own API keys
- ✅ Users can insert their own API keys
- ✅ Users can update their own API keys
- ✅ Users can delete their own API keys

**Indexes**:
- `user_id` (for user's keys)
- `provider` (for filtering)

**Security Note**: API keys are encrypted client-side with AES-256. Only encrypted hashes are stored in the database for verification purposes.

---

## Storage Buckets

### `avatars` (Public)

**Purpose**: User profile avatars  
**Public**: Yes (CDN cached)  
**File Size Limit**: 2MB  
**Allowed Types**: image/jpeg, image/png, image/webp, image/gif

**Policies**:
- ✅ Anyone can view avatars
- ✅ Authenticated users can upload to their folder
- ✅ Users can update their own avatars
- ✅ Users can delete their own avatars

**Path Structure**: `{user_id}/{filename}`

---

### `project-thumbnails` (Public)

**Purpose**: Project thumbnail images  
**Public**: Yes (CDN cached)  
**File Size Limit**: 5MB  
**Allowed Types**: image/jpeg, image/png, image/webp

**Policies**:
- ✅ Anyone can view thumbnails
- ✅ Authenticated users can upload to their folder
- ✅ Users can update their own thumbnails
- ✅ Users can delete their own thumbnails

**Path Structure**: `{user_id}/{project_id}/{filename}`

---

### `project-files` (Private)

**Purpose**: Generated code files  
**Public**: No (requires authentication)  
**File Size Limit**: 10MB  
**Allowed Types**: text/plain, text/html, text/css, text/javascript, application/json, application/typescript

**Policies**:
- ✅ Users can view their own files
- ✅ Users can upload to their folder
- ✅ Users can update their own files
- ✅ Users can delete their own files

**Path Structure**: `{user_id}/{project_id}/{component_id}/{filename}`

---

### `user-uploads` (Private)

**Purpose**: User-uploaded images and assets  
**Public**: No (requires authentication)  
**File Size Limit**: 10MB  
**Allowed Types**: image/jpeg, image/png, image/webp, image/gif, image/svg+xml, application/json

**Policies**:
- ✅ Users can view their own uploads
- ✅ Users can upload to their folder
- ✅ Users can update their own uploads
- ✅ Users can delete their own uploads

**Path Structure**: `{user_id}/{filename}`

---

## Row Level Security

All tables have RLS enabled with policies that ensure:

1. **User Isolation**: Users can only access their own data
2. **Public Sharing**: Public projects/profiles are viewable by everyone
3. **Authentication Required**: Most operations require authentication
4. **Ownership Verification**: All mutations verify ownership via `auth.uid()`

### RLS Pattern

```sql
-- SELECT: Users can view their own data
using ((select auth.uid()) = user_id)

-- INSERT: Users can insert their own data
with check ((select auth.uid()) = user_id)

-- UPDATE: Users can update their own data
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id)

-- DELETE: Users can delete their own data
using ((select auth.uid()) = user_id)
```

---

## Functions

### `public.handle_new_user()`

**Purpose**: Automatically create profile when user signs up  
**Trigger**: After insert on `auth.users`  
**Security**: `security definer`

### `public.handle_updated_at()`

**Purpose**: Automatically update `updated_at` timestamp  
**Trigger**: Before update on tables with `updated_at`

### `public.get_user_project_count(user_uuid)`

**Purpose**: Get user's total project count  
**Returns**: integer  
**Security**: `security definer`

### `public.get_user_component_count(user_uuid)`

**Purpose**: Get user's total component count  
**Returns**: integer  
**Security**: `security definer`

### `public.get_user_generation_count(user_uuid)`

**Purpose**: Get user's total generation count  
**Returns**: integer  
**Security**: `security definer`

### `public.get_user_storage_usage(user_uuid)`

**Purpose**: Calculate user's total storage usage  
**Returns**: bigint (bytes)  
**Security**: `security definer`

### `public.cleanup_orphaned_files()`

**Purpose**: Remove files not referenced in database  
**Returns**: integer (deleted count)  
**Security**: `security definer`

### `public.dev_reset_user_data(user_uuid)`

**Purpose**: Development helper to reset user data  
**Returns**: void  
**Security**: `security definer`  
**Warning**: DO NOT USE IN PRODUCTION

---

## Indexes

### Performance Indexes

All foreign keys have indexes for efficient joins:
- `profiles.username`
- `projects.user_id`, `projects.created_at`, `projects.is_public`, `projects.is_template`
- `components.project_id`, `components.user_id`, `components.created_at`, `components.component_type`
- `generations.user_id`, `generations.project_id`, `generations.created_at`, `generations.status`
- `api_keys.user_id`, `api_keys.provider`

---

## Migration Guide

### Running Migrations

**Local Development** (Supabase CLI):
```bash
# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or reset and apply all migrations
supabase db reset
```

**Production** (Supabase Dashboard):
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of migration files
3. Run in order:
   - `20260215000001_initial_schema.sql`
   - `20260215000002_storage_setup.sql`

### Migration Files

1. **`20260215000001_initial_schema.sql`**: Core tables, RLS policies, functions
2. **`20260215000002_storage_setup.sql`**: Storage buckets and policies
3. **`seed.sql`**: Development seed data (optional)

### Rollback

To rollback migrations:
```bash
supabase db reset
```

**Warning**: This will delete all data. Use with caution.

---

## Free Tier Limits

**Supabase Free Tier**:
- 50,000 Monthly Active Users
- 500MB Database space
- 1GB File storage
- 2GB Bandwidth
- Unlimited API requests

**Estimated Capacity**:
- ~10,000 projects (50KB avg per project with components)
- ~100,000 components (5KB avg per component)
- ~1,000,000 generations (tracking only, files in storage)
- ~1GB of generated code files

**Monitoring**:
- Use `get_user_storage_usage()` to track storage per user
- Use `cleanup_orphaned_files()` to free up space
- Monitor database size in Supabase Dashboard

---

## Best Practices

1. **Always enable RLS**: Never disable RLS on public schema tables
2. **Use signed URLs**: For private storage access, use `createSignedUrl()`
3. **Cascade deletes**: Ensure foreign keys have proper `on delete` clauses
4. **Index foreign keys**: All foreign keys should have indexes
5. **Validate on client**: Use Zod schemas to validate before database calls
6. **Encrypt sensitive data**: API keys encrypted client-side, never store plain text
7. **Monitor storage**: Regularly check storage usage and clean up orphaned files
8. **Test RLS policies**: Write tests to verify RLS policies work correctly

---

## TypeScript Types

Generate TypeScript types from schema:

```bash
supabase gen types typescript --local > src/types/database.types.ts
```

Or for production:
```bash
supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

---

## See Also

- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [UIForge Webapp plan.MD](../plan.MD)
