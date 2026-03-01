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
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
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
- **Version**: v0.20.0 (released 2026-03-01)
- **Domain**: `siza.forgespace.co` (Cloudflare Workers)
- **Dev**: `dev.forgespace.co`
- **Branch**: `feat/landing-page-polish` — PR #228 open
- **Tags**: v0.2.1 → ... → v0.19.0 → v0.20.0
- **Recent merges**: #227 (v0.20.0 release), #226 (docs UI polish), #224 (v0.19.0), #222 (cost controls + refinement)
- **PR #228**: Landing page polish — OG image, metadata, stats bar fix, hero copy, footer links
- **Desktop**: v0.2.0 released (Electron + Ollama local generation)
- **Tests**: 608+ webapp + 22 desktop passing

## Landing Page (apps/web)
- **OG image**: `apps/web/public/og-image.png` — branded 1200x630, 102 KB static PNG
- **Metadata**: Complete OpenGraph + Twitter card in `layout.tsx` with `metadataBase`, `siteName`, `canonical`
- **Stats bar**: 7 repos, 4 frameworks, 5 quality gates, 608+ tests
- **Hero**: "Generate production UI with AI"
- **Footer**: "Community" (GitHub Discussions), "Changelog" → GitHub Releases