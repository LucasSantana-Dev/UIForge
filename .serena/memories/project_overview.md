# Siza Project Overview

## Identity
- **Name**: Siza (previously UIForge)
- **Named after**: Álvaro Siza Vieira, Portuguese architect, Pritzker Prize 1992
- **Philosophy**: Tectonic Cut — forms defined by removal, not addition
- **Tagline**: "Design that thinks. Code that lasts."
- **Positioning**: AI-powered UI development platform, MCP-native, open-source

## Architecture
**Monorepo structure**:
- `apps/web` — Next.js 16 frontend (@siza/web)
- `apps/api` — API utilities and shared services (@siza/api)
- `apps/desktop` — Electron desktop app with Ollama local generation
- `apps/docs` — Fumadocs documentation site
- `packages/` — Shared utilities and types

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 3
- **Backend**: Cloudflare Workers, Hono framework
- **Database**: Supabase (auth + PostgreSQL + storage)
- **AI**: Gemini 2.0 Flash (primary), BYOK for OpenAI/Anthropic
- **Deployment**: Vercel (primary), Cloudflare Workers (legacy)
- **UI Library**: shadcn/ui (57 components), Lucide React icons

## Current State (2026-03-15)
- **Version**: v0.47.1 (root + apps/web synced, PR #508)
- **Tests**: 1659 passing, 169 suites, 15 E2E spec files
- **Route coverage**: 100% — 68/68 API routes have unit tests
- **Security**: 0 high CVEs, 3 moderate dev-only (electron/yauzl, intentional)
- **RBAC**: Team-based RBAC with entity permissions
- **IDP**: All phases complete — Plugin System, TechDocs, Search Federation
- **Skills**: Anthropic Skills marketplace with import/export
- **Desktop**: v0.2.0 released (Electron + Ollama local generation)
- **Funnel**: P0 (scratch mode generate) + P1 (pre-fill form, simplified dashboard) merged

## Active PRs
- #508: `chore/sync-version-and-release` — version sync + CHANGELOG + verify skill v1.2.0

## Automation Tools
- `npm run routes:check` — verify 100% route test coverage
- `npm run routes:scaffold <path>` — scaffold test for new API route
- CI: route coverage gate runs before unit tests (fails on untested routes)
- Release: auto-bumps package.json on `chore: Release vX.Y.Z` commits

## Key Gotchas
- Run Jest from `apps/web/` NOT repo root
- Always `--forceExit` for Jest (Supabase mocks leave handles)
- `HUSKY=0` for non-code commits (docs, config)
- `apps/docs` has pre-existing Fumadocs TS errors (use `--filter=!@siza/docs`)
- Middleware: `runtime = 'experimental-edge'` required (OpenNext constraint)
