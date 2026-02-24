# Siza Webapp - Deployment Guide

> **Version**: 0.1.1  
> **Last Updated**: 2026-02-15  
> **Target**: Zero-Cost Production Deployment

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                      │
│              (Frontend - Next.js 15)                    │
│         https://siza.pages.dev                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Auth         │  │ Database     │  │ Storage      │ │
│  │ (50K MAU)    │  │ (500MB)      │  │ (1GB)        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ Realtime     │  │ Edge Funcs   │                   │
│  │ (WebSocket)  │  │ (Optional)   │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

**Cost**: $0/month (within free tiers)

---

## 📋 Pre-Deployment Checklist

### 1. Code Ready
- [ ] All tests passing (`npm test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Production build works (`npm run build`)

### 2. Database Ready
- [ ] Migrations created and tested locally
- [ ] RLS policies verified
- [ ] Storage buckets configured
- [ ] Seed data prepared (if needed)

### 3. Environment Variables
- [ ] Production Supabase URL
- [ ] Production Supabase anon key
- [ ] OAuth credentials (if using)
- [ ] Feature flags configured

### 4. Documentation
- [ ] README.md updated
- [ ] plan.MD reflects current state
- [ ] API documentation complete

---

## 🚀 Step-by-Step Deployment

### Phase 1: Supabase Setup (Production)

#### 1.1 Create Supabase Project

1. Go to [database.new](https://database.new)
2. Sign in with GitHub
3. Click "New Project"
4. Configure:
   - **Organization**: Select or create
   - **Name**: `siza-prod`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to users (e.g., `us-east-1`)
   - **Pricing Plan**: Free

5. Wait for project creation (~2 minutes)

#### 1.2 Apply Migrations

**Option A: Via CLI** (Recommended)

```bash
# Link to production project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Verify migrations
supabase db diff
```

**Option B: Via Dashboard**

1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/migrations/20260215000001_initial_schema.sql`
3. Run the SQL
4. Copy contents of `supabase/migrations/20260215000002_storage_setup.sql`
5. Run the SQL
6. Verify tables in Table Editor

#### 1.3 Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider:
   - ✅ Enable email provider
   - ✅ Confirm email (disable for testing, enable for production)
   - ✅ Secure email change (enable)

3. Enable OAuth providers (optional):
   - **Google**:
     - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
     - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - **GitHub**:
     - Get credentials from [GitHub OAuth Apps](https://github.com/settings/developers)
     - Add authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`

4. Configure URL Configuration:
   - **Site URL**: `https://siza.pages.dev` (update after Cloudflare deployment)
   - **Redirect URLs**: Add `https://siza.pages.dev/**`

#### 1.4 Get API Credentials

1. Go to Project Settings > API
2. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJh...` (for client-side)
   - **service_role secret**: `eyJh...` (for server-side only, keep secret)

3. Save these securely - you'll need them for Cloudflare Pages

#### 1.5 Verify Database

1. Go to Table Editor
2. Verify tables exist:
   - ✅ profiles
   - ✅ projects
   - ✅ components
   - ✅ generations
   - ✅ api_keys

3. Go to Storage
4. Verify buckets exist:
   - ✅ avatars
   - ✅ project-thumbnails
   - ✅ project-files
   - ✅ user-uploads

---

### Phase 2: Cloudflare Pages Setup

#### 2.1 Prepare Repository

1. Ensure code is pushed to GitHub:
```bash
git add .
git commit -m "feat: production-ready deployment"
git push origin main
```

2. Verify `.gitignore` excludes:
   - `.env.local`
   - `.env.production`
   - `node_modules/`
   - `.next/`
   - `supabase/.branches/`
   - `supabase/.temp/`

#### 2.2 Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages > Create a project
3. Connect to Git > Select your repository
4. Configure build:
   - **Project name**: `siza` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: Next.js
   - **Build command**: `cd apps/web && npm install && npm run build`
   - **Build output directory**: `apps/web/.next`
   - **Root directory**: `/` (leave empty)
   - **Environment variables**: Add now (see below)

#### 2.3 Configure Environment Variables

Add these in Cloudflare Pages > Settings > Environment variables:

**Production Environment**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_API_URL=https://siza.pages.dev
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true
NODE_VERSION=20
```

**Preview Environment** (optional):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
NEXT_PUBLIC_API_URL=https://preview.siza.pages.dev
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true
NODE_VERSION=20
```

#### 2.4 Deploy

1. Click "Save and Deploy"
2. Wait for build to complete (~5-10 minutes)
3. Monitor build logs for errors
4. Once deployed, note your URL: `https://siza.pages.dev`

#### 2.5 Update Supabase URLs

1. Go back to Supabase Dashboard
2. Authentication > URL Configuration
3. Update:
   - **Site URL**: `https://siza.pages.dev`
   - **Redirect URLs**: `https://siza.pages.dev/**`

---

### Phase 3: Custom Domain (Optional)

#### 3.1 Add Custom Domain

1. Cloudflare Pages > Custom domains
2. Click "Set up a custom domain"
3. Enter your domain: `app.yourdomain.com`
4. Follow DNS configuration instructions

#### 3.2 Update Supabase URLs

1. Go to Supabase Dashboard
2. Authentication > URL Configuration
3. Update:
   - **Site URL**: `https://app.yourdomain.com`
   - **Redirect URLs**: `https://app.yourdomain.com/**`

---

## 🔒 Security Checklist

### Database Security
- [ ] RLS enabled on all tables
- [ ] Storage policies configured
- [ ] No public service_role key exposure
- [ ] Database password is strong and secure

### Application Security
- [ ] Environment variables not committed to Git
- [ ] API keys encrypted client-side
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting configured (via Supabase)

### Authentication Security
- [ ] Email confirmation enabled (production)
- [ ] OAuth redirect URIs whitelisted
- [ ] JWT expiry configured (default: 1 hour)
- [ ] Refresh token rotation enabled

---

## 📊 Monitoring & Maintenance

### Supabase Monitoring

1. **Database Usage**:
   - Go to Project Settings > Usage
   - Monitor:
     - Database size (500MB limit)
     - Storage size (1GB limit)
     - Bandwidth (2GB/month limit)
     - MAU (50,000 limit)

2. **Performance**:
   - Go to Database > Performance
   - Monitor slow queries
   - Check connection pool usage

3. **Logs**:
   - Go to Logs Explorer
   - Filter by service (Auth, Database, Storage)
   - Set up alerts for errors

### Cloudflare Pages Monitoring

1. **Analytics**:
   - Go to Pages > Analytics
   - Monitor:
     - Page views
     - Unique visitors
     - Bandwidth usage
     - Build success rate

2. **Build Logs**:
   - Go to Pages > Deployments
   - Check build logs for errors
   - Monitor build times

### Alerts Setup

**Supabase**:
- Set up email alerts for:
  - Database size > 80%
  - Storage size > 80%
  - MAU > 80%
  - Failed authentication attempts

**Cloudflare**:
- Set up notifications for:
  - Failed deployments
  - High error rates
  - Bandwidth spikes

---

## 🔄 CI/CD Pipeline

### Automatic Deployments

**Production** (main branch):
```
git push origin main
  ↓
Cloudflare Pages detects push
  ↓
Runs build command
  ↓
Deploys to production
  ↓
https://siza.pages.dev
```

**Preview** (feature branches):
```
git push origin feature/new-feature
  ↓
Cloudflare Pages detects push
  ↓
Runs build command
  ↓
Deploys to preview URL
  ↓
https://feature-new-feature.siza.pages.dev
```

### GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
```

---

## 🐛 Troubleshooting

### Build Fails on Cloudflare

**Issue**: Build command fails

**Solutions**:
1. Check build logs in Cloudflare dashboard
2. Verify `package.json` scripts are correct
3. Ensure Node version is 20 (`NODE_VERSION=20`)
4. Check environment variables are set
5. Test build locally: `npm run build`

### Database Connection Errors

**Issue**: Can't connect to Supabase

**Solutions**:
1. Verify Supabase URL is correct
2. Check anon key is correct
3. Verify project is not paused
4. Check network connectivity
5. Review Supabase status page

### Authentication Not Working

**Issue**: Users can't sign in/up

**Solutions**:
1. Check redirect URLs in Supabase
2. Verify email confirmation settings
3. Check OAuth credentials
4. Review authentication logs
5. Verify RLS policies

### Storage Upload Fails

**Issue**: File uploads fail in production

**Solutions**:
1. Check storage buckets exist
2. Verify storage policies
3. Check file size limits
4. Verify MIME types
5. Check user authentication

---

## 📈 Scaling Considerations

### When to Upgrade

**Supabase Pro** ($25/month):
- Database > 500MB
- Storage > 1GB
- MAU > 50,000
- Need custom domain for Supabase
- Need point-in-time recovery

**Cloudflare Pages Pro** ($20/month):
- Need more than 500 builds/month
- Need concurrent builds
- Need advanced analytics

### Performance Optimization

1. **Database**:
   - Add indexes for frequently queried columns
   - Use database functions for complex queries
   - Enable connection pooling

2. **Storage**:
   - Use image optimization
   - Compress files before upload
   - Clean up old files regularly

3. **Frontend**:
   - Enable Next.js image optimization
   - Use static generation where possible
   - Implement code splitting

---

## 🎉 Post-Deployment

### 1. Verify Deployment

- [ ] Visit production URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test project creation
- [ ] Test file upload
- [ ] Test component generation
- [ ] Check all pages load correctly

### 2. Update Documentation

- [ ] Update README.md with production URL
- [ ] Update plan.MD with deployment status
- [ ] Document any production-specific configurations

### 3. Announce

- [ ] Share production URL with team
- [ ] Update project status
- [ ] Celebrate! 🎉

---

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Siza plan.MD](../plan.MD)

---

## 🆘 Support

For deployment issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Cloudflare build logs
3. Check Supabase logs
4. Open an issue on GitHub
5. Contact team for help
