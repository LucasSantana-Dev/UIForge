---
trigger: model_decision
description: Cloudflare Pages and Workers deployment patterns. Apply when working with deployment config, CI/CD, or the Cloudflare Workers API.
globs: ["apps/api/**", "wrangler.toml", ".github/workflows/**", "scripts/**"]
---

# Cloudflare Deployment

**When to apply:** Working with Cloudflare Pages deployment, Workers API, CI/CD, or environment configuration.

## Architecture

```
Next.js 16 (Cloudflare Pages) → Cloudflare Workers API → Supabase
```

- **Frontend**: `apps/web/` deployed to Cloudflare Pages (static export)
- **API**: `apps/api/` deployed as Cloudflare Workers (MCP + Gemini)
- **CI/CD**: GitHub Actions → Cloudflare Pages deployment

## Next.js 16 static export

```js
// next.config.js
const config = {
  output: 'export',       // Static export for Cloudflare Pages
  trailingSlash: true,
  images: { unoptimized: true }, // No image optimization on static export
};
```

## Cloudflare Workers API (`apps/api/`)

- Entry point: `apps/api/src/index.ts`
- MCP handlers: `apps/api/src/mcp/`
- Gemini service: `apps/api/src/gemini/`
- Config: `wrangler.toml`

### Secrets (never hardcode)

```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Document all required secrets in `apps/api/SETUP_SECRETS.md`.

## Environment variables

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### API (`wrangler.toml` vars + secrets)
```toml
[vars]
SUPABASE_URL = "https://..."
ENVIRONMENT = "production"
```

## CI/CD (GitHub Actions)

- Workflow: `.github/workflows/deploy.yml`
- Triggers: push to `main`
- Steps: install → build → deploy to Cloudflare Pages
- Secrets stored in GitHub repository secrets

## Security headers

Configured in `wrangler.toml` or `_headers` file:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Zero-cost constraints

- **Cloudflare Pages**: unlimited bandwidth, 500 builds/month (free)
- **Cloudflare Workers**: 100,000 requests/day (free)
- **Gemini 1.5 Flash**: 60 requests/minute (free tier)
- Never introduce paid services without explicit decision

## Proxy (Next.js 16)

Next.js 16 replaced `middleware.ts` with `proxy.ts`:
```ts
// apps/web/src/proxy.ts
export async function proxy(request: NextRequest) { ... }
export const config = { matcher: [...] };
```

## Deployment checklist

- [ ] `npm run build` passes locally
- [ ] `npm run test` passes (54 API tests)
- [ ] No hardcoded secrets
- [ ] `wrangler.toml` updated if new env vars added
- [ ] `SETUP_SECRETS.md` updated if new secrets added
- [ ] Security headers configured
- [ ] CHANGELOG.md updated
