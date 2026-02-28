# Siza

> **The open full-stack AI workspace — generate, integrate, ship.**

Every AI code tool generates beautiful frontends. Then you spend days wiring auth, database, APIs, and deployment. Siza owns the full-stack integration layer — from idea to production, zero lock-in.

[![CI](https://github.com/Forge-Space/siza/actions/workflows/ci.yml/badge.svg)](https://github.com/Forge-Space/siza/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare_Workers-orange)](https://workers.cloudflare.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![Discussions](https://img.shields.io/github/discussions/Forge-Space/siza)](https://github.com/Forge-Space/siza/discussions)

**Live**: [siza.dev](https://siza.dev)\
**Dev**: [siza-web-dev.uiforge.workers.dev](https://siza-web-dev.uiforge.workers.dev)

## Why Siza

| What we are | What we're NOT |
|-------------|----------------|
| Open-source workspace you can self-host | Locked-in SaaS like v0.dev |
| Full-stack (UI + backend + deploy) | Frontend-only generator |
| MCP-native (composable AI tools) | Monolithic AI black box |
| Privacy-first (BYOK, zero telemetry) | Data-harvesting freemium |
| Generous free tier by default | Free trial with paywall |

## Features

- **AI-Powered Generation** — Natural language or screenshot to production-ready UI components
- **MCP-Native** — 12 UI tools, 7 branding tools, 20+ gateway servers, all composable via Model Context Protocol
- **Privacy-First BYOK** — Bring Your Own Key with client-side AES-256 encryption
- **Generous Free Tier** — Cloudflare Workers + Supabase + Gemini free tiers give you a generous starting point at $0/month
- **Self-Hostable** — Run everything locally with Docker, MIT licensed
- **Multi-LLM** — Swap between Gemini, Claude, GPT without code changes
- **Production Ready** — Monaco editor, live preview, Stripe billing, feature flags

## Quick Start

```bash
git clone https://github.com/Forge-Space/siza.git
cd siza
npm install
supabase start
supabase db push
npm run dev
```

Open [localhost:3000](http://localhost:3000). Supabase Studio at [localhost:54323](http://localhost:54323).

### Environment Setup

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true
```

## Architecture

```
forge-patterns (shared standards)
    |
    v
mcp-gateway (AI tool routing) --> siza-mcp (12 UI tools)
    |                              branding-mcp (7 brand tools)
    v
siza (this repo)
├── apps/web      — Next.js 16 frontend (Cloudflare Workers)
├── apps/desktop  — Electron desktop app (local Ollama + MCP)
└── apps/api      — Backend API service
```

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5.7 |
| UI | Tailwind CSS, shadcn/ui, Radix, Monaco Editor |
| State | Zustand, TanStack Query |
| Auth/DB | Supabase (PostgreSQL 15, Auth, Realtime, Storage) |
| AI | Gemini 2.0 Flash, Anthropic SDK, MCP SDK |
| Email | Resend + react-email templates |
| Billing | Stripe (Checkout, Portal, Webhooks) |
| Deploy | Cloudflare Workers via OpenNext |
| Monorepo | Turborepo |

## Project Structure

```
siza/
├── apps/
│   ├── web/                  # Next.js 16 frontend
│   │   ├── src/app/          # App Router pages & API routes
│   │   ├── src/components/   # shadcn/ui components
│   │   ├── src/lib/          # Auth, Stripe, usage, features
│   │   └── e2e/              # Playwright E2E tests
│   ├── docs/                 # Fumadocs documentation site
│   ├── desktop/              # Electron desktop app
│   └── api/                  # Backend API service
├── packages/
│   ├── ui/                   # @siza/ui shared component library
│   └── eslint-config/        # Shared ESLint config
├── supabase/                 # Migrations (10), seed data
└── turbo.json                # Turborepo config
```

## Development

```bash
npm run dev             # Start dev server (localhost:3000)
npm run build           # Build for production
npm run lint            # ESLint
npm test                # Unit tests (Jest)
npm run test:e2e        # E2E tests (Playwright)
npm run type-check      # TypeScript
```

## Pricing

Free for individuals, paid for scale and convenience.

| Tier | Price | Generations | Projects |
|------|-------|-------------|----------|
| Free | $0 forever | 10/month (BYOK unlimited) | 2 |
| Pro | $19/month | 500/month | Unlimited |
| Team | $49/month (5 seats) | 2,500/month | Unlimited |
| Enterprise | Custom | Unlimited | Unlimited |

## The Forge Space Ecosystem

Siza is part of [Forge Space](https://github.com/Forge-Space) — five open-source repos designed to work together:

| Repo | Purpose |
|------|---------|
| **[siza](https://github.com/Forge-Space/siza)** | AI workspace (this repo) |
| **[siza-mcp](https://github.com/Forge-Space/ui-mcp)** | 12 MCP tools for UI generation |
| **[mcp-gateway](https://github.com/Forge-Space/mcp-gateway)** | AI-powered tool routing hub |
| **[forge-patterns](https://github.com/Forge-Space/core)** | Shared standards and MCP context server |
| **[branding-mcp](https://github.com/Forge-Space/branding-mcp)** | Brand identity generation |

## Deployment

### Cloudflare Workers (Production)

Automated via GitHub Actions on push to `main` (production) or `dev` (preview):

1. Set GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`
2. Set GitHub Variable: `CLOUDFLARE_DEPLOY_ENABLED=true`
3. Deployment runs automatically via `deploy-web.yml`

### Free Tier Architecture

| Service | Free Tier |
|---------|-----------|
| Cloudflare Workers | Unlimited bandwidth |
| Supabase | 50K MAU, 500MB DB, 1GB storage |
| Gemini 2.0 Flash | 60 RPM |
| GitHub Actions | 2,000 min/month |

## Documentation

Full documentation is available in the `apps/docs/` directory, built with [Fumadocs](https://fumadocs.vercel.app/):

```bash
npm run dev --workspace=apps/docs  # localhost:3001
```

Covers: quick start, self-hosting, configuration, MCP integration, API reference, and architecture.

## Community

- [**GitHub Discussions**](https://github.com/Forge-Space/siza/discussions) — questions, ideas, show & tell
- [**Issue Templates**](https://github.com/Forge-Space/siza/issues/new/choose) — bug reports, feature requests, security reports
- [**Contributing Guide**](CONTRIBUTING.md) — how to contribute code and docs

## Contributing

We welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repo
2. Create a feature branch from `main`
3. Make changes, run `npm run lint && npm test && npm run build`
4. Open a PR against `main`

## License

MIT — see [LICENSE](LICENSE).

---

Part of the [Forge Space](https://github.com/Forge-Space) ecosystem. Built by [Lucas Santana](https://github.com/LucasSantana-Dev).
