# UIForge Web App Project

**When to apply:** Always active — project structure, stack, and conventions.

## Stack

- **Type**: Zero-cost Next.js 15 web application with Supabase backend
- **Frontend**: Next.js 15 App Router + React 18 + TypeScript 5.7
- **Backend**: Supabase (Auth + PostgreSQL + Storage + Realtime)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State**: Zustand 5.0 (global) + TanStack Query 5.62 (server state)
- **Testing**: Jest 29.7 (unit) + Playwright 1.48 (E2E)
- **Monorepo**: Turborepo 2.3
- **Deployment**: Cloudflare Pages (static export)

## Project layout

```txt
apps/
  web/                            # Next.js 15 App Router application
    src/
      app/                        # App Router pages and layouts
        (auth)/                   # Auth pages (signin, signup)
        (dashboard)/              # Protected dashboard routes
        api/                      # API route handlers
        layout.tsx                # Root layout
        page.tsx                  # Home page
      components/                 # React components
        ui/                       # shadcn/ui components
      hooks/                      # Custom React hooks
      lib/                        # Utilities and helpers
        supabase/                 # Supabase client factories
      stores/                     # Zustand stores
      types/                      # TypeScript types
      middleware.ts               # Next.js middleware (auth)
    e2e/                          # Playwright E2E tests
      fixtures.ts                 # Test fixtures
      auth.spec.ts                # Auth flow tests
    public/                       # Static assets
    next.config.js                # Next.js configuration
    tailwind.config.ts            # Tailwind configuration
    playwright.config.ts          # Playwright configuration
    jest.config.ts                # Jest configuration
packages/
  eslint-config/                  # Shared ESLint configuration
  shared/                         # Shared utilities (future)
supabase/
  migrations/                     # Database migrations
  config.toml                     # Supabase configuration
```

## Feature areas

| Area | Description |
| --- | --- |
| **Auth** | Supabase Auth with email/password and OAuth (Google, GitHub) |
| **Projects** | CRUD operations for user projects with RLS |
| **Generation** | AI-powered UI component generation with Monaco editor |
| **Storage** | Supabase Storage for project files and generated code |
| **Preview** | Live preview of generated components in sandboxed iframe |

## Commands

- **Dev**: `npm run dev` - Start Next.js dev server (localhost:3000)
- **Build**: `npm run build` - Production build
- **Test**: `npm run test` - Run Jest unit tests
- **Test E2E**: `npm run test:e2e` - Run Playwright E2E tests
- **Test E2E UI**: `npm run test:e2e:ui` - Playwright UI mode
- **Lint**: `npm run lint` - Lint all code
- **Lint Fix**: `npm run lint:fix` - Fix linting errors
- **Format**: `npm run format` - Format all code with Prettier
- **Type Check**: `npm run type-check` - TypeScript type checking
- **Deps Check**: `npm run deps:check` - Check for outdated dependencies
- **Deps Update**: `npm run deps:update` - Update dependencies

## Conventions

- **Zero-cost mandate**: All services must operate within free-tier limits forever
- **TypeScript strict mode**: No `any` types, proper typing required
- **Server vs Client Components**: Mark Client Components with `'use client'` directive
- **Import aliases**: Use `@/` for src imports (e.g., `import { Button } from '@/components/ui/button'`)
- **Commit messages**: Follow conventional commits format (enforced by commitlint)
- **Pre-commit hooks**: Lint-staged runs on every commit, blocking bad code
- **Testing**: 80% unit test coverage, 100% E2E coverage for critical flows
- **Performance**: Meet Core Web Vitals targets (LCP <2.5s, FID <100ms, CLS <0.1)
- **Accessibility**: WCAG 2.1 AA compliance required
- **Documentation**: Update `plan.MD` for architectural changes, `CHANGELOG.md` for releases
- **Supabase patterns**: Use `@supabase/ssr` for SSR auth, implement RLS for all tables
- **State management**: Zustand for global state, TanStack Query for server state
- **Error handling**: Use error boundaries, graceful degradation, user-friendly messages
