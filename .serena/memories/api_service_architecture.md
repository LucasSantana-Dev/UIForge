# Siza API Service Architecture

## Deployment
- **Platform**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare@1.17.0`)
- **Framework**: Next.js 16 API routes (unified with web, no separate API service)
- **Runtime**: V8 isolates (edge computing)
- **Config**: `wrangler.jsonc` + `open-next.config.ts` in `apps/web/`
- **Live URL**: `siza-web.uiforge.workers.dev` (v0.3.0, 2026-02-24)
- **CRITICAL**: API routes must NOT export `runtime` at all — OpenNext handles routing automatically. `runtime = 'edge'` causes 500 errors.

## Core Routes

### Generation Endpoints
- `POST /generate` - SSE streaming component generation
- `POST /generate/validate` - Validates generation request before processing
- `POST /generate/format` - Formats/prettifies generated code

### Figma Integration
- `POST /figma/export` - Wireframe-to-Figma conversion
- `POST /figma/validate` - Validates Figma export request

### Health & Metadata
- `GET /health` - Service health check
- `GET /metadata` - API version and capabilities

## MCP Server Integration
- Custom MCP server for AI model routing
- Tool-based routing: selects appropriate AI provider based on task
- Supports OpenAI and Anthropic models
- Dynamic prompt construction for component generation

## BYOK Key Management
- User API keys encrypted with AES-256-GCM
- Keys stored in encrypted format in Supabase
- Decryption at request time using user-specific salt
- No plaintext key storage on servers

## Response Format
- SSE (Server-Sent Events) for streaming generation
- JSON for validation/metadata endpoints
- Error responses follow RFC 7807 Problem Details

## Rate Limiting
- Per-user rate limits based on Supabase auth
- **Lazy cleanup pattern** (no `setInterval` — forbidden in Workers)
- Stale entries cleaned on each request check cycle
- Cloudflare Workers automatic DDoS protection
