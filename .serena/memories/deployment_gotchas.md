# Siza Deployment Gotchas (v0.41.0)

## Primary Deploy: Vercel
- **Trigger**: Push to `main` → `deploy-web.yml` → `vercel build --prod` → `vercel deploy --prebuilt --prod`
- **Secrets required**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- **Build output**: `apps/web/.next/`
- **URL**: `siza.forgespace.co`

## Secondary Deploy: Cloudflare Workers (legacy)
Only used if explicitly deploying to Workers:
```bash
cd apps/web && NODE_ENV=production npx opennextjs-cloudflare build
npx wrangler deploy --keep-vars
```

## Critical Cloudflare Workers Rules
1. **No `runtime = 'edge'` on API routes** — Only exception: `middleware.ts` uses `experimental-edge`
2. **WASM stub required** — `@vercel/og` ships resvg.wasm + yoga.wasm exceeding free tier
3. **No `_redirects` file** — Causes infinite redirect loop
4. **Bundle must stay under 3072 KiB gzip** — Free tier limit
5. **No `setInterval` in Workers** — Use lazy cleanup pattern

## GitHub Secrets (17)
- Vercel: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- App: `NEXT_PUBLIC_BASE_URL`, `CODECOV_TOKEN`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`
- Security: `NEXT_PUBLIC_SENTRY_DSN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`

## GitHub Variables (3)
- `NEXT_PUBLIC_ENABLE_STRIPE_BILLING=true`
- `NEXT_PUBLIC_ENABLE_USAGE_LIMITS=true`
- `NEXT_PUBLIC_ENABLE_ONBOARDING=true`

## Release Automation
- `release-automation.yml` — auto-creates git tags + GitHub releases on version bump PR merge
- Trigger: version change in `apps/web/package.json` on merge to `main`
- Also bumps root `package.json` (keep in sync)

## Pre-deploy Checklist
Use `/deploy-check` skill for full validation. Key checks:
1. `npm run type-check` — no TS errors
2. `npm run lint` — no lint errors
3. `cd apps/web && npx jest --forceExit` — all tests pass
4. `npm run build` — build succeeds

## ESLint Gotchas
- `eslint-disable-next-line` in JSX multi-line elements: use block `{/* eslint-disable rule */}` / `{/* eslint-enable rule */}` pairs
- `__mocks__/` directory globally ignored in `apps/web/eslint.config.js`
- ESLint 9 flat config at `apps/web/eslint.config.js` (takes precedence)

## apps/docs Gotchas
- **Pre-existing Fumadocs TS errors** — `.source/server` not generated until build time
- For non-code commits: use `HUSKY=0 git commit` to skip pre-commit type-check
- Build: must use `NODE_ENV=production next build` (shell `NODE_ENV=development` causes SSR null errors)

## npm Lockfile Gotcha
- `npm install --legacy-peer-deps` PRUNES peer dependencies from lock file
- CI `npm ci` then fails with `Missing: <package> from lock file`
- Fix: `git checkout origin/main -- package-lock.json && npm install` (without --legacy-peer-deps)
