# UIForge Webapp - Setup Guide

> **Version**: 0.1.1  
> **Last Updated**: 2026-02-15  
> **For**: Local Development & Production Deployment

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Setup](#supabase-setup)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: 20.x or later
- **npm**: 10.x or later
- **Docker Desktop**: For local Supabase (or alternative: OrbStack, Podman, Rancher Desktop)
- **Git**: For version control
- **Supabase CLI**: For local development

### Optional Tools

- **VS Code** or **Cursor**: Recommended IDEs
- **Postman** or **Insomnia**: For API testing
- **pgAdmin** or **DBeaver**: For database management

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/uiforge-webapp.git
cd uiforge-webapp
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Or install only web app dependencies
cd apps/web
npm install
```

### 3. Install Supabase CLI

**macOS (Homebrew)**:
```bash
brew install supabase/tap/supabase
```

**Windows (Scoop)**:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux (Homebrew)**:
```bash
brew install supabase/tap/supabase
```

**npm (All platforms)**:
```bash
npm install supabase --save-dev
# Then use: npx supabase <command>
```

Verify installation:
```bash
supabase --version
```

---

## Supabase Setup

### Option A: Local Development (Recommended for Development)

#### 1. Start Docker Desktop

Ensure Docker Desktop is running before starting Supabase.

#### 2. Initialize Supabase (Already Done)

The project already has Supabase initialized. If starting fresh:

```bash
supabase init
```

#### 3. Start Local Supabase

```bash
supabase start
```

**First-time setup**: This will download Docker images (~2GB) and may take 10-15 minutes.

**Output**: Once started, you'll see:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
     Mailpit URL: http://localhost:54324
        anon key: eyJh......
service_role key: eyJh......
```

**Save these credentials** - you'll need them for environment variables.

#### 4. Apply Migrations

```bash
# Apply all migrations
supabase db push

# Or reset database and apply migrations
supabase db reset
```

#### 5. Generate TypeScript Types

```bash
supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts
```

#### 6. Access Supabase Studio

Open http://localhost:54323 in your browser to access the local Supabase Studio.

### Option B: Supabase Cloud (Production)

#### 1. Create Supabase Project

1. Go to [database.new](https://database.new)
2. Sign in or create account
3. Click "New Project"
4. Choose organization and region
5. Set database password (save it securely)
6. Wait for project to be created (~2 minutes)

#### 2. Link Local Project

```bash
supabase link --project-ref your-project-ref
```

#### 3. Apply Migrations

```bash
supabase db push
```

#### 4. Generate TypeScript Types

```bash
supabase gen types typescript --project-id your-project-ref > apps/web/src/lib/supabase/database.types.ts
```

#### 5. Get API Credentials

1. Go to Project Settings > API
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (for server-side only)

---

## Environment Variables

### 1. Create Environment Files

**For Local Development** (`apps/web/.env.local`):

```env
# Supabase Configuration (Local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true

# Testing (Optional)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
```

**For Production** (`apps/web/.env.production`):

```env
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=https://your-app.pages.dev

# Feature Flags
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true
```

### 2. OAuth Configuration (Optional)

If using Google or GitHub OAuth:

**Local** (`supabase/.env`):
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Production**: Set these in Supabase Dashboard > Authentication > Providers

---

## Running the Application

### Development Mode

```bash
# From root directory
npm run dev

# Or from web app directory
cd apps/web
npm run dev
```

**Access**:
- Web App: http://localhost:3000
- Supabase Studio: http://localhost:54323

### Production Build

```bash
# Build all apps
npm run build

# Or build web app only
cd apps/web
npm run build
```

### Preview Production Build

```bash
cd apps/web
npm run start
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Test Requirements

- Supabase must be running locally
- Test user credentials in `.env.local`
- Database must have migrations applied

---

## Deployment

### Frontend (Cloudflare Pages)

#### 1. Connect Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages > Create a project
3. Connect your Git repository
4. Select `uiforge-webapp` repository

#### 2. Configure Build

- **Framework preset**: Next.js
- **Build command**: `cd apps/web && npm install && npm run build`
- **Build output directory**: `apps/web/.next`
- **Root directory**: `/`
- **Node version**: 20

#### 3. Environment Variables

Add in Cloudflare Pages settings:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_API_URL=https://your-app.pages.dev
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true
```

#### 4. Deploy

Push to `main` branch to trigger automatic deployment.

### Database (Supabase)

Migrations are automatically applied via `supabase db push` or manually in Supabase Dashboard.

**Production Checklist**:
- ✅ Migrations applied
- ✅ RLS policies enabled
- ✅ Storage buckets created
- ✅ OAuth providers configured (if using)
- ✅ Custom domain configured (optional)

---

## Troubleshooting

### Supabase Won't Start

**Issue**: `supabase start` fails or hangs

**Solutions**:
1. Ensure Docker Desktop is running
2. Check Docker has enough resources (4GB RAM minimum)
3. Stop existing containers: `supabase stop --no-backup`
4. Remove volumes: `docker volume prune`
5. Restart Docker Desktop
6. Try again: `supabase start`

### Migration Errors

**Issue**: `supabase db push` fails

**Solutions**:
1. Check migration SQL syntax
2. Verify no conflicting migrations
3. Reset database: `supabase db reset`
4. Check Supabase logs: `supabase logs`

### Type Generation Fails

**Issue**: `supabase gen types` fails

**Solutions**:
1. Ensure Supabase is running
2. Verify migrations are applied
3. Check database connection
4. Try with `--debug` flag

### Authentication Issues

**Issue**: Can't sign in or sign up

**Solutions**:
1. Check Supabase is running
2. Verify environment variables are correct
3. Check RLS policies are enabled
4. Verify email confirmation is disabled for local dev
5. Check Supabase logs for errors

### Storage Upload Fails

**Issue**: File uploads fail

**Solutions**:
1. Check storage buckets exist
2. Verify storage policies are correct
3. Check file size limits
4. Verify MIME types are allowed
5. Check user is authenticated

### Build Errors

**Issue**: `npm run build` fails

**Solutions**:
1. Clear `.next` directory: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`
4. Verify environment variables are set
5. Check for missing dependencies

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [UIForge plan.MD](../plan.MD)
- [Database Schema Documentation](./DATABASE_SCHEMA.md)

---

## Quick Commands Reference

```bash
# Supabase
supabase start              # Start local Supabase
supabase stop               # Stop local Supabase
supabase db reset           # Reset database and apply migrations
supabase db push            # Apply migrations
supabase gen types          # Generate TypeScript types
supabase status             # Check Supabase status

# Development
npm run dev                 # Start dev server
npm run build               # Build for production
npm test                    # Run unit tests
npm run test:e2e            # Run E2E tests

# Database
psql 'postgresql://postgres:postgres@localhost:54322/postgres'  # Connect to local DB
```

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [plan.MD](../plan.MD) for architecture details
3. Check [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for schema info
4. Open an issue on GitHub
