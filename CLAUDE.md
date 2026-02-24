# siza

Zero-cost web application for AI-driven UI generation. Turborepo monorepo.

## Quick Reference

```bash
npm run dev             # Start dev server (turbo)
npm run build           # Build all apps (turbo)
npm run lint            # Lint all (turbo)
npm run format          # Prettier all
npm run type-check      # TypeScript checking
npm run test            # Unit tests (turbo → Jest)
npm run test:e2e        # E2E tests (turbo → Playwright)
```

## Monorepo Structure

```
apps/
  web/                  # Next.js frontend (@siza/web)
    src/
      app/              # Next.js App Router pages
      components/       # UI components
      hooks/            # Custom React hooks
      lib/              # Utilities
      stores/           # State management
    e2e/                # Playwright E2E tests
  api/                  # API service (@siza/api)
packages/
  eslint-config/        # Shared ESLint config
supabase/
  migrations/           # Database migrations
  seed.sql              # Seed data
  config.toml           # Supabase config
```

## Tech Stack

- **Framework**: Next.js (App Router) with Turborepo
- **UI**: Radix UI + Tailwind CSS + shadcn/ui (class-variance-authority, clsx, lucide-react)
- **State**: TanStack React Query + Zustand stores
- **Auth/DB**: Supabase (SSR + client)
- **Email**: Resend SDK + react-email templates
- **Billing**: Stripe (Checkout, Customer Portal, Webhooks)
- **Code Editor**: Monaco Editor
- **AI**: Anthropic SDK, Google Generative AI, MCP SDK
- **Testing**: Jest (unit) + Playwright (E2E)
- **Deploy**: Cloudflare Pages (wrangler.toml)

## Architecture

```
forge-patterns → mcp-gateway → siza (this repo)
                                  ├── web (Next.js frontend)
                                  └── api (backend service)
```

The webapp consumes the mcp-gateway API to provide AI-powered UI generation to users. Supabase handles auth, database, and real-time features.

## Key Paths

- `apps/web/src/app/(auth)/` — Auth routes (signin, signup, forgot-password, reset-password)
- `apps/web/src/app/(dashboard)/` — Dashboard routes (generate, projects, settings, billing)
- `apps/web/src/app/(marketing)/` — Marketing/landing pages (pricing)
- `apps/web/src/app/api/` — API routes (components, projects, generate, wireframe, stripe, features, auth, usage)
- `apps/web/src/components/ui/` — shadcn/ui components (16+)
- `apps/web/src/components/billing/` — Billing UI (PricingCard, SubscriptionStatus, UsageChart, UpgradePrompt)
- `apps/web/src/lib/supabase/` — Supabase clients and types
- `apps/web/src/lib/email/` — Resend client, email service, auth email helpers
- `apps/web/src/lib/stripe/` — Stripe server/client SDK, plans, webhook handler
- `apps/web/src/lib/usage/` — Usage tracking, quota checks, plan limits
- `apps/web/src/lib/features/` — Feature flags (flags.ts, types.ts, client.ts, provider.tsx)
- `apps/web/src/emails/` — react-email templates (verification, welcome, password reset)
- `apps/web/src/stores/` — Zustand stores (auth, generation)
- `apps/api/` — Cloudflare Workers API with AI provider integrations
- `supabase/migrations/` — 10 migration files (schema, storage, templates, logging, providers, github, generation fields, embeddings, feature flags, subscriptions)

## Supabase Schema

11 tables with RLS: `profiles`, `projects`, `components`, `generations`, `api_keys`, `feature_flags`, `feature_flag_changes`, `subscriptions`, `plan_limits`, `usage_tracking`, `stripe_events`
4 storage buckets: `avatars`, `project-thumbnails`, `project-files`, `user-uploads`
Auth: Email/Password + Google/GitHub OAuth via `@supabase/ssr`

## Architecture Notes

- Feature flag provider wraps the app — DB-backed flags with env var fallback
- Stripe webhook flow: Stripe → `/api/stripe/webhook` → verify signature → sync subscription state to Supabase
- Usage limits: quota check before generation/project creation, increment after success (gated by ENABLE_USAGE_LIMITS flag)

## CI/CD

- GitHub Actions: ci.yml, deploy-web.yml, production.yml, release-automation.yml
- Cloudflare Pages deployment (wrangler)
- Supabase migrations
- Secret scanning, npm audit security

## Conventions

- Turborepo for build orchestration
- Next.js App Router (not Pages)
- Radix + Tailwind + shadcn/ui component pattern
- Supabase SSR auth (`@supabase/ssr`)
- Conventional commits
- Trunk-based development
