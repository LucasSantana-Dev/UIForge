# Siza v0.8.0 — Multi-LLM, History Browser, Template Polish

## Status: MERGED to main (2026-02-25)
- PR #92: `feat/v0.8.0-features` → `main`
- Commit: `0b60d93`
- All CI: GREEN (8/8 jobs)

## Features Shipped
1. **Multi-LLM Generation**: Provider/model selector in GeneratorForm, Zod schema + `generateWithProvider()` wired in route.ts
2. **Generation History Browser**: `/history` page with filters (framework, provider, status), server-side pagination
3. **Template Library Polish**: Debounced search, chip-style category filters, client-side pagination (12/page), loading skeletons
4. **MCP Gateway Client**: `lib/mcp/client.ts` behind `ENABLE_MCP_GATEWAY` flag (disabled by default), with Gemini fallback

## Critical Bug Fixed This Session
- **Multi-LLM routing was non-functional**: Zod schema in route.ts didn't include `provider`/`model` fields → silently stripped by `safeParse()`. Frontend sent them but route always fell through to Gemini.
- Fix: Added fields to schema, destructured, wired `generateWithProvider()` in non-MCP else-branch, tracked `activeProvider`/`activeModel` in DB insert/update.

## Architecture Decisions
- No new npm deps for OpenAI/Anthropic — raw fetch + SSE parsing to stay under 3 MiB Workers bundle limit
- MCP gateway path is primary when enabled, with automatic Gemini fallback on failure
- BYOK keys passed through to provider-specific streaming functions

## Lint Fixes Required Post-Merge
- Unused imports in history-client.tsx, templates-client.tsx, GeneratorForm.tsx
- React useEffect → handler refactor for model sync (GeneratorForm)
- Prettier formatting on 9 files
