---
description: Work with the Cloudflare Workers API backend. Use when editing API routes, MCP handlers, Gemini service, or Supabase integration.
---

# Backend: Cloudflare Workers API

## When to use

- Editing `apps/api/src/` — Workers entry point, MCP handlers, Gemini service
- Adding or modifying API endpoints
- Working with Supabase server-side queries
- Writing or updating API tests in `apps/api/__tests__/`

## Key directories

- `apps/api/src/index.ts` — Worker entry point, route registration
- `apps/api/src/mcp/` — MCP protocol handlers
- `apps/api/src/gemini/` — Gemini AI service (prompt building, streaming)
- `apps/api/__tests__/` — API tests (54 passing)

## MCP endpoints

The Workers API exposes these MCP tools:
- `generateComponent` — AI component generation (React/Vue/Angular/Svelte)
- `validateCode` — Code validation
- `formatCode` — Code formatting
- `generateWireframe` — SVG wireframe generation
- `exportToFigma` — Figma export with Auto Layout

## Gemini integration

- Model: `gemini-1.5-flash` (free tier: 60 req/min)
- API key: `GEMINI_API_KEY` Cloudflare secret — never hardcode
- Streaming: use `ReadableStream` for generation progress

## Supabase server-side

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY  // server-side only, never expose to client
);
```

## Error handling

- Return structured JSON errors: `{ error: string, code?: string }`
- HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 500 (server)
- Never expose stack traces or internal details in responses

## Testing

- Framework: Jest (not Vitest — matches monorepo setup)
- Run: `npm run test` from root (runs all 54 API tests)
- Test files: `apps/api/__tests__/`

## Deployment

- Config: `wrangler.toml`
- Secrets: `wrangler secret put <KEY>`
- Deploy: `wrangler deploy` or via GitHub Actions CI/CD
- Docs: `apps/api/README.md`, `apps/api/SETUP_SECRETS.md`

## MCP tools for reference

- **Context7**: Cloudflare Workers API, Hono, Web Fetch API docs
- **Brave Search / Exa**: Gemini API reference, Cloudflare Workers examples
