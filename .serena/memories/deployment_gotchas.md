# Siza Cloudflare Workers Deployment Gotchas

## Critical Rules
1. **No `runtime = 'edge'` on API routes** — OpenNext handles routing automatically. Explicit `runtime` declarations cause 500 errors on deployed Workers. Only exception: `middleware.ts` uses `experimental-edge`.
2. **WASM stub required for free tier** — `@vercel/og` ships resvg.wasm + yoga.wasm which exceed free tier. Stub them at deploy time with empty files.
3. **No `_redirects` file** — Causes infinite redirect loop on Workers. Remove any Cloudflare Pages-style redirect files.
4. **No `setInterval` in Workers** — V8 isolates don't support timers. Use lazy cleanup pattern (clean on each request cycle).
5. **`CLOUDFLARE_DEPLOY_ENABLED` must be `true`** — GitHub variable safety gate on `deploy-web.yml`. Deploy silently skips if not set.
6. **Bundle must stay under 3072 KiB gzip** — Free tier limit. Currently at 2880 KiB. Monitor with `wrangler deploy --dry-run`.
7. **`middleware.ts` IS the one exception** — Uses `runtime = 'experimental-edge'` for auth checks, rate limiting, and request routing.

## GitHub Secrets Required (6)
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
- `CODECOV_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BASE_URL`

## Deploy Commands
```bash
NODE_ENV=production npx opennextjs-cloudflare build   # Build for Workers
npx wrangler deploy --keep-vars                        # Deploy (preserves env vars)
curl https://siza-web.uiforge.workers.dev/api/health  # Verify deployment
```
