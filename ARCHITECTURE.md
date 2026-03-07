# Architecture

## Overview

Siza is an IDP that prevents "AI limbo engineering" through AI-powered generation, governance workflows, and integrated development tooling. Turborepo monorepo with Next.js 16 web app, Electron desktop client, API service, and shared component library.

**Version**: 0.35.0 | **Deploy**: Cloudflare Workers via OpenNext | **Bundle limit**: 3072 KiB gzipped

## Monorepo Structure

```
apps/
├── web/              # Next.js 16 (App Router) — main webapp
├── desktop/          # Electron 40.8 (Ollama local generation)
├── api/              # Cloudflare Workers API
└── docs/             # Fumadocs documentation site
packages/
├── ui/               # @siza/ui (Radix + Tailwind + shadcn)
├── eslint-config/    # Shared ESLint config
└── create-siza-app/  # Project scaffolding CLI
supabase/
├── migrations/       # 17 database migrations
├── seed.sql          # Templates, feature flags
└── config.toml       # Local Supabase config
```

## Route Map

### Marketing: `/`, `/about`, `/pricing`, `/roadmap`, `/docs`
### Auth: `/auth/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/callback`
### Dashboard: `/dashboard`, `/generate`, `/projects`, `/templates`, `/history`, `/billing`, `/settings`
### IDP: `/catalog`, `/catalog/graph`, `/golden-paths`, `/admin`, `/admin/audit`
### Onboarding: `/onboarding` (multi-step wizard)
### API: `/api/generate`, `/api/projects/*`, `/api/catalog/*`, `/api/stripe/*`, `/api/features/*`, `/api/audit/*`

## Data Flow

```
User Request
  ↓
Feature Flag Check (ENABLE_MCP_GATEWAY)
  ↓
Routing Decision:
  MCP Gateway → POST /rpc (JSON-RPC, JWT passthrough, SSE)
  Siza AI → Provider router (Gemini Pro/Flash, Claude, BYOK)
  ↓
Context Assembly (@forgespace/siza-gen/lite)
  Brand identity, design tokens, framework conventions
  ↓
AI Provider → Generated code
  ↓
Quality Gates (forge-patterns post-gen scorer)
  Anti-patterns, structure, TypeScript, React checks → A-F grade
  ↓
Store (Supabase: generations table, embeddings, usage tracking)
  ↓
Return (SSE stream or JSON)
```

## Key Subsystems

### Auth (Supabase SSR)
- Email/password + Google/GitHub OAuth
- Server-side cookies via `@supabase/ssr`
- RLS on all tables (user_id FK)

### Billing (Stripe)
- Plans: Free (20 gen/mo), Pro (500, $29), Team (unlimited, $99)
- Webhooks: checkout.session.completed, subscription.updated/deleted
- Usage tracking with quota checks (gated by ENABLE_USAGE_LIMITS)

### Generation Engine
- Providers: Claude, Gemini, OpenAI, custom BYOK (AES-256 encrypted keys)
- Context: `@forgespace/siza-gen/lite` (43 KB, no native deps)
- MCP Gateway: JSON-RPC proxy with Supabase JWT passthrough
- Quality: Post-gen scoring with A-F badge

### Feature Flags (27 total)
- DB-backed (feature_flags table) + env var fallback
- Key flags: ENABLE_MCP_GATEWAY, ENABLE_USAGE_LIMITS, ENABLE_STRIPE_BILLING, ENABLE_ONBOARDING, ENABLE_CATALOG

### IDP Governance
- Scorecards: Code quality, security, test coverage scoring
- Golden Paths: Opinionated templates from catalog
- Audit logs: Admin actions via MCP gateway
- Policy enforcement: Pre-merge quality checks

## Database (Supabase PostgreSQL 17)

11 core tables with RLS: profiles, projects, components, generations, api_keys, feature_flags, feature_flag_changes, subscriptions, plan_limits, usage_tracking, stripe_events.

4 storage buckets: avatars, project-thumbnails, project-files, user-uploads.

Extensions: pgvector (RAG embeddings).

## Desktop App (Electron)

- Local generation via Ollama (no cloud API needed)
- File system access via IPC
- MCP client for local server connections
- Auto-updates via GitHub releases

## Deployment

```bash
cd apps/web
npx opennextjs-cloudflare build    # Build
./scripts/deploy.sh                 # Stub @vercel/og + wrangler deploy
```

- **Prod**: siza.forgespace.co
- **Dev**: dev.forgespace.co
- **Bundle**: ~3019 KiB / 3072 KiB limit (97 KiB headroom)

## Extension Points

**New Route**: Create `app/(group)/[route]/page.tsx` + API handler + nav entry + RLS migration.

**New AI Provider**: Update `encryption.ts` union, `generation.ts` PROVIDER_MODELS, `ProviderSelector.tsx`, test counts.

**New Feature Flag**: Add to `flags.ts` DEFAULT_FEATURE_FLAGS, seed in `seed.sql`, update test count (27).

**New Quality Gate**: Add checker in `lib/quality/gates/`, register in `runAllGates`, add weight.

## Testing

- **Unit**: Jest — 763+ webapp tests, 54+ API tests, 64+ suites
- **E2E**: Playwright — 8 spec files (auth, generation, projects, billing)
- **Coverage**: 80%+ actual (thresholds: 60-75%)
- **CI**: GitHub Actions (ci.yml, deploy-web.yml, secret-scan.yml)
