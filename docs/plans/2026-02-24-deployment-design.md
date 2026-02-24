# Phase 3: Production Deployment Design

## Context

Phase 2 (AI Generation with Gemini) is complete and merged to `dev`. The MVP flow works locally: sign up, create project, generate component with Gemini, preview, save. This phase deploys it to production.

## Architecture

```
User -> Cloudflare Pages (siza-web.pages.dev)
          |-- Static assets (HTML/CSS/JS) -> CDN edge
          |-- API routes (/api/*) -> Pages Functions (edge)
          |     |-- /api/generate -> Gemini SDK (streaming SSE)
          |     |-- /api/generations -> Supabase CRUD
          |     +-- /api/projects -> Supabase CRUD
          +-- Auth -> Supabase Auth (email + Google + GitHub OAuth)

Supabase Cloud (production)
  |-- PostgreSQL (generations, projects, profiles)
  |-- Auth (email/password, Google OAuth, GitHub OAuth)
  |-- Storage (future)
  +-- RLS policies
```

Single Cloudflare Pages deployment. No separate Workers API. `@cloudflare/next-on-pages` compiles API routes into Pages Functions. The Express API in `apps/api/` stays dormant.

## Deployment Pipeline

- Push to `dev` -> auto-deploy to preview (siza-web.pages.dev)
- Push to `main` -> auto-deploy to production
- CI: `npm ci` -> `npm run build` -> `npx @cloudflare/next-on-pages` -> `cloudflare/pages-action@v1`

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | Cloudflare Pages | Zero-cost, existing config, SSR support |
| Next.js adapter | @cloudflare/next-on-pages | Official adapter, API routes as edge functions |
| Domain | .pages.dev (default) | Ship fast, custom domain later |
| Auth | Email + Google + GitHub OAuth | Full auth experience for MVP |
| API | No separate deployment | Gemini calls from Next.js edge functions |
| Supabase | Cloud project (already exists) | Apply migrations, enable RLS, set OAuth |

## Code Changes

1. Install `@cloudflare/next-on-pages` devDependency
2. Add `export const runtime = 'edge'` to API routes
3. Update `next.config.js` for Cloudflare compatibility
4. Fix `deploy-web.yml` workflow (replace mock commands with real deploy)
5. Update `wrangler.toml` with correct project config
6. Verify migrations are clean and idempotent
7. Ensure RLS policies exist
8. Verify OAuth sign-in UI exists and works

## Environment Variables (Cloudflare Pages Dashboard)

- `NEXT_PUBLIC_SUPABASE_URL` - production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - production anon key
- `GEMINI_API_KEY` - server-side only

## GitHub Secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Manual Steps (user)

1. Apply migrations: `supabase db push --linked`
2. Set Google OAuth credentials in Supabase dashboard
3. Set GitHub OAuth credentials in Supabase dashboard
4. Set Cloudflare env vars in Pages dashboard
5. Set GitHub secrets for CI deploy

## Success Criteria

- App accessible at siza-web.pages.dev
- Sign up with email works
- Sign in with Google/GitHub OAuth works
- Create project, generate component, preview, save all work
- CI deploys automatically on push to dev/main
