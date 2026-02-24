# Phase 3: Production Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the Siza MVP to Cloudflare Pages with production Supabase, enabling user sign-up, project creation, AI component generation, and OAuth login.

**Architecture:** Single Cloudflare Pages deployment using `@cloudflare/next-on-pages` to compile Next.js API routes as edge functions. Supabase Cloud handles auth, database, and storage. No separate Workers API deployment.

**Tech Stack:** Next.js 16, @cloudflare/next-on-pages, Supabase (cloud), Cloudflare Pages, GitHub Actions

---

## Batch 1: Cloudflare Pages Adapter Setup

### Task 1: Install @cloudflare/next-on-pages

**Files:**
- Modify: `apps/web/package.json`

**Step 1: Install the adapter**

```bash
cd apps/web && npm install --save-dev @cloudflare/next-on-pages
```

**Step 2: Verify installation**

```bash
npx @cloudflare/next-on-pages --version
```

Expected: Version number printed without error.

**Step 3: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json ../../package-lock.json
git commit -m "chore: Install @cloudflare/next-on-pages adapter"
```

### Task 2: Update next.config.js for Cloudflare

**Files:**
- Modify: `apps/web/next.config.js`

**Step 1: Read the current config**

Current config is minimal: reactStrictMode + Supabase image patterns.

**Step 2: Update next.config.js**

```javascript
const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform();
}

module.exports = nextConfig;
```

Note: `setupDevPlatform()` must be called AFTER `nextConfig` is defined and only in dev mode.

**Step 3: Verify dev server still works**

```bash
cd apps/web && npm run dev
```

Expected: Dev server starts without errors. Kill after confirming.

**Step 4: Commit**

```bash
git add apps/web/next.config.js
git commit -m "feat: Configure next.config.js for Cloudflare Pages"
```

### Task 3: Add edge runtime to API routes

**Files:**
- Modify: `apps/web/src/app/api/generate/route.ts`
- Modify: `apps/web/src/app/api/generations/route.ts`
- Modify: `apps/web/src/app/api/generations/[id]/route.ts`
- Modify: `apps/web/src/app/api/projects/route.ts`
- Modify: `apps/web/src/app/api/projects/[id]/route.ts`
- Modify: `apps/web/src/app/api/components/route.ts`
- Modify: `apps/web/src/app/api/components/[id]/route.ts`
- Modify: `apps/web/src/app/api/generate/validate/route.ts`
- Modify: `apps/web/src/app/api/generate/format/route.ts`
- Modify: `apps/web/src/app/api/wireframe/route.ts`
- Modify: `apps/web/src/app/auth/callback/route.ts`

**Step 1: Add `export const runtime = 'edge'` to each route file**

For each of the 11 route files listed above, add after the existing exports (`runtime`, `dynamic`) or after imports:

```typescript
export const runtime = 'edge';
```

Note: `apps/web/src/app/api/generate/route.ts` already has `export const runtime = 'nodejs'` — change it to `'edge'`.

**Step 2: Verify build passes**

```bash
cd apps/web && npm run build
```

Expected: Build completes without errors.

**Step 3: Run tests**

```bash
cd apps/web && npx jest --no-coverage
```

Expected: All existing tests pass.

**Step 4: Commit**

```bash
git add apps/web/src/app/api/ apps/web/src/app/auth/
git commit -m "feat: Add edge runtime to all API routes for Cloudflare Pages"
```

### Task 4: Rewrite wrangler.toml for Pages

**Files:**
- Modify: `apps/web/wrangler.toml`

**Step 1: Replace the entire wrangler.toml**

The current wrangler.toml is Workers-style. Replace with Pages-compatible config:

```toml
name = "siza-web"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[vars]
ENVIRONMENT = "production"
```

Note: `@cloudflare/next-on-pages` outputs to `.vercel/output/static` — this is correct, not a Vercel dependency.

**Step 2: Build with the adapter to verify**

```bash
cd apps/web && npx @cloudflare/next-on-pages
```

Expected: Build succeeds and creates `.vercel/output/static/` directory.

**Step 3: Commit**

```bash
git add apps/web/wrangler.toml
git commit -m "feat: Rewrite wrangler.toml for Cloudflare Pages"
```

## Batch 2: CI/CD Pipeline + Environment

### Task 5: Fix deploy-web.yml workflow

**Files:**
- Modify: `.github/workflows/deploy-web.yml`

**Step 1: Rewrite the workflow**

```yaml
name: Deploy Web to Cloudflare Pages

on:
  push:
    branches: [main, dev]
  workflow_dispatch:

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - name: Build with Cloudflare adapter
        working-directory: apps/web
        run: npx @cloudflare/next-on-pages
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy apps/web/.vercel/output/static --project-name=siza-web
```

**Step 2: Validate workflow syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-web.yml'))"
```

Expected: No errors.

**Step 3: Commit**

```bash
git add .github/workflows/deploy-web.yml
git commit -m "fix: Rewrite deploy-web.yml for Cloudflare Pages with next-on-pages"
```

### Task 6: Update .env.example and add NEXT_PUBLIC_BASE_URL

**Files:**
- Modify: `apps/web/.env.example`
- Modify: `apps/web/src/lib/auth/oauth.ts`

**Step 1: Update .env.example**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App URL (used for OAuth redirect)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=
# Get a free key at https://aistudio.google.com/apikey

# Feature Flags
VITE_ENABLE_BYOK=true
VITE_ENABLE_GEMINI_FALLBACK=true
```

**Step 2: Verify oauth.ts handles NEXT_PUBLIC_BASE_URL**

Read `apps/web/src/lib/auth/oauth.ts`. It already falls back to `NEXT_PUBLIC_BASE_URL`. No change needed if it exists. If not, add the env var fallback.

**Step 3: Commit**

```bash
git add apps/web/.env.example
git commit -m "chore: Add NEXT_PUBLIC_BASE_URL to env example for OAuth redirect"
```

### Task 7: Fix in-memory rate limiting for edge

**Files:**
- Modify: `apps/web/src/lib/api/rate-limit.ts`

**Step 1: Read the current rate limiter**

The current implementation uses a `Map()` in memory. On edge, each request may run in a fresh isolate, so the Map resets. For MVP, this is acceptable — it still prevents rapid bursts within a single isolate. But we need to ensure it doesn't throw on edge.

**Step 2: Add a try-catch guard**

If the rate limiter uses any Node.js-specific APIs (like `Date.now()` is fine, but `process.hrtime` is not), wrap accordingly. Most likely no change needed — verify by reading the file.

**Step 3: Add a comment noting the edge limitation**

Add at the top of the file:

```typescript
// Note: In-memory rate limiting resets per edge isolate.
// For production scale, migrate to Cloudflare KV or Supabase.
```

**Step 4: Commit if changed**

```bash
git add apps/web/src/lib/api/rate-limit.ts
git commit -m "chore: Document edge runtime rate limiting limitation"
```

## Batch 3: Build Verification + PR

### Task 8: Full local build with Cloudflare adapter

**Step 1: Clean build**

```bash
cd apps/web && rm -rf .next .vercel
```

**Step 2: Build with next-on-pages**

```bash
npx @cloudflare/next-on-pages
```

Expected: Build succeeds, `.vercel/output/static/` directory created.

**Step 3: Test locally with wrangler**

```bash
npx wrangler pages dev .vercel/output/static
```

Expected: Local server starts. Test in browser:
- Homepage loads
- `/signin` page renders with Google/GitHub OAuth buttons
- API routes respond (e.g., GET `/api/generate` returns JSON)

Kill the server after testing.

**Step 4: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests pass.

### Task 9: Update CHANGELOG and README

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `README.md`

**Step 1: Add Phase 3 entries to CHANGELOG**

Under `## [Unreleased] > ### Added`:

```markdown
- **Cloudflare Pages deployment**: `@cloudflare/next-on-pages` adapter for edge deployment
- **Edge runtime**: all API routes configured for Cloudflare Workers edge runtime
- **Deploy workflow**: `deploy-web.yml` rewritten for Cloudflare Pages with next-on-pages
```

Under `### Changed`:

```markdown
- **`wrangler.toml`**: rewritten from Workers-style to Pages-compatible
- **`next.config.js`**: added Cloudflare dev platform setup
- **`.env.example`**: added `NEXT_PUBLIC_BASE_URL` for OAuth redirects
```

**Step 2: Update README deployment section**

Update the deployment badge and hosting reference to reflect Cloudflare Pages.

**Step 3: Commit**

```bash
git add CHANGELOG.md README.md
git commit -m "docs: Update CHANGELOG and README for Phase 3 deployment"
```

### Task 10: Create PR

**Step 1: Push and create PR**

```bash
git push -u origin feat/cloudflare-pages-deploy
gh pr create --base dev --title "feat: Cloudflare Pages deployment with next-on-pages" --body "..."
```

Include in PR body:
- Summary of changes (adapter, edge runtime, deploy workflow)
- Manual setup steps (GitHub secrets, Cloudflare Pages project, Supabase OAuth)
- Test plan

### Task 11: Manual deployment steps (user action)

After PR merges, the user needs to:

1. **Create Cloudflare Pages project** named `siza-web` in Cloudflare dashboard
2. **Set GitHub secrets:**
   - `CLOUDFLARE_API_TOKEN` — from Cloudflare API Tokens page
   - `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare dashboard
   - `NEXT_PUBLIC_SUPABASE_URL` — production Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — production Supabase anon key
3. **Apply Supabase migrations:** `supabase db push --linked`
4. **Set Cloudflare Pages env vars** in dashboard:
   - `GEMINI_API_KEY` — server-side
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL` = `https://siza-web.pages.dev`
5. **Configure OAuth providers** in Supabase Auth dashboard:
   - Google: client ID + secret from Google Cloud Console
   - GitHub: client ID + secret from GitHub Developer Settings
   - Add `https://siza-web.pages.dev/**` to allowed redirect URLs
6. **Trigger deploy:** Push to `dev` branch or manually dispatch workflow
7. **Verify:** Visit `https://siza-web.pages.dev`, sign up, generate a component

---

## Critical Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `apps/web/package.json` | Modify | Add @cloudflare/next-on-pages |
| `apps/web/next.config.js` | Modify | Cloudflare dev platform setup |
| `apps/web/wrangler.toml` | Rewrite | Pages-compatible config |
| `apps/web/src/app/api/**/route.ts` (10 files) | Modify | Add edge runtime export |
| `apps/web/src/app/auth/callback/route.ts` | Modify | Add edge runtime export |
| `.github/workflows/deploy-web.yml` | Rewrite | next-on-pages build + deploy |
| `apps/web/.env.example` | Modify | Add NEXT_PUBLIC_BASE_URL |
| `apps/web/src/lib/api/rate-limit.ts` | Modify | Document edge limitation |
| `CHANGELOG.md` | Modify | Phase 3 entries |
| `README.md` | Modify | Deployment info |

## Known Limitations

1. **Rate limiting** resets per edge isolate (acceptable for MVP, migrate to KV later)
2. **Image optimization** not available on edge (use `unoptimized: true` or Cloudflare Image Resizing)
3. **ISR/Revalidation** not supported by next-on-pages (not used in this app)
4. **Cold starts** on first request to each edge location (~50-200ms)

## Verification

1. `npx @cloudflare/next-on-pages` — builds without error
2. `npx wrangler pages dev .vercel/output/static` — local preview works
3. `npx jest --no-coverage` — all tests pass
4. Deploy to Cloudflare Pages — app accessible at .pages.dev URL
5. Sign up with email — works
6. OAuth sign-in (Google/GitHub) — works
7. Create project, generate component — works
