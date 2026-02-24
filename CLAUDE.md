# Siza - AI-Powered UI Development Platform

## Structure
Turborepo monorepo:
- `apps/web` — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- `apps/api` — API utilities and shared services
- `packages/` — Shared types and utilities

## Deployment
**Cloudflare Workers via OpenNext** (`@opennextjs/cloudflare@1.17.0`):
- Config: `apps/web/wrangler.jsonc` + `apps/web/open-next.config.ts`
- Build: `NODE_ENV=production npx opennextjs-cloudflare build` (from `apps/web/`)
- Deploy: GitHub Actions with `cloudflare/wrangler-action@v3`
- Unified: web + API routes served from single Worker

## Key Constraints
- **No `setInterval`** in Workers — use lazy cleanup pattern for rate limiting
- **No `runtime = 'nodejs'`** exports in API routes — OpenNext handles runtime automatically
- **middleware.ts** with `runtime = 'experimental-edge'` — proxy.ts workaround (Next.js 16 proxy.ts is Node.js-only, OpenNext issue #962)
- **`GITHUB_TOKEN` env var** overrides `gh` keyring auth — use `GITHUB_TOKEN= gh ...`

## Dev Flow (Trunk-Based)
- Branch from `dev`: `git checkout -b feat/feature-name`
- PR to `dev` first → CI checks → merge
- PR from `dev` → `main` → auto-deploy to Cloudflare Workers
- Conventional commits: feat, fix, refactor, chore, docs

## Key Commands
```bash
npm run dev          # turbo dev (all apps)
npm run build        # turbo build
npm run lint         # turbo lint
npm run test         # turbo test
npm run test:e2e     # Playwright e2e tests
```

## Tech Stack
- **Frontend**: Next.js 16, React 19, shadcn/ui, Radix, Tailwind CSS 4, Lucide icons
- **Database**: Supabase (PostgreSQL + Auth + Storage + pgvector)
- **AI**: Gemini 2.0 Flash (primary), BYOK for OpenAI/Anthropic
- **Deployment**: Cloudflare Workers via OpenNext

## Critical Paths
- Generation route: `apps/web/src/app/api/generate/route.ts`
- Edge middleware: `apps/web/src/middleware.ts`
- Gemini service: `apps/web/src/lib/services/gemini.ts`
- Rate limiter: lazy cleanup in middleware (no setInterval)
- Supabase migrations: `supabase/migrations/`

## Security
- AES-256-GCM encryption for user API keys
- Zod validation on all API inputs
- RLS policies on all Supabase tables
- No plaintext credentials in code or config
