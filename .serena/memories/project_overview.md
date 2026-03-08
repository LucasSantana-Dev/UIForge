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

## Current State (2026-03-07)
- **Version**: v0.39.0 (released 2026-03-07)
- **Domain**: `siza.forgespace.co` (Cloudflare Workers)
- **Branch**: main — 2 open PRs (#388 Skills spec, #391 Entity permissions)
- **Tags**: v0.2.1 → ... → v0.33.0 → v0.39.0
- **Tests**: 763+ webapp + 54 API passing, 64+ suites, 8 E2E spec files
- **RBAC**: Team-based RBAC with entity permissions (see `rbac_entity_permissions` memory)
- **IDP**: All 4 phases complete — Plugin System, TechDocs, Search Federation, Entity Relationships
- **Desktop**: v0.2.0 released (Electron + Ollama local generation)
- **Deploy**: Restored via @vercel/og stub (PR #298). Bundle 2975 KiB gzipped