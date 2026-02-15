# UIForge Web App Project Context

## Project Overview

UIForge Web App is a **zero-cost Next.js 15 application** for AI-powered UI component generation. Built with Supabase backend and deployed on Cloudflare Pages.

**Core purpose**: Enable users to generate, preview, and manage React/Next.js UI components through an AI-powered interface with Monaco editor integration, all within free-tier constraints.

## Architecture

- **Frontend**: Next.js 15 App Router + React 18 + TypeScript 5.7
- **Backend**: Supabase (Auth + PostgreSQL + Storage + Realtime + Edge Functions)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **State Management**: Zustand 5.0 (global state) + TanStack Query 5.62 (server state)
- **Code Editor**: Monaco Editor (VS Code editor component)
- **Testing**: Jest 29.7 (unit) + React Testing Library + Playwright 1.48 (E2E)
- **Build Tool**: Turborepo 2.3 (monorepo orchestration)
- **Deployment**: Cloudflare Pages (static export)
- **Image gen**: `satori` (JSX → SVG) + `@resvg/resvg-js` (SVG → PNG)
- **Design state**: In-memory `DesignContextStore` singleton, exposed as `application://current-styles` resource

## Key Technologies

1. **Next.js 15**: React framework with App Router for SSR/SSG
2. **TypeScript 5.7**: Strict typing throughout the codebase
3. **Supabase**: Complete backend-as-a-service
   - Auth: Email/password + OAuth (Google, GitHub)
   - Database: PostgreSQL with Row Level Security (RLS)
   - Storage: File storage for project assets
   - Realtime: WebSocket subscriptions
   - Edge Functions: Deno-based serverless functions
4. **Tailwind CSS**: Utility-first CSS framework
5. **shadcn/ui**: Accessible component library
6. **Zustand**: Lightweight state management
7. **TanStack Query**: Server state caching and synchronization
8. **Monaco Editor**: VS Code editor for code editing
9. **Jest + Playwright**: Testing infrastructure
10. **Turborepo**: Monorepo build system

## Feature Areas

### Authentication
- Email/password signup and signin
- OAuth with Google and GitHub
- Session management with Supabase Auth
- Protected routes via middleware

### Project Management
- CRUD operations for user projects
- Project metadata and settings
- Row Level Security (RLS) for data isolation

### Component Generation
- AI-powered component generation
- Monaco Editor for code editing
- Real-time preview in sandboxed iframe
- Support for React, Next.js, Tailwind CSS

### Storage & Assets
- Supabase Storage for project files
- Generated code persistence
- Asset management

## Supported Frameworks

- React + Tailwind + Shadcn/ui
- Next.js App Router + Tailwind + Shadcn/ui
- Vue 3 Composition API + Pinia
- Angular standalone components + Signals

## Key Directories

- `apps/web/` - Main Next.js application
  - `src/app/` - App Router pages and layouts
  - `src/components/` - React components
  - `src/lib/supabase/` - Supabase client factories
  - `src/stores/` - Zustand stores
  - `e2e/` - Playwright E2E tests
- `packages/eslint-config/` - Shared ESLint configuration
- `packages/shared/` - Shared utilities (future)
- `supabase/migrations/` - Database migrations

## Zero-Cost Constraints

- **Supabase Free Tier**: 50,000 MAU, 500MB database, 1GB storage, 2GB bandwidth
- **Cloudflare Pages**: Unlimited bandwidth, 500 builds/month
- **All tools**: Must use free tier or open source
- **Scaling strategy**: Optimize within free-tier limits, no paid services

## Development Commands

- `npm run dev` - Start Next.js dev server (localhost:3000)
- `npm run build` - Production build
- `npm run test` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run lint` - Lint all code
- `npm run format` - Format with Prettier
- `npm run type-check` - TypeScript type checking

## Relationship to mcp-gateway

- This is a separate repo with its own TS build pipeline
- Gateway consumes it as a Docker service via `gateways.txt`
- Gateway wraps stdio transport via `mcpgateway.translate` → SSE
- Integration is a separate PR on the mcp-gateway repo
