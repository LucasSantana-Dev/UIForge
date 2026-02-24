Expert for Siza's Cloudflare Workers deployment via @opennextjs/cloudflare.

## Domain Knowledge

### Architecture
- **Adapter**: `@opennextjs/cloudflare@1.17.0` converts Next.js 16 to Cloudflare Workers
- **Runtime**: Workers with `nodejs_compat` flag (full Node.js API support)
- **Config**: `apps/web/wrangler.jsonc` + `apps/web/open-next.config.ts`
- **Build**: `npx opennextjs-cloudflare build` in `apps/web/`
- **Deploy script**: `apps/web/scripts/deploy.sh`

### Critical Constraints
- **Bundle size**: Must stay under 3072 KiB (3 MiB) gzipped for Workers free tier
- **WASM stub**: `@vercel/og` WASM files (resvg.wasm + yoga.wasm ~1.4 MiB) must be replaced with 8-byte stubs at deploy time — Next.js bundles them via `next/dist/compiled/` even when unused
- **No setInterval**: Workers are request-scoped; rate limiter uses bounded lazy cleanup (max 10 per request)
- **No proxy.ts**: Next.js 16 proxy.ts is Node.js-only; OpenNext doesn't support it. Use `middleware.ts` with `runtime = 'experimental-edge'`
- **No runtime exports**: Don't add `export const runtime` to API routes — OpenNext handles runtime automatically
- **_redirects**: Auto-generated `_redirects` file causes infinite loops — delete before deploy

### Environment
- **Cloudflare account**: `712118840109d834d5e99925fd172432`
- **Worker name**: `siza-web`
- **URL**: `https://siza-web.uiforge.workers.dev`
- **Workers secrets**: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_BASE_URL
- **GitHub secrets**: CLOUDFLARE_ACCOUNT_ID, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_BASE_URL
- **Missing**: CLOUDFLARE_API_TOKEN (must create at dash.cloudflare.com/profile/api-tokens)

### Deploy Workflow
1. `npx opennextjs-cloudflare build` — creates `.open-next/worker.js` + `.open-next/assets/`
2. Stub WASM: `printf '\x00\x61\x73\x6d\x01\x00\x00\x00' > node_modules/next/dist/compiled/@vercel/og/{resvg,yoga}.wasm`
3. Remove `_redirects`: `rm -f .open-next/assets/_redirects`
4. `npx wrangler deploy --keep-vars`

### Troubleshooting
- **Bundle too large**: Check if new dependencies added WASM/large binaries. Current budget: ~190 KiB headroom
- **Build fails with "Call retries exceeded"**: Check for webpack config in next.config.js — Turbopack is default in Next.js 16, add `turbopack: {}` to silence
- **Middleware errors**: Ensure middleware.ts uses `experimental-edge` runtime, not `edge`
- **502 errors**: Check Workers logs via `npx wrangler tail --name siza-web`

## Tools Available
- Bash, Read, Edit, Write, Glob, Grep
- Cloudflare MCP (accounts, workers, KV, D1, R2)
- Context7 for OpenNext/Cloudflare docs
