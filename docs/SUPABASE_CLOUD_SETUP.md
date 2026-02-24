# Supabase Cloud Setup Guide

Quick guide to set up Siza with Supabase Cloud instead of local development.

## Why Supabase Cloud?

- ✅ **Instant setup** - No Docker downloads (2GB+)
- ✅ **Always accessible** - Access from anywhere
- ✅ **Zero cost** - Free tier (50K MAU, 500MB DB, 1GB storage)
- ✅ **Production-ready** - Same environment for dev and prod

## Step 1: Create Supabase Project (5 minutes)

### 1.1 Sign Up

1. Go to [database.new](https://database.new)
2. Sign in with GitHub (recommended) or email
3. Verify your email if needed

### 1.2 Create Project

1. Click **"New Project"**
2. Configure:
   - **Organization**: Select or create (e.g., "Personal")
   - **Name**: `siza-dev` (or your preferred name)
   - **Database Password**: Click "Generate a password" and **save it securely**
   - **Region**: Choose closest to you:
     - 🇺🇸 US East (N. Virginia) - `us-east-1`
     - 🇺🇸 US West (Oregon) - `us-west-1`
     - 🇪🇺 Europe (Frankfurt) - `eu-central-1`
     - 🇧🇷 South America (São Paulo) - `sa-east-1`
   - **Pricing Plan**: Free

3. Click **"Create new project"**
4. Wait ~2 minutes for project to be created

## Step 2: Apply Database Migrations (3 minutes)

### 2.1 Open SQL Editor

1. In your Supabase project dashboard
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**

### 2.2 Run Initial Schema Migration

1. Open `supabase/migrations/20260215000001_initial_schema.sql` in your code editor
2. Copy the entire contents (500+ lines)
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. Wait for success message: ✅ "Success. No rows returned"

### 2.3 Run Storage Setup Migration

1. Open `supabase/migrations/20260215000002_storage_setup.sql` in your code editor
2. Copy the entire contents (300+ lines)
3. Paste into Supabase SQL Editor
4. Click **"Run"**
5. Wait for success message: ✅ "Success. No rows returned"

### 2.4 Verify Tables

1. Click **"Table Editor"** in left sidebar
2. Verify these tables exist:
   - ✅ profiles
   - ✅ projects
   - ✅ components
   - ✅ generations
   - ✅ api_keys

### 2.5 Verify Storage Buckets

1. Click **"Storage"** in left sidebar
2. Verify these buckets exist:
   - ✅ avatars
   - ✅ project-thumbnails
   - ✅ project-files
   - ✅ user-uploads

## Step 3: Get API Credentials (1 minute)

### 3.1 Navigate to API Settings

1. Click **"Project Settings"** (gear icon) in left sidebar
2. Click **"API"** in settings menu

### 3.2 Copy Credentials

Copy these values (you'll need them next):

- **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

**Important**: 
- ✅ The `anon` key is safe for client-side use
- ❌ Never expose the `service_role` key in client code

## Step 4: Configure Environment Variables (2 minutes)

### 4.1 Create .env.local File

In your project root, create `apps/web/.env.local`:

```bash
# Create the file
touch apps/web/.env.local
```

### 4.2 Add Supabase Credentials

Open `apps/web/.env.local` and add:

```env
# Supabase Configuration (Cloud)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true

# Testing (Optional)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
```

**Replace**:
- `your-project-ref.supabase.co` → Your Project URL
- `your-anon-key-here` → Your anon public key

## Step 5: Generate TypeScript Types (1 minute)

### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your cloud project
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > apps/web/src/lib/supabase/database.types.ts
```

### Option B: Manual (If CLI fails)

The placeholder types in `apps/web/src/lib/supabase/types.ts` will work for now. You can generate proper types later.

## Step 6: Start Development Server (1 minute)

```bash
# Navigate to web app
cd apps/web

# Start dev server
npm run dev
```

**Access**:
- Web App: http://localhost:3000
- Supabase Dashboard: https://supabase.com/dashboard/project/your-project-ref

## Step 7: Test the Application (5 minutes)

### 7.1 Create Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter email and password
4. Check email for confirmation (if enabled)

**Note**: For development, you can disable email confirmation:
1. Supabase Dashboard → Authentication → Providers
2. Email → Disable "Confirm email"

### 7.2 Verify Database

1. Go to Supabase Dashboard → Table Editor
2. Click "profiles" table
3. You should see your new user profile

### 7.3 Test Basic Features

- ✅ Sign in/out
- ✅ Create a project
- ✅ Upload an image (avatar)
- ✅ View projects list

## Troubleshooting

### Migration Errors

**Issue**: SQL migration fails

**Solutions**:
1. Check for syntax errors in SQL
2. Ensure you're running migrations in order
3. Try running each statement separately
4. Check Supabase logs in Dashboard

### Connection Errors

**Issue**: Can't connect to Supabase

**Solutions**:
1. Verify `.env.local` has correct URL and key
2. Check project is not paused in Dashboard
3. Restart dev server: `npm run dev`
4. Clear browser cache

### Authentication Issues

**Issue**: Can't sign up or sign in

**Solutions**:
1. Check email confirmation is disabled (for dev)
2. Verify RLS policies are enabled
3. Check Supabase Auth logs
4. Try different email address

### Type Errors

**Issue**: TypeScript errors about database types

**Solutions**:
1. Generate types: `supabase gen types typescript --linked`
2. Restart TypeScript server in IDE
3. Check `database.types.ts` was created
4. Use placeholder types temporarily

## Next Steps

Once everything is working:

1. ✅ **Explore the codebase** - Check `plan.MD` for architecture
2. ✅ **Read documentation** - See `docs/` folder
3. ✅ **Start building** - Create your first component
4. ✅ **Run tests** - `npm test` and `npm run test:e2e`

## Switching to Local Later

If you want to switch to local Supabase later:

```bash
# Stop cloud connection
supabase unlink

# Start local Supabase
supabase start

# Update .env.local with local credentials
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
```

## Production Deployment

When ready to deploy:

1. Create separate production Supabase project
2. Apply migrations to production
3. Deploy frontend to Cloudflare Pages
4. Update environment variables in Cloudflare
5. See `docs/DEPLOYMENT.md` for full guide

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Siza Setup Guide](./SETUP_GUIDE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Quick Reference

```bash
# Link to cloud project
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > apps/web/src/lib/supabase/database.types.ts

# Start dev server
cd apps/web && npm run dev

# Run tests
npm test
npm run test:e2e

# View Supabase Dashboard
open https://supabase.com/dashboard/project/your-project-ref
```

---

**Estimated Total Time**: 15-20 minutes from start to working application
