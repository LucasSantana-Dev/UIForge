# Siza API Service Architecture

## Deployment
- **Platform**: Cloudflare Workers
- **Endpoint**: api.siza.workers.dev
- **Framework**: Hono (lightweight web framework)
- **Runtime**: V8 isolates (edge computing)

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
- Cloudflare Workers automatic DDoS protection
