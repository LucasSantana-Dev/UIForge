# Siza Project Overview

## Identity
- **Name**: Siza (previously UIForge)
- **Named after**: Álvaro Siza Vieira, Portuguese architect known for precision and minimalism
- **Tagline**: "Design that thinks. Code that lasts."

## Purpose
Precision UI generation platform that transforms natural language descriptions and wireframes into production-ready React components using AI.

## Architecture
**Monorepo structure**:
- `apps/web` - Next.js 14 frontend (@siza/web)
- `apps/api` - Cloudflare Workers backend (@siza/api)
- `packages/` - Shared utilities and types

## Core Features
- AI-powered component generation with streaming SSE responses
- Figma export service (wireframe-to-figma conversion)
- BYOK model (bring your own AI keys - OpenAI, Anthropic)
- Dark-only theme with custom mesh background
- MCP server integration for AI routing

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono framework
- **Database**: Supabase (auth + PostgreSQL + storage)
- **AI**: OpenAI GPT-4, Anthropic Claude (user-provided keys)
- **Deployment**: Vercel (web), Cloudflare Workers (API)

## Security
- AES-256 encryption for user API keys
- Environment-based key management
- No server-side key storage (BYOK principle)

## Domain
- Production: siza.dev (planned)
- API: api.siza.workers.dev
