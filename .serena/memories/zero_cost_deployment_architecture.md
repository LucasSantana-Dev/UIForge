# Siza Zero-Cost Deployment Architecture

## Hosting Strategy
Unified deployment — single Cloudflare Workers instance serves both web and API.

## Platform: Cloudflare Workers via OpenNext
- **Adapter**: `@opennextjs/cloudflare@1.17.0`
- **Framework**: Next.js 16 (App Router) compiled to Workers-compatible format
- **Runtime**: V8 isolates (edge computing, globally distributed)
- **Config files**: `wrangler.jsonc` + `open-next.config.ts` in `apps/web/`
- **Build command**: `NODE_ENV=production npx opennextjs-cloudflare build`
- **Deploy**: `npx wrangler deploy` or GitHub Actions with `wrangler-action@v3`

## Architecture: Unified Web + API
- Next.js serves both frontend pages and API routes from a single Worker
- No separate API service (previous Hono-based Workers API removed)
- API routes live in `apps/web/src/app/api/` (Next.js route handlers)
- SSE streaming for AI generation works through Next.js API routes

## Edge Runtime Workaround
- **Problem**: Next.js 16 `proxy.ts` is Node.js-only; OpenNext doesn't support it (issue #962)
- **Solution**: `middleware.ts` with `runtime = 'experimental-edge'`
- Rate limiting, auth checks, and request routing handled in middleware
- API routes must NOT export `runtime = 'nodejs'` (OpenNext handles automatically)

## Rate Limiting
- **Pattern**: Lazy cleanup (no `setInterval` — forbidden in Workers)
- Stale entries cleaned on each request check cycle
- In-memory Map for rate limit tracking (per-isolate)

## Database & Auth
- **Platform**: Supabase
- **Services**: PostgreSQL + Auth + Storage + pgvector (RAG)
- **Free Tier**: 500MB database, 1GB file storage, 50k MAU
- **Connection**: Direct from Workers via Supabase JS client

## AI Services
- **Primary**: Gemini 2.0 Flash (free tier, streaming SSE)
- **BYOK**: User-provided API keys for OpenAI/Anthropic
- **Encryption**: AES-256-GCM for stored API keys

## CI/CD
- **Platform**: GitHub Actions (Node 22 across all workflows)
- **Free Tier**: 2000 minutes/month for private repos
- **Core workflows**: `ci.yml` (quality), `deploy-web.yml` (auto-deploy), `deploy-web-admin.yml` (manual admin deploy)
- **Deploy Action**: `cloudflare/wrangler-action@v3` with `--keep-vars`
- **Branch flow**: `feat/*` → PR to `dev` → PR to `main` → auto-deploy
- **Admin deploy**: `deploy-web-admin.yml` (workflow_dispatch) — Workers via OpenNext, production requires main branch
- **Cleanup (PR #43)**: Removed 3 broken scaffold workflows, standardized Node 22, deploy-web-admin rewritten from Pages → Workers

## Monitoring
- **Workers**: Cloudflare Workers Analytics (free tier)
- **Database**: Supabase dashboard metrics
- **Errors**: Console logging in Workers (Cloudflare dashboard)

## Cost Summary
- Total monthly cost: $0 (within free tier limits)
- Scales to ~100k requests/day before paid tier required
- No separate API hosting cost (unified Worker)
