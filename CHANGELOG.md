# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.26.0] - 2026-03-01

### Added
- **Navigation shell overhaul**: Collapsible sidebar, command palette (Cmd+K), keyboard shortcuts, and tooltip navigation (#263)
- **Brand-guide theme wiring**: Forge Space theme dynamically sourced from @forgespace/brand-guide identity data (#269)
- **Tooltip component**: New @siza/ui Tooltip component built on Radix UI (#263)
- **DashboardShell**: New layout wrapper managing sidebar, topbar, and mobile navigation (#263)
- **Keyboard shortcuts hook**: `useKeyboardShortcuts` for global hotkey management (#263)
- **Page metadata hook**: `usePageMeta` for dynamic page titles and breadcrumbs (#263)

### Changed
- **Dependencies**: Upgraded Supabase SSR + Anthropic SDK to latest versions (#271)

### Fixed
- **ESLint flat config**: Added __mocks__ directory to ignores for Jest mock files (#269)
- **JSX autoFocus lint**: Fixed eslint-disable pattern for Turbopack-compatible JSX comments (#263)

## [0.25.0] - 2026-03-01

### Added
- **Skills system**: Prompt enrichment skills with parameter support, up to 3 per generation (#256, #257)
- **Platform metrics API**: BUILD/SHIP/VALIDATE tracking endpoint for platform analytics (#262)
- **GitHub PR tracking**: Automatic project version tracking via GitHub integration (#258)
- **Sentry error tracking**: Production error monitoring via Envelope API (#264)

### Changed
- **Generator form refactor**: Replaced tab layout with SizaAI card + BYOK provider grid for cleaner UX (#261)

### Fixed
- **E2E test reliability**: Migrated specs to fixtures pattern with Supabase admin API for deterministic tests (#260)

### Security
- **Vulnerability disclosure policy**: Added SECURITY.md with responsible disclosure process (#259)

## [0.24.0] - 2026-03-01

### Added
- **Siza AI smart routing**: Automatically selects optimal AI model based on prompt complexity (Claude for complex, Gemini Flash for simple/vision/free-tier)
- **BYOK provider grid**: Collapsible grid for users who want to use their own API keys with OpenAI, Anthropic, or Google
- **Routing visualization**: Generation history shows routing path with provider labels
- **Brand-guide integration**: Swap to Siza sub-brand fonts (Plus Jakarta Sans, DM Sans, IBM Plex Mono), semantic colors from brand-guide, 40+ hardcoded hex replaced with Tailwind tokens
- **Forge Space built-in theme**: Full theme with brandMeta (fonts, semantic colors, neutrals)
- **8 new E2E test files**: Comprehensive coverage for onboarding, auth, dashboard, templates, history, generation, error states, and responsive design
- **Database migration**: routed_provider and routing_reason columns for routing metadata

### Changed
- **Default provider**: Changed from google to siza for intelligent routing
- **Logo**: Optimized brand-guide SVG assets (monogram + wordmark)

### Fixed
- **CodeRabbit review items**: Siza provider validation and accessibility improvements
## [0.23.1] - 2026-03-01

### Fixed
- **Siza AI generate button blocked**: Excluded `siza` provider from BYOK key requirement — generate button was disabled for all users without a stored key
- **Accessibility**: Added `aria-pressed` to SizaAICard, `aria-expanded` to BYOKProviderGrid disclosure

## [0.23.0] - 2026-03-01

### Added
- **Tab-based generation form**: Split crowded left panel into 3 progressive-disclosure tabs (Prompt, Options, Design)
- **Sheet-based generation history**: Moved GenerationHistory into slide-over Sheet triggered from header

### Fixed
- **Generation history loading**: Records now include `project_id`, fixing "Failed to load history" when GenerationHistory queries by project
- **Usage counter refresh**: React Query cache invalidation on SSE complete event — usage counter updates immediately after generation
- **Dark theme form inputs**: Added `bg-surface-1 text-text-primary` to all native `<select>`, `<input>`, and `<textarea>` elements across 8 components

## [0.22.0] - 2026-03-01

### Changed
- **Landing page repositioning**: Reframe from UI generation to full-stack project generation platform
- **Hero**: "Generate production UI with AI" → "Vibe code the right way" with full-stack subheading
- **Stats bar**: Ecosystem-wide metrics (1,500+ tests, 502 snippets, 5 quality gates, 7 repos)
- **Capabilities**: Reframe 6 cards as architecture, security, quality, scaffolds, context-awareness, multi-provider
- **Code showcase**: Gateway config → full-stack scaffold tree with architecture layers
- **CTA**: "Start building with precision" → "Start building the right way"
- **Metadata**: Title, description, OG tags, keywords updated for full-stack positioning
- **Ecosystem section**: Add missing brand-guide repo card (7 of 7), update siza-mcp description

### Fixed
- **Ecosystem section**: brand-guide (7th repo) was missing from the repo cards

## [0.21.0] - 2026-03-01

### Added
- **Onboarding wizard**: 4-step post-signup wizard (Welcome → Create Project → Generate Component → Done) guiding new users through first project creation and AI generation
- **`ENABLE_ONBOARDING` feature flag**: Gated behind flag (default `false`), enable with `NEXT_PUBLIC_ENABLE_ONBOARDING=true`
- **`onboarding_completed_at` profile column**: Tracks when users completed onboarding, prevents re-entry
- **`/api/onboarding/complete` endpoint**: Marks onboarding as completed in the user's profile
- **OG image**: Branded 1200x630 social sharing image for link previews
- **Twitter card metadata**: `summary_large_image` card with OG image for Twitter/Slack/LinkedIn previews
- **OpenGraph metadata**: Complete `metadataBase`, `siteName`, `canonical`, and image metadata in layout

### Changed
- **Stats bar**: Replace misleading repo counts (4 Core + 6 Open) with accurate stats (7 repos, 4 frameworks, 5 quality gates, 608+ tests)
- **Hero copy**: Sharpen headline from abstract "enables building" to concrete "Generate production UI with AI"
- **Ecosystem section**: "Six repos" → "Seven repos" (brand-guide added)
- **Footer links**: Rename "Blog" to "Community" (honest label for GitHub Discussions), point "Changelog" to GitHub Releases
- **Docs CSS**: Modernize CSS variables from rgb() triplets to hex values with color-mix() for transparency
- **Docs MDX**: Replace custom CodeBlock/Callout components with Fumadocs defaults, switch code theme to github-dark

### Fixed
- **E2E tests**: Update landing page tests to match new stats labels, hero text, and ecosystem count

## [0.20.0] - 2026-03-01

### Added
- **Docs typography**: Outfit font for headings, gradient h1, bordered h2, accent-bar h3
- **Docs code blocks**: Enhanced code blocks with language label, copy-to-clipboard button, glassmorphism header
- **Docs callout component**: Callout with info/warning/tip/danger variants for MDX content
- **Docs content polish**: Styled blockquotes, lists, links (underline-on-hover), horizontal rules, images
- **Docs sidebar/nav**: Gradient active indicator, scroll-spy dot, nav gradient line, custom scrollbar

### Fixed
- **Feature flag defaults**: Align `.env.example` with code defaults — enable quality gates, multi-LLM, conversation mode, and design analysis for new installs

## [0.19.0] - 2026-03-01

### Added
- **Cost controls**: Daily fallback limiter (50 requests/day) + downgrade to Haiku model for Anthropic fallback
- **create-siza-app templates**: Complete framework config generation for React, Vue, Svelte, Next.js
- **Design analysis panel**: Wire design analysis panel to generator form
- **Conversation refinement**: Wire refinement data flow to return generation results with IDs

### Changed
- Anthropic fallback model changed from claude-sonnet-4 to claude-haiku-4.5 for cost efficiency

## [0.18.0] - 2026-03-01

### Added
- **AI generation v2 wiring**: Conversation mode, generation history panel, design analysis integration
- **create-siza-app framework configs**: Framework-specific config files and entry points
- **Supabase SMTP via Resend**: Branded email templates for auth flows

### Security
- **Encryption hardening**: PBKDF2 key derivation (600K iterations) with explicit AES IV
- **CodeQL fixes**: Logger sanitization, iterative HTML sanitizer, PBKDF2 API key fingerprinting

### Fixed
- **Docs site**: Navigation links, CSS overhaul, content updates
- **E2E tests**: Billing page strict mode selectors, about page content
- **Prettier**: Normalize package.json formatting

## [0.17.0] - 2026-03-01

### Added
- **Anthropic server-side fallback**: Automatic failover to Anthropic when primary provider (Gemini) hits quota or rate-limit errors
  - Quota error detection with pattern matching for 429 and RESOURCE_EXHAUSTED responses
  - New `fallback` SSE event type for client-side awareness of provider switch
  - Tracks actual provider used in DB `generations.ai_provider` column
  - Uses `ANTHROPIC_API_KEY` server-side env var (no user key needed)

### Fixed
- **Supabase database advisor warnings**: RLS initplan optimization (`(select auth.uid())`), permissive policy consolidation, `function_search_path_mutable`, foreign key indexes
- **E2E tests**: Landing page ecosystem count updated (five to six repos), billing page strict mode selectors
- **Docs URL**: Footer link updated from siza.dev to forgespace.co
- **Prettier formatting**: Normalize package.json array formatting across monorepo

## [0.16.0] - 2026-02-28

### Added
- **Brand identity import**: Import brand assets (colors, fonts, spacing) from branding-mcp into theme system
  - `parseBrandIdentity()` converts brand JSON to SizaTheme format
  - `importBrand()` action on theme store for one-click brand application
  - BrandMeta type with semantic colors, neutrals, heading/body fonts
  - Typography, spacing, and border-radius auto-mapping from brand tokens
  - 10 unit tests covering parsing, edge cases, and theme creation
- **Project creation form**: Wire up form submission with dashboard redirect after creation

### Fixed
- **15 CodeQL security alerts**: Replace `Math.random()` with `crypto.randomUUID()`, entity-encode HTML, fix regex patterns, add `rel="noopener noreferrer"`
- **Dashboard redirect**: Proper navigation to new project after creation

### Security
- Replace `Math.random()` ID generation with `crypto.randomUUID()` across 8 files
- Entity encoding for user-provided HTML content in sanitize and wireframe services
- Fix ReDoS-prone regex pattern in quality gates
- Sanitize inline event handlers in LivePreview component

## [0.15.0] - 2026-02-28

### Added
- **Service layer**: Extract business logic from API route handlers into dedicated service files (conversation, project, component, generation)
- **Repository layer**: Thin Supabase data access layer (base, project, component, generation, feedback repos) with pagination and error handling
- **Security headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy added to all responses via middleware
- **CORS allowlist**: Origin validation replacing wildcard `*` — forgespace.co subdomains + localhost in dev
- **XSS sanitization**: Zod `.transform(sanitizeText)` on all user text fields (projects, components)
- **Request tracing**: X-Request-ID header (crypto.randomUUID) on every response
- **Route-based rate limits**: Per-endpoint rate limit configuration (15/min generate, 60/min CRUD, 10/min auth)
- **Error boundaries**: Generic ErrorBoundary and RouteErrorBoundary components
- **TTLCache utility**: Generic in-memory cache with LRU eviction for server-side caching
- **29 service layer tests**: Full unit test coverage for conversation, project, and component services

### Changed
- **GeneratorForm refactored**: 578 → 313 lines via ImageUpload, ProviderSelector, QuotaGuard extraction
- **Structured error logging**: console.error replaced with captureServerError (Sentry) across all API routes
- **Templates routes**: Fixed variable name mismatches in error handlers (dbError/deleteError)
- **.env.example**: Completed with all missing environment variables

## [0.14.0] - 2026-02-28

### Added
- **@siza/ui component extraction**: Pure UI versions of QualityPanel, GenerationProgress, and NavigationSidebar for cross-platform reuse
  - `NavigationSidebar` with headless `renderLink` pattern for platform-agnostic routing
  - `GenerationProgress` with configurable multi-step indicators
  - `QualityPanel` with SVG score gauge and expandable gate details
  - Shared `GenerationEvent`, `QualityReport`, `NavigationItem` types
- **Desktop NavigationSidebar**: Desktop app uses shared NavigationSidebar from @siza/ui with labels and icons
- **Responsive generator layout**: Mobile-first `flex-col lg:flex-row` with Code/Preview tab switcher on small screens
- **Focus-visible styles**: Global focus ring using brand color for keyboard navigation
- **ARIA attributes**: `aria-describedby`, `aria-invalid`, `role="alert"` on generator form fields and errors
- **Quality Gates**: Enable quality scoring for generated components with inline score display
  - 5 gates: security (XSS/injection), lint, type-check, accessibility, responsive
  - Weighted scoring (0-100%) shown inline on QualityBadge
  - Expandable QualityPanel with per-gate pass/fail details
  - Quality check step in generation progress indicator
  - 34 unit tests covering all gate functions
- **Generator UX Polish**: Loading skeletons, responsive layout, focus-visible states, aria attributes
- **Test coverage boost**: 63 new unit tests across 4 new test suites
  - Template validation, auth emails, usage limits
- **Conversation mode**: Multi-turn AI generation — iteratively refine components with natural language ("make it darker", "add hover states")
  - Max 10 conversation turns with depth tracking via `parent_generation_id`
  - Provider support: Gemini (startChat), OpenAI, Anthropic conversation messages
  - RefinementInput component with turn counter and keyboard shortcuts
- **Smart design-to-code**: Upload screenshots/wireframes for automatic design analysis
  - `/api/generate/analyze` endpoint wrapping Gemini vision API
  - DesignAnalysisPanel: color swatches, component detection, suggested prompts
  - Auto-fill design context from analysis results
- **Generation history panel**: Browse, re-use, and fork past generations
  - Sheet drawer with quality score badges and conversation chain indicators
  - Load, Fork, Copy, Delete actions per generation
- **New feature flags**: `ENABLE_CONVERSATION_MODE`, `ENABLE_DESIGN_ANALYSIS`
- **Database migration**: `parent_generation_id` column for conversation threading

### Changed
- **Docs landing page**: Animations (hero glow, fade-up, shimmer, pulse-ring), glassmorphism cards, gradient text, staggered entrance, `prefers-reduced-motion` support
- **Design system tokens**: `--transition-fast/default/smooth`, `--radius-card`, `--border-subtle/hover`, `--ease-siza` in web globals
- **Card hover states**: Consistent `hover:-translate-y-0.5` lift, border glow, and shadow transition across all cards
- **Button states**: `active:scale-[0.98]`, enhanced hover shadows, consistent disabled opacity
- **Sidebar active indicator**: Left border accent on active nav items in both desktop and mobile nav
- **Landing hero CTA**: Shimmer effect, hover lift with purple shadow, arrow indicator
- **Capability cards**: Per-capability accent colors (purple/blue/indigo/emerald/amber/rose), icon scale on hover
- **Ecosystem section**: Animated SVG connector lines between nodes
- **Landing nav**: Transparent-to-blur background on scroll
- **Generator loading**: Skeleton loading state with `animate-pulse` replacing text-based loader
- **Generation progress**: 4-step multi-phase indicators (Analyzing → Generating → Quality check → Complete)
- **Quality panel**: SVG circular score gauge, expandable issue details with chevron toggle
- **Mobile nav**: Consistent left-border active indicator matching desktop sidebar
- **Desktop generate page**: Branded header with gradient and SparklesIcon

- **Domain migration**: All URLs migrated to `forgespace.co` subdomains
  - Production: `siza.forgespace.co`
  - Documentation: `docs.forgespace.co`
  - Dev environment: `dev.forgespace.co`
  - API: `api.forgespace.co`
  - Email: `noreply@forgespace.co` (transactional), `support@forgespace.co` (reply-to)

## [0.13.1] - 2026-02-28

### Added
- **Test coverage boost**: 63 new unit tests across 4 new suites (#138)
  - Quality gates validation, template validation, auth email helpers, usage limits
- **HTTPS dev server**: `npm run dev:https` with mkcert certificates for local development (#143)

### Changed
- **Domain migration**: All URLs migrated to `forgespace.co` subdomains (#141, #142)
  - Production: `siza.forgespace.co`, Docs: `docs.forgespace.co`, Dev: `dev.forgespace.co`
  - Support email and Cloudflare custom domain configuration
- **Repo cleanup**: Improved .gitignore, removed stale docs, relocated test fixtures (#140)


## [0.13.0] - 2026-02-28

### Changed
- **Custom domain**: Migrate from `siza-web.uiforge.workers.dev` to `siza.dev`
  - Updated Supabase auth redirect URLs
  - Updated Cloudflare Workers custom domain routing
  - Updated documentation references

## [0.12.1] - 2026-02-28

### Fixed
- Force dark theme on docs site to prevent invisible text on light-mode systems
- Add navigation bar to docs landing page via Fumadocs HomeLayout wrapper

## [0.12.0] - 2026-02-28

### Added
- **LivePreview Library Shims**: Generated code using lucide-react icons and shadcn/ui components now renders correctly in the preview iframe
  - `cn()` utility for Tailwind class joining
  - 25+ lucide-react icon SVG shims with Proxy fallback for unknown icons
  - 30+ shadcn/ui component stubs (Button, Card, Badge, Input, Label, Alert, Dialog, Table, Tabs, Select, etc.)
  - shadcn dark theme CSS custom properties and Tailwind color config
  - Zero server bundle cost — all shims are inline template strings in the iframe HTML

### Fixed
- Health endpoint now returns build-time injected version instead of reading package.json at runtime
- Docs site layout and component structure fixes

## [desktop-v0.2.0] - 2026-02-27

### Added
- **Ollama Local Generation**: Generate UI components using local LLM models via Ollama
  - `OllamaClient` HTTP client with connection check and chat API support
  - System prompts tuned for React, Vue, Angular, Svelte, HTML component generation
  - Generate page dual-source toggle: MCP Registry (cloud/offline) vs Ollama (local LLM)
  - Model selector dropdown showing installed Ollama models with sizes
  - Generation timing badge showing latency
  - Automatic code fence stripping from LLM output
  - Graceful fallback when Ollama not running
- **Tests**: 12 new unit tests for Ollama client and prompt builder (22 total)

## [0.11.0] - 2026-02-27

### Added
- **Quality Gates UI**: Visual quality feedback for generated code
  - SSE `quality` event wired to frontend with `QualityReport` state in `useGeneration` hook
  - `QualityBadge` component: pass/warn/fail indicator in bottom bar after generation
  - `QualityPanel` component: expandable gate results with per-gate status and issue details
  - Quality score badge (Good/Fair/Poor) in generation history cards
  - Accessibility gate: checks `<img>` alt, `<button>` content, `<input>` labels, positive tabIndex
  - Responsive gate: warns when layout classes lack responsive breakpoints
  - Weighted quality score (0-1): security=3, a11y=2, lint=1, type-check=1, responsive=0.5
  - `quality_score` persisted to Supabase `generations` table on each generation

### Security
- Fix minimatch ReDoS vulnerability via `npm audit fix` (GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74)
- Add CodeQL security analysis workflow (push/PR/weekly schedule)

## [0.10.0] - 2026-02-26

### Added
- **Prompt Autocomplete**: Suggestion dropdown for generation prompt with history + template search
  - `/api/suggestions` endpoint queries user generations and templates with prefix matching
  - `useSuggestions` hook with 300ms debounce and request cancellation
  - `PromptAutocomplete` component with keyboard navigation (Arrow/Enter/Escape) and ARIA combobox
  - Gated behind `ENABLE_PROMPT_AUTOCOMPLETE` feature flag (enabled by default)
- **Code IntelliSense**: Framework-aware snippet completions in Monaco editor
  - 10 React snippets, 12 Tailwind utilities, 7 shadcn/ui component templates
  - Auto-registered on editor mount based on framework and component library
  - Gated behind `ENABLE_CODE_INTELLISENSE` feature flag (enabled by default)
- **Docs search**: Fumadocs built-in search with static pre-rendering (`/api/search`)
- **Docs ecosystem**: Homepage updated to show all 6 Forge Space repos

### Changed
- Template library: Add framework filter, ownership tabs (All/Official/My Templates), server-side filtering
- Template library: Remove 669 lines of hardcoded template code from TemplateCard (templates serve code from DB)
- TemplateCard.tsx: 770 → 127 lines (-84% reduction)

### Testing
- Test coverage boosted from 81% to 86% with 44 new tests (theme store, storage utils, feature provider)

## [0.9.0] - 2026-02-25

### Added

- **Design Context System** (#113): Structured design inputs for AI generation
  - ColorPicker component with hex input and 8 preset swatches
  - DesignContext collapsible panel: color mode, colors, animation, spacing, border radius, typography
  - Design context values wired into generation API request as structured prompt block
  - Gated behind `ENABLE_DESIGN_CONTEXT` feature flag (enabled by default)
- **Theme System** (#113): Reusable design themes with persist store
  - `SizaTheme` data model with all design context fields
  - Zustand store with localStorage persistence (CRUD, duplicate, export/import)
  - 5 built-in read-only themes: Siza Default, Clean Light, Bold Contrast, Nature, Monochrome
  - Per-project active theme tracking
  - ThemeSelector dropdown with color dot previews and create/duplicate/export/import actions

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