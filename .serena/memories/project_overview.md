# Siza Project Overview

## Identity
- **Name**: Siza (previously UIForge)
- **Named after**: Álvaro Siza Vieira, Portuguese architect, Pritzker Prize 1992
- **Philosophy**: Tectonic Cut — forms defined by removal, not addition
- **Tagline**: "Design that thinks. Code that lasts."
- **Positioning**: AI-powered UI development platform, MCP-native, open-source

## The Architect Metaphor
Siza is the architect in the room — designs the blueprint, not lays the bricks. Transforms how you build UI, not builds it for you. The forge/anvil metaphor governs the Forge Space ecosystem.

## Logo: Anvil Evolved (Mark C)
Three offset rectangles — base (widest), face (wide), horn (narrow, right-shifted). Tectonic asymmetry. Only `#7C3AED` or `#FAFAFA` fill. Never gradient, never rotated.

## Architecture
**Monorepo structure**:
- `apps/web` — Next.js 16 frontend (@siza/web)
- `apps/api` — API utilities and shared services (@siza/api)
- `packages/` — Shared utilities and types

## Core Features
- AI-powered component generation with streaming SSE
- Figma export service (wireframe-to-figma)
- BYOK model (bring your own AI keys)
- Dark-only theme with 5-layer animated background
- MCP server integration for AI routing

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 3
- **Backend**: Cloudflare Workers, Hono framework
- **Database**: Supabase (auth + PostgreSQL + storage)
- **AI**: Gemini 2.0 Flash (primary), BYOK for OpenAI/Anthropic
- **Deployment**: Cloudflare Workers via OpenNext (unified web + API)
- **UI Library**: shadcn/ui (57 components), Lucide React icons

## Security
- AES-256 encryption for user API keys
- Environment-based key management
- No server-side key storage (BYOK principle)

## Brand Voice
Precise, confident, technical, dry, architectural. Write for engineers. No emoji in product copy. No marketing speak.

## Current State (2026-03-01)
- **Version**: v0.25.0 (released 2026-03-01)
- **Domain**: `siza.forgespace.co` (Cloudflare Workers)
- **Dev**: `dev.forgespace.co`
- **Branch**: main — 0 open PRs, all CI green
- **Tags**: v0.2.1 → ... → v0.24.0 → v0.25.0
- **v0.25.0 includes**: Skills system (#256, #257), platform metrics API (#262), GitHub PR tracking (#258), GeneratorForm refactor (#261), Sentry tracking (#264), E2E fixture fix (#260), dep upgrades (#271)
- **Dep upgrades (PR #271)**: @supabase/ssr ^0.8.0 (getAll/setAll cookie API), @anthropic-ai/sdk ^0.78.0, cmdk ^1.1.1
- **Desktop**: v0.2.0 released (Electron + Ollama local generation)
- **Tests**: 618 webapp + 54 API passing (49+ suites), 8 E2E spec files
- **Supabase prod** (`nfwmwdzbnvsyziyeubqb`): Skills + GitHub PR tracking migrations applied

## Supabase SSR Cookie API (v0.8.0)
- Old: `get(name)`, `set(name, value, options)`, `remove(name, options)` + `CookieOptions` import
- New: `getAll()`, `setAll(cookiesToSet)` — bulk operations, no CookieOptions needed
- Files: `apps/web/src/lib/supabase/server.ts`, `apps/web/src/middleware.ts`

## Landing Page
- **OG image**: `apps/web/public/og-image.png` — branded 1200x630, 102 KB static PNG
- **Metadata**: Complete OpenGraph + Twitter card in `layout.tsx`
- **Stats bar**: 8 repos, 4 frameworks, 5 quality gates, 618+ tests
- **Hero**: "Generate production UI with AI"