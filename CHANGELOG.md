# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.2] - 2026-02-25

### Added

- **create-siza-app CLI** (`packages/create-siza-app`): `npx create-siza-app` scaffolding tool (#105)
- **Docs page redesign**: Redesigned documentation page with consistent design system, consolidated /landing route (#108)

### Fixed

- **Desktop MCP connection** (#111): LOG_LEVEL `silent` → `error` (siza-gen Zod rejects silent), tool name kebab→snake_case, callTool schema args matched to MCP server
- **Desktop packaging**: All deps moved to devDependencies for electron-builder (#103), node_modules excluded (#101), auto-publish disabled (#106), 512x512 app icon (#107), package metadata added (#109, #110)
- **Admin deploy workflow**: Missing WASM stub and _redirects removal (#104)

## [0.8.1] - 2026-02-25

### Added

- **Shared UI package** (`packages/ui`): Extracted 19 shadcn components, CodeEditor, LivePreview, toast system, and `cn()` utility into `@siza/ui` workspace package
- **Desktop app** (`apps/desktop`): Electron + Vite + React skeleton with MCP client integration
  - Main process: BrowserWindow, contextBridge preload, type-safe IPC handlers
  - MCP server spawn via `StdioClientTransport` connecting to siza-mcp
  - Renderer: Generate, Projects, Settings pages reusing `@siza/ui` components
  - Ollama integration: connection check, model listing, setup wizard
  - Native menu bar with Generate shortcuts (Cmd+G, Cmd+Shift+G)
  - System tray with minimize/restore and quick-generate actions
  - FileTree component with file-type icons and expandable directories
  - RecentProjects with persisted history via electron-store
  - Auto-updater checking GitHub Releases every 4 hours
  - 4 Vitest test suites: MCP server, IPC channels, file system, types
- **Desktop CI** (`.github/workflows/desktop-release.yml`): Cross-platform matrix build (macOS, Windows, Linux) triggered by `desktop-v*` tags

- **Stripe E2E tests**: Checkout flow, webhook processing, DB sync validation (#95)
- **Roadmap Phase 1 completion**: All 11 features marked as done in roadmap UI (#97)

### Changed

- `apps/web` UI components now re-export from `@siza/ui` (zero breaking changes, all tests pass)
- `apps/web/tailwind.config.ts` includes `packages/ui` in content paths
- Electron bumped to v40.6.1 (#96)

### Fixed

- ESLint configs for `@siza/ui` and `@siza/desktop` (flat config with React/TS rules)
- 18 lint errors: unused imports, React hooks violations, unescaped entities
- Vite build: set `root: src/renderer` with absolute electron entry paths
- Path traversal: `relative()` check instead of `startsWith()` in file IPC handlers
- Component name sanitization in file save (allowlist: `[a-zA-Z0-9_-]`)
- Navigation security: `setWindowOpenHandler` + `will-navigate` guards
- Auto-updater initialized in packaged builds
- `electron-store` singleton pattern (avoid race conditions)
- CI Build/Test exclude desktop app (`--filter=!@siza/desktop`) — Rollup native binaries fail on Linux (#98)

---

## [0.8.0] - 2026-02-25

### Added
- **Multi-LLM Generation**: Select between Google Gemini, OpenAI, and Anthropic for component generation via BYOK keys
- **Generation History Browser**: Browse, filter, and reuse past generations across all projects with pagination
- **Template Library Polish**: Debounced search, chip-style category filters, client-side pagination, loading skeletons

### Changed
- ENABLE_MULTI_LLM feature flag enabled by default
- GeneratorForm now shows provider/model selector with API key status per provider
- Template page uses memoized filtering and pagination (12 per page)
- /api/generate route supports provider and model parameters

### Infrastructure
- MCP Gateway client (`lib/mcp/client.ts`) for AI generation routing (behind `ENABLE_MCP_GATEWAY` flag, disabled by default)

## [0.7.0] — 2026-02-25

### Added

- **Sentry server-side**: Lightweight Envelope API reporter for Cloudflare Workers (zero deps, ~100 lines)
- **Sentry middleware integration**: `captureServerError` in all 4 API middleware handlers (`withAuth`, `withRateLimit`, `withValidation`, `withErrorHandling`)
- **Sentry critical routes**: `/api/generate` (stream + outer catch) and `/api/components` error paths
- **Generation quota UI**: UpgradePrompt shown proactively when quota exceeded + on 429 error
- **Usage counter**: "X / Y generations this month" display in GeneratorForm with "Nearing limit" warning at 80%
- **E2E settings tests**: 7 tests covering tabs, AI Keys, GitHub, security info, preference toggles
- **E2E password reset tests**: 5 tests for forgot-password form, validation, navigation
- **E2E marketing tests**: 5 tests for about page, roadmap phases, pricing plans
- **IndexedDB storage tests**: 19 tests using fake-indexeddb (was manual mock, 26 tests skipped)
- **AI keys store tests**: 13 tests with corrected API expectations
- **AIKeyManager component tests**: 8 tests matching actual component behavior
- **ComponentGenerator tests**: 8 tests for sub-component delegation pattern
- **Quota handling tests**: 2 tests for 429 response and rate limit error in useGeneration hook
- Docs: Rose Pine Moon syntax highlighting for all code blocks
- Docs: Redesigned homepage with quick links, tech stack, ecosystem diagram
- Docs: Components showcase page with categorized UI patterns
- Docs: layout.config.tsx with Siza nav branding and external links
- Homepage: 3 missing CSS keyframes (mesh-rotate, particle-drift, cursor-blink)
- Roadmap: Interactive phase cards with progress bars, filters, expand/collapse
- Roadmap: Phase navigator dots and status filter with counts
- FadeIn: prefers-reduced-motion support

### Fixed

- **IndexedDB storage bug**: `setUserPreferences` used out-of-line key with keyPath store — fixed to include id in object
- **Generation error parsing**: API returns `{ error: string }` but client expected `{ error: { message } }` — quota errors now properly displayed
- **Generate button**: Disabled when quota exhausted (was only disabled during generation)

### Changed

- **Test count**: 299 tests passing (was 245), 25 suites (was 21), 4 skipped (was 11)
- **E2E specs**: 9 spec files (was 6), ~45% route coverage (was 28%)
- Social links: Twitter to LinkedIn across LandingFooter, landing page, docs page
- Homepage: Reduced particle count 20 to 8, throttled scroll listener
- Homepage: Removed force-dynamic (Next.js auto-detects dynamic via cookie access)

### Removed

- 3 redundant test files: `byok-storage.test.ts`, `ai-keys.test.ts` (placeholder), `auth-callback.test.ts` (placeholder)
- `export const dynamic = 'force-dynamic'` from homepage

---

## [0.6.0] — 2026-02-25

### Added

- **Sentry error tracking**: Client-side + edge middleware integration via `@sentry/nextjs` (server-side disabled for Cloudflare Workers compatibility)
- **Sentry error boundaries**: `error.tsx` and `global-error.tsx` now capture exceptions to Sentry
- **Sentry configuration files**: `instrumentation-client.ts`, `sentry.edge.config.ts`, `instrumentation.ts`
- **E2E billing tests**: 19 Playwright tests covering pricing page, checkout redirect, webhook API, subscribed user billing, and auth guards
- **Stripe test fixtures**: `e2e/helpers/stripe.ts` with `seedSubscription`, `seedUsageTracking`, `cleanupTestBilling`, `generateStripeWebhookSignature`
- **AI keys manager tests**: 29 tests unskipped for BYOK key management service
- **Generation hook tests**: 13 tests unskipped for component generation React hook
- **IndexedDB polyfill**: `fake-indexeddb` for Jest test environment
- **Sentry env vars**: `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT`, `NEXT_PUBLIC_SENTRY_RELEASE` in `.env.example`

### Changed

- **Feature flags**: `ENABLE_CENTRALIZED_FEATURE_FLAGS` set to `true` by default (DB-backed dynamic flags with 30s polling)
- **Test count**: 245 tests passing (was 203), 21 suites (was 19)
- **next.config.js**: Wrapped with `withSentryConfig()` (conditional on DSN availability)
- **MULTI_LLM and QUALITY_GATES**: Documented as deferred (no code paths gated)

### Removed

- **Stale env vars**: Removed `VITE_ENABLE_BYOK` and `VITE_ENABLE_GEMINI_FALLBACK` from `.env.example` (Vite leftovers)

---


## [0.5.0] — 2026-02-25

### Added

- **GitHub Releases**: v0.3.0 and v0.4.0 releases published with full notes
- **Encryption tests**: 26 BYOK security tests unskipped and passing (AES-256, key validation, expiration)
- **Auth page tests**: 18 new tests for SignIn/SignUp pages matching current Supabase auth UI
- **Google Analytics env var**: `NEXT_PUBLIC_GA_TRACKING_ID` in `.env.example`
- **Dev environment**: Cloudflare Workers `siza-web-dev` auto-deploys on `dev` branch push
- **CI workflow consolidation**: Merged `feature-branch.yml` into `ci.yml` with `feat/*` and `feature/*` triggers
- **Production Supabase config**: Real project_id, OAuth redirect URIs for prod and dev environments

### Changed

- **Email auth URLs**: `NEXT_PUBLIC_APP_URL` → `NEXT_PUBLIC_BASE_URL` for consistency with deploy secrets
- **Messaging**: "zero-cost" → "generous free tier" across landing, about, and pricing pages
- **Meta descriptions**: Updated to "The open full-stack AI workspace" branding
- **Deploy workflow**: Dev branch deploys with `--env dev` to separate `siza-web-dev` worker

### Fixed

- **Prettier violations**: Fixed formatting in `SignInPage.test.tsx` and `SignUpPage.test.tsx` that were blocking main CI

### Removed

- **`feature-branch.yml`**: Redundant workflow (triggered on `feature/*` but repo uses `feat/*`), consolidated into `ci.yml`
- **PR #65**: Closed stale `feat/v0.5.0-production` PR with merge conflicts

### Changed

- **Coverage thresholds raised**: branches 30→60%, functions 30→65%, lines 40→75%, statements 40→75%
- **Actual coverage**: statements 81%, branches 74%, functions 84%, lines 83%
- **Test count**: 203 tests passing (was 159), 19 suites (was 16)

### Fixed

- **Analytics provider**: Replace 4 hardcoded `G-XXXXXXXXXX` placeholders with `NEXT_PUBLIC_GA_TRACKING_ID` env var
- **Analytics guard**: Skip GA script injection when tracking ID is not configured (no dead code in production)

### Removed

- 3 stale remote branches: `fix/stripe-bugs`, `fix/supabase-migrations`, `chore/docs-cleanup`
- Issue #8 (Label Templates) closed — all labels already created

---

## [0.4.0] — 2026-02-25

### Added

- **Documentation site**: Fumadocs-powered docs at `apps/docs/` with 12 content pages (Getting Started, Guides, API Reference, Ecosystem)
- **Docs deployment**: Cloudflare Workers deploy workflow for documentation
- **Community infrastructure**: GitHub Discussions, homepage URL, updated repo descriptions
- **Visual overhaul**: Dark-only Siza brand identity across 37 files
- **SizaBackground component**: Ambient dot grid + brand glow for marketing/auth pages
- **Skip-to-content link**: Accessibility improvement in root layout
- **Stripe production activation**: Webhook endpoint, test-mode products (Pro $19/mo, Team $49/mo), 13 GitHub Secrets, Cloudflare Workers runtime secrets
- **Deploy workflow**: Stripe build-time env vars (publishable key, billing + usage feature flags)
- **CI status badge**: README now shows CI workflow status
- **GitHub Discussions**: Enabled on siza repository for community engagement
- **Stripe webhook tests**: 19 tests for checkout, subscription update/delete, event deduplication, plan detection

### Changed

- **UIForge → Siza rebrand**: Logo, sidebar, nav, all pages updated to Siza identity
- **Design tokens**: All 265+ hardcoded gray/blue/white classes replaced with surface-*/brand-*/text-* tokens
- **Logo optimization**: Replaced 1.8MB anvil-logo.svg with 2.5KB siza-icon.png
- **Sonner toast**: Hardcoded dark theme, removed unused next-themes dependency
- **TopBar**: Removed theme toggle (dark-only app)
- **Sidebar**: Brand active states, billing navigation item added
- **Ecosystem repo descriptions**: All 5 repos updated with consistent Siza-aligned descriptions
- **Repo topics**: 18 relevant tags including mcp, model-context-protocol, ai-workspace, byok

### Fixed

- **Supabase migration**: Fixed gin_trgm_ops_ops typo in shared_logging migration
- **pgvector indexes**: Removed IVFFlat indexes exceeding 2000-dim limit in rag_embeddings migration
- **Jest coverage**: Updated collectCoverageFrom scope and thresholds, excluded integration tests
- **Docs CI**: ESLint flat config with TS parser, fumadocs-mdx postinstall for type generation, .source/ excluded from prettier

### Removed

- `anvil-logo.svg` (1.8MB) and `text-logo.svg` (1.8MB) — replaced with Siza brand assets
- `next-themes` imports from TopBar and Sonner (dark-only, no toggling)
- Theme toggle button from TopBar

---

## [0.3.0] — 2026-02-24

### Added

- Strategic positioning: "The open full-stack AI workspace"
- Team pricing tier ($49/month, 5 seats, 2,500 generations)
- CONTRIBUTING.md with development workflow and code standards
- CHANGELOG.md for tracking changes
- Landing page rewrite with ecosystem identity and differentiation
- Ecosystem section on landing page linking all 5 Forge Space repos
- Navigation links to About, Pricing, and Roadmap in header/footer
- **Template Library API**: `GET/POST /api/templates` and `GET/DELETE /api/templates/:id` — browse, create, and manage reusable component templates backed by Supabase
- **Template Gallery connected to DB**: templates page now fetches from API instead of hardcoded mock data, with loading/error states
- **Save as Template**: new dialog in generator to save generated components as reusable templates in the database
- **20 official templates**: seeded auth (login, signup, password-reset), navigation (navbar, sidebar), forms (contact, multi-step), e-commerce (product card, pricing, cart), landing (hero, card grid), feedback (toast, empty state, loading skeleton), dashboard (data table, stats cards), admin (breadcrumbs)
- **Use Template flow**: clicking "Use Template" now loads actual template code from DB into the editor and preview
- **GitHub App integration enabled**: `ENABLE_GITHUB_APP` feature flag set to `true`, push-to-GitHub button gated on flag
- **Vue 3 live preview**: components with `framework: 'vue'` now render in iframe using Vue 3 global build with Tailwind CSS
- **Responsive viewport toggle**: mobile (375px), tablet (768px), and desktop viewport buttons in live preview toolbar
- **Improved error display**: runtime errors in preview iframe show styled error messages with source line info

### Changed

- Landing page tagline: "Generate. Integrate. Ship."
- Pricing page: 4-tier grid (Free, Pro, Team, Enterprise)
- Pricing headline: "Free for individuals, paid for scale"
- About page: updated principles to match strategic positioning
- About page: added branding-mcp to ecosystem section
- Roadmap: updated phases to reflect strategic plan (Foundation, Community, Scale)
- Roadmap: fixed feedback link (Forge-Space/UI -> Forge-Space/siza)
- README.md: complete rewrite with differentiation table, ecosystem map, pricing
- Plans config: added seats field to plan limits, added Team tier
- Template validation schema (`lib/api/validation/templates.ts`) with Zod for create/query operations
- Live preview iframe uses `window.onerror` handler for better error catching across React and Vue

## [0.3.0] - 2026-02-24

### Added

- Cloudflare Workers deployment via OpenNext
- Stripe billing integration (Free/Pro/Enterprise tiers)
- Feature flags system (17 flags, admin API, audit log)
- Resend auth emails (verification, welcome, password reset)
- Usage tracking and quota enforcement
- Health check endpoint (GET /api/health)

### Changed

- CI workflows cleanup: deleted 3 broken scaffolds, standardized Node 22
- README updated for Next.js 16, React 19, Workers deployment
