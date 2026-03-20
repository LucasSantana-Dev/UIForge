# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Removed stale duplicate metrics API unit test (`apps/web/src/__tests__/lib/api/metrics-route.test.ts`) that targeted the old service-based route contract and conflicted with the current Supabase-backed metrics route tests.

## [0.49.1] — 2026-03-19

### Fixed
- **Release provenance continuity** — cut a corrective follow-up release on `main` so release lineage and tags move forward without retagging `v0.49.0`.

### Changed
- **Version alignment** — synced root and `apps/web` package versions to `0.49.1`.

## [0.49.0] — 2026-03-16

### Added
- **Landing page redesign** — animated demo, unified violet palette, social proof section, and improved hero copy (#530)
- **Interactive CodeShowcase** — hover-to-highlight file tree nodes with live diff view (#532, #534)
- **EcosystemSection pipeline diagram** — layered flow diagram replacing card grid with connected architecture visual (#534)
- **Auth split-panel layout** — sign-in/up pages now show feature bullets and trust signals in a left panel (#533)
- **Pricing annual/monthly toggle** — gradient header, annual discount display, and tier differentiation (#547)
- **Generator empty state** — styled placeholder in code/preview panels before first generation (#546)
- **ProjectCard open link** — replaces meaningless progress bar with direct Open project link (#545)
- **Typography hierarchy** — normalized H2/H3 sizing across EcosystemSection and CapabilitiesSection; sidebar active indicator polish (#549)
- **Generator component unit tests** — 74 tests across 9 suites covering GeneratorForm, ThemeGenerator, DesignContext, LivePreview, and CodeEditor
- **Dashboard shell unit tests** — 46 tests across 7 suites covering Sidebar, TopBar, UserMenu, MobileNav, PRStatus, GitHubPanel, and ProjectSettings
- **Billing component unit tests** — 38 tests across PricingCard (15), SubscriptionStatus (10), UpgradePrompt (4), and UsageChart (9)
- **Roadmap and tour unit tests** — PhaseCard, PhaseNavigator, StatusFilter, TourCard, RoadmapHero (50+ tests)
- **Catalog, onboarding, analytics unit tests** — TryItPanel, WelcomeStep, ProjectStep, GenerateStep, AnalyticsDashboard, StatsBar, ecosystem-data (90+ tests)
- **Wireframe component unit tests** — FigmaExportDialog (8) and WireframePreview (10)
- **ThemeSelector unit tests** — 14 tests covering selection, save, import/export, duplicate, and built-in delete guard
- **SonarCloud CPD exclusions** — test files excluded from duplication checks (#528)

### Fixed
- **Sidebar active indicator** — exact-match on `/dashboard` prevents all child routes from appearing active; collapsed sidebar now hides left border correctly
- **Teams E2E flakiness** — unique `runId` suffix prevents parallel test collisions; `afterEach` cleanup removes created teams

### Changed
- **Dependencies** — major bumps: openai 4→6, express 4→5, vite 6→8, @vitejs/plugin-react 4→6, @types/node 22→25, @typescript-eslint 7→8, supertest, marked 15→17, and 14-package minor/patch group (#535–#544)

## [0.48.0] — 2026-03-15

### Added
- **StatsBar component** — global stats strip with real-time project, component, and user metrics (PR #521)

## [0.47.1] — 2026-03-15

### Added
- **Route coverage enforcement** — `scripts/check-route-coverage.ts` + CI gate blocks merges when any `route.ts` lacks a test; `scripts/scaffold-route-test.ts` scaffolds test files from route source (detects methods, auth, rate-limit, dynamic params, redirects)
- `npm run routes:check` and `npm run routes:scaffold <path>` convenience scripts

### Fixed
- **Security: 4 high CVEs in undici** — added `"overrides": { "undici": "^7.24.3" }` in root `package.json` to fix GHSA-f269, GHSA-2mjp, GHSA-vrm6, GHSA-v9p9, GHSA-4992, GHSA-phc3 (root cause: wrangler → miniflare → undici@7.18.2)
- **CI security gate** — changed `npm audit --audit-level=moderate` to `--omit=dev` to exclude dev-only electron/yauzl false positives

### Changed
- **Package.json version** — synced root + `apps/web` from 0.41.0 to 0.47.1 to match git tags

## [0.47.0] — 2026-03-15

> Covers changes from v0.42.0 through v0.47.0 (test expansion, funnel fixes, analytics, IDP telemetry).

### Added
- **P0 funnel fix** — removed project gate on `/generate`; users can generate in scratch mode without creating a project first; `ENABLE_MCP_DIRECT_PROVIDER_FALLBACK` enabled by default
- **P1 funnel improvements** — pre-fill generate form with last session context; simplified dashboard for zero-project users showing direct Start Generating + Create Project CTAs; Google Ads conversion tracking; signin flow GA4 events
- **Complete API route test coverage** — 100% of 68 route handlers now have unit tests (1368 → 1663 tests, +295 across 28 new test files)
- **Route test automation** — `scripts/check-route-coverage.ts` (CI gate) + `scripts/scaffold-route-test.ts` (test scaffold generator)
- **`api-route-testing` skill v1.6.0** — 6 documented mock patterns including barrel-mock error classes, NextResponse.redirect spy, bearer-token auth, AbortSignal polyfill, global.fetch override
- **Claude AI skills** — 5 new project skills: `verify`, `test-recovery`, `coverage-boost`, `api-route-testing`, `changelog`
- **Core-flow validation telemetry** — admin validation endpoint, internal snapshot/report endpoints, scheduled workflows
- **Lead attribution + Google Ads pilot** — first-touch attribution, GA4 funnel events, campaign assets
- **Production audit harness** — E2E production smoke, marketplace funnel spec

### Fixed
- **Security: 4 high CVEs in undici** — npm override to `^7.24.3` (wrangler → miniflare chain)
- **Unit test reliability** — generation.service postGenScore assertion
- **CI security gate** — `--omit=dev` excludes dev-only electron/yauzl

### Changed
- **Test coverage** — 87.6% → 91.4% statements, 79.6% → 82.9% branches

- **Production audit harness** — Added `test:e2e:prod`, `playwright.production.config.ts`,
  `e2e/production-public-smoke.spec.ts`, and `scripts/e2e-production-audit.sh` for
  Chromium production sweeps with artifacted reports and runtime API probe diagnostics
- **Generation unauth contract tests** — Added route tests for unauthenticated
  `GET /api/generations`, `GET /api/generations/history`, and `GET /api/generations/[id]`
  to prevent 500 regressions on auth-required endpoints
- **Lead-readiness E2E coverage** — Added `lead-readiness.spec.ts` for disposable signup-to-generation smoke and `marketplace.spec.ts` for templates/plugins/gallery marketplace funnel checks
- **Lead prepublish automation** — Added `test:e2e:lead:preflight`, `test:e2e:lead:chromium`, and `ads:google:prepublish` scripts plus supporting shell runners
- **Google Ads pilot assets** — Added campaign package for `siza_br_en_leadtest_v1` under `apps/web/marketing/google-ads/siza_br_en_leadtest_v1` (campaign config, keywords, negatives, RSA copy, day-1 ops)
- **Lead attribution module** — Added first-touch attribution capture/storage and unit coverage (`lead-attribution.test.ts`)
- **Signup lead-conversion coverage** — Expanded `SignUpPage` unit tests to assert
  `marketing_attribution` payload propagation and GA4 lead event emission paths
  (`lead_signup_started`, `lead_signup_success`, `lead_signup_oauth_start`, `lead_signup_error`)
- **Core-flow validation telemetry** — Added `GET /api/admin/validation` (admin-only),
  `POST /api/internal/validation/snapshot` (token-protected), daily snapshot storage
  (`core_flow_gate_snapshots`), and scheduled snapshot workflow for 50-user gate tracking
- **Core-flow activation funnel telemetry** — Added shared activation service with
  per-user qualification progress and `windowDays=7|30|90` funnel aggregation
  (onboarding -> first project -> first completed generation -> qualified)
- **Core-flow validation reporting ops** — Added token-protected
  `GET /api/internal/validation/report` and scheduled report workflow
  (`core-flow-validation-report.yml`) that publishes Actions summary + JSON artifact
- **Security Spoke admin telemetry** — Added `GET /api/admin/security` (admin-only,
  `windowDays=7|30|90`) with summary metrics, top triggered rules, risk/severity
  distributions, and recent high-risk generations
- **Security report persistence** — Added `generation_security_reports` storage
  (one report per generation) and MCP quality-event ingestion path to persist
  `security_spoke` payloads with advisory fail-open behavior
- **Live admin metrics endpoint** — Added `GET /api/admin/metrics` (admin-only)
  with `windowDays=7|30|90` support for product telemetry
- **Marketing SEO contract** — Added centralized route metadata map for
  `/`, `/about`, `/roadmap`, `/pricing`, `/docs`, `/gallery`,
  `/legal/privacy`, and `/legal/terms` with canonical/Open Graph/Twitter fields
- **Marketing robots/sitemap handlers** — Added `robots.ts` and `sitemap.ts`
  with explicit marketing allowlist and non-marketing disallow rules
- **SEO test coverage** — Added unit coverage for metadata/indexability/schema
  and Playwright SEO assertions for title/canonical/meta/H1/robots/sitemap/noindex
- **Playwright MCP transport wrapper** — New `scripts/playwright-mcp-wrapper.mjs`
  bridges Content-Length and newline JSON-RPC framing for Codex runtime
  compatibility, with `npm run mcp:playwright:wrapper` helper script
- **E2E test coverage expansion** — 4 new spec files (closes #399)
  - `catalog.spec.ts` — 10 tests: list, search, create entry, detail view, edit, graph, discover, tags
  - `teams.spec.ts` — 9 tests: list, create team, detail, slug preview, members, validation
  - `golden-paths.spec.ts` — 7 tests: list, search, filters, scaffold form toggle
  - `onboarding.spec.ts` — 7 tests: redirect, welcome step, feature cards, project creation, skip
- **Live provider generation smoke spec** — `generation-live.spec.ts` gated by
  `E2E_LIVE_PROVIDER=true` for real provider + preview integration validation
- **Live ecosystem sync module (marketing)** — Server-only GitHub metadata fetch with 11-repo allowlist, latest release enrichment, resilient fallback snapshot, and 6-hour revalidation
- **Marketing ecosystem tests** — Coverage for mapping, release fallback, and full fallback snapshot behavior
- **Governance asset sync commands** — `npm run sync:golden-paths` and `npm run sync:skills` to upsert official Golden Paths and SKILL.md-based official skills from repository sources
- **Deterministic Theme Generator** — New preset + seed-color + mood generator in Generate design context with Apply/Save actions
- **Golden Paths API route tests** — Coverage for hook-facing response contract and rate-limit behavior
- **Official skills parser sweep test** — Validates all `skills/*/SKILL.md` files parse cleanly
- **Roadmap gate metrics contract** — `/api/metrics` now returns 50-user gate status,
  core-flow adoption metrics, revision rate, satisfaction rate, and MCP routing coverage
- **Live analytics telemetry wiring** — Replaced mocked Analytics Dashboard data with
  live `/api/admin/metrics` telemetry (core totals, generation success, revision rate,
  satisfaction rate, MCP coverage) and CSV export from real values
- **MCP fallback policy flag** — Added `ENABLE_MCP_DIRECT_PROVIDER_FALLBACK` (default: off)
  to control whether MCP failures may fallback to direct providers
- **Core-flow activation UX** — Added onboarding nudges + deterministic onboarding telemetry
  events and a dashboard Core Flow Progress checklist that persists until qualification
- **Core-flow activation v2** — Added deterministic activation bottleneck telemetry
  (`onboardedWithoutProject`, `projectWithoutCompletedGeneration`, `qualifiedUsers`)
  plus next-action prioritization (`CREATE_PROJECT`/`COMPLETE_GENERATION`) in
  `GET /api/admin/validation`
- **Activation starter conversion telemetry** — Added deterministic activation lifecycle
  events for starter-project flows: `activation_starter_project_confirmed`,
  `activation_starter_project_created`, `activation_starter_project_fallback`,
  and `activation_route_to_generate`

### Changed
- **Public auth semantics and gallery guidance** — Auth routes now render a real
  page-level `h1` inside the auth shell `main` landmark, and gallery empty states
  now direct signed-out users to `/signup` and signed-in users to `/generate`
- **Production audit script lint compliance** — `apps/web/scripts/e2e-production-audit.sh`
  now follows strict Shell Lint/Sonar rules (`[[ ]]`, stderr error output, explicit
  function returns, stable status capture, and `shfmt -i 2` formatting)
- **Generation route error handling deduplication** — Added shared generation API
  error mapping helper used by `/api/generations`, `/api/generations/history`,
  and `/api/generations/[id]` catch paths to keep UnauthorizedError => `401`
  behavior consistent without repeated handler logic
- **Generation unauth test deduplication** — Replaced three near-identical
  unauthenticated generation GET route tests with one parameterized auth-contract
  suite covering list, history, and by-id endpoints
- **Lead-readiness production smoke resilience** — `lead-readiness.spec.ts`
  now dismisses the in-app tour overlay before code-tab interaction, preventing
  pointer interception in production disposable-user audit runs
- **Generation API auth contract** — `verifySession` failures now return `401`
  (instead of `500`) for `/api/generations`, `/api/generations/history`, and
  `/api/generations/[id]`, while preserving existing `403`/`404`/`500` semantics
- **Roadmap mobile overflow resilience** — Updated `PhaseCard` header layout to wrap
  safely on narrow viewports and applied page-level `overflow-x-hidden` in roadmap client
- **Lead-readiness billing smoke policy** — Checkout-session validation now accepts
  `403 Billing is not enabled` when billing is disabled, and requires `200` with URL when enabled
- **Production issues map quality** — `e2e-production-audit.sh` now records findings only
  from real failures/probe mismatches, maps roadmap overflow failures to component fix targets,
  and resolves Vercel env pulls correctly from git worktrees
- **Signup and analytics flow** — Wrapped app layout with `AnalyticsProvider`; signup now emits GA4 lead events and includes `marketing_attribution` metadata on auth signup
- **Template ownership querying** — Templates UI/API now uses explicit ownership filter (`all|official|mine`) with auth-checked `mine` behavior and route tests
- **Admin validation API** — `GET /api/admin/validation` now accepts
  `windowDays=7|30|90` and returns additive `activationFunnel` data for conversion/drop-off analysis
- **Activation routing nudges** — Onboarding skip/complete routing now drives users
  to project creation or project-aware generation paths, and dashboard Core Flow
  Progress now highlights a single primary next-action CTA
- **Activation project-conversion CTAs** — Onboarding done-step and dashboard Core
  Flow primary "Create project" actions now support one-click starter project
  creation and route directly to project-aware Generate flow
- **Dashboard conversion-first CTA routing** — Header and empty-state primary
  actions now route no-project users to project creation first, while preserving
  project-aware Generate routes for users with an existing project
- **Gate activation v5 guided conversion** — Added a dashboard guided
  starter-project prompt for onboarding-complete/no-project users with explicit
  confirm + "Not now" actions, project-aware Generate routing on starter-project
  success, manual project-creation fallback on failure, and project-first
  quick-action generate routing for the same cohort
- **P0-A in-app conversion lift** — Dashboard no-project primary CTAs now execute
  one-click starter-project creation across header, empty-state primary,
  quick-action generate, and checklist next-step actions, each tagged with
  deterministic `entry=<cta>&step=project` attribution params
- **Onboarding conversion exits** — No-project onboarding skip/done exits now route
  through dashboard conversion intent (`/dashboard?...&intent=create_project`)
  while preserving project-aware generation routing when project context exists
- **Lead E2E determinism** — Playwright config now supports explicit lead smoke port/reuse controls and disables onboarding tour overlays by env for automation runs
- **Lead/auth E2E hardening** — Auth/onboarding/stripe smoke specs now use shared
  admin-client setup and deterministic webhook payloads to reduce flaky setup paths
- **Catalog E2E redirect resilience** — Catalog creation specs now handle both
  direct-detail and list-first redirect flows by resolving created entry IDs via API
- **Project MCP defaults** — Added wrapper-first `playwright` server entry in
  `.mcp.json` and documented global-registry recovery flow + restart step for
  Codex runtime MCP reload
- **Canonical behavior** — Removed root-level canonical override and switched to
  self-canonical metadata per marketing/legal route
- **Marketing rendering strategy** — Marketing routes are static/ISR-friendly;
  removed server-auth dependency from homepage marketing nav rendering
- **Indexability policy enforcement** — Added noindex boundaries for
  dashboard/onboarding/auth/utility routes and redirect-only `/landing`
- **Pricing page static fallback** — Removed marketing React Query dependency
  from pricing page to keep marketing prerender deterministic
- **Contributor guidance** — Added `AGENTS.md` project operations guide and linked it from README development docs.
- **Generation E2E model** — `generation.spec.ts` now uses deterministic mocked SSE
  flows for stable CI assertions (preview render, refresh interaction, copy/download)
- **Live smoke provider selection** — `generation-live.spec.ts` now preflights
  Gemini BYOK capacity, auto-switches to Anthropic BYOK when available, and skips
  with an explicit reason when live provider quota is unavailable
- **Bundle optimization** — removed 4 dead dependencies (@monaco-editor/react, react-icons, react-email, next-themes), moved 9 misplaced root deps to proper workspaces, added serverExternalPackages for 5 server-only libs, lazy-load 3 below-fold landing sections, optimizePackageImports for lucide-react/motion/supabase
- **Marketing data model refresh** — Home (`StatsBar`, `EcosystemSection`), About, and Roadmap now consume a live ecosystem snapshot instead of stale hardcoded repo/capability claims
- **Marketing UI polish** — Improved label/card rhythm, metadata chips, focus-visible states, and contrast consistency across ecosystem and stats surfaces
- **Docs refresh** — Updated README ecosystem narrative to 11 product repositories and documented `FORGE_SPACE_GITHUB_TOKEN` with `GITHUB_TOKEN` fallback
- **Ads operator docs** — Expanded README lead/ads prepublish section with explicit
  Google Ads asset file inventory for `siza_br_en_leadtest_v1`
- **Desktop dependency security baseline** — Upgraded `apps/desktop` build chain to
  `electron-builder@^26.8.1` and refreshed lockfile resolution so `tar` resolves to
  `7.5.11` across desktop and generator transitive paths.
- **Desktop CI security gate** — Added a dedicated CI job that prints desktop `tar`
  resolution and fails on `npm audit --workspace=apps/desktop --audit-level=high`.
- **Core follow-up tracking** — Opened issue to remove `@forgespace/core` import-time
  CLI side effects: [Forge-Space/core#124](https://github.com/Forge-Space/core/issues/124)
- **Golden Paths API contract** — `GET /api/golden-paths` now returns `data + pagination` shape aligned with frontend hooks
- **Golden Paths filter support** — Added end-to-end `stack` and `language` query filtering
- **Generate workspace layout polish** — Replaced brittle edge-to-edge negative margins with stable bordered container and improved responsive split-pane sizing
- **UI capitalization consistency** — Standardized key labels/headings to Title Case across Generate/Billing/Plugins/Golden Paths surfaces and page metadata (`Generate` label)
- **Landing architecture** — Homepage is now static (removed force-dynamic user lookup),
  with public `/signin` and `/signup` CTAs to improve cacheability and bfcache behavior
- **Landing JS budget** — Removed Motion-based wrappers from hero/capabilities/ecosystem/
  dashboard/CTA/stats surfaces; non-interactive sections now render as server components
- **Landing contrast tokens** — Updated subtle text token to higher-contrast value and
  applied contrast-safe text colors across marketing code snippets/footer metadata
- **Landing navigation runtime trim** — Replaced client Sheet + scroll-state nav
  behavior with server-rendered disclosure navigation and section-anchor links
  to keep homepage interaction JS minimal
- **Landing link prefetch policy** — Disabled automatic Next.js prefetch on
  homepage internal marketing links to avoid eager downloading of non-critical
  route bundles from `/`
- **MCP-first generation behavior** — In MCP mode, direct-provider fallback is policy-gated
  and disabled by default; failures now return explicit MCP-availability guidance

### Fixed
- **Core-flow report workflow load failure** — Corrected report workflow schedule
  cron expressions and cadence mapping to avoid zero-job parse failures on push
- **Auth callback failure handling** — Sanitized callback `next` parameter and route failures to `/auth/auth-code-error` with explicit reason handling
- **Marketplace resilience surfaces** — Improved templates/plugins/gallery handling for ownership filtering, empty-state messaging, and API failure/retry behavior used by marketplace smoke
- **Onboarding completion idempotency** — Switched onboarding completion route to profile upsert-by-id to avoid missing-row failures
- **Deferred dependency alerts remediation (`#448`)** — Upgraded desktop test
  toolchain to `vitest@4` (removing vulnerable `vite-node/esbuild` path) and
  upgraded web Jest/JSDOM environment to v30 (removing vulnerable
  `@tootallnate/once` transitive path).
- **Generation fallback reliability** — Quota/rate-limit provider failures now return
  normalized capacity guidance when no backup key is configured, and fallback to
  server-side Anthropic when available
- **Fallback key isolation** — Backup provider calls no longer reuse primary-provider
  BYOK keys
- **Post-gen scorer import side effects** — Siza now loads the scorer directly from
  side-effect-safe core subpath instead of importing `@forgespace/core` root
- **E2E auth fixture setup** — Playwright fixtures now mark both onboarding and tour
  completion, preventing overlay/interstitial interference in dashboard tests
- **SonarCloud hotspot blockers on main** — Removed high-noise hotspot patterns by replacing vulnerable regex scans with safer parsing logic, replacing `Math.random()` IDs with crypto-backed IDs, replacing hardcoded IP test/example literals, narrowing Docker build copy scope in `apps/api/Dockerfile`, and pinning GitHub Actions/reusable workflow `uses:` references to full commit SHAs.
- **Homepage hydration stability** — `LandingNav` now initializes deterministic scroll
  state (`false`) and updates after mount, removing window-derived initial render mismatch

---

## [0.41.0] - 2026-03-08

### Added
- **AI-specific quality gates** — 5 new post-gen scoring gates targeting common AI code generation anti-patterns: architecture (god components >300 LOC, function sprawl, prop bloat, deep nesting), error-handling (empty catch, console-only catch, unhandled promises), scalability (N+1 queries in loops, missing pagination), hardcoded-values (production URLs, secrets, magic numbers, TODO sprawl), engineering (@ts-ignore, sync I/O, inline styles, index-as-key)
- **Updated gate weight system** — 10 gates total with weighted scoring: security 3x, accessibility/architecture/error-handling 2x, scalability/hardcoded-values/engineering 1.5x, lint/type-check 1x, responsive 0.5x
- **60 new quality gate tests** — comprehensive coverage for all 10 gates (1080 total tests passing)

## [0.40.0] - 2026-03-08

### Added
- **Anthropic Agent Skills spec** — SKILL.md parser with YAML frontmatter, Skills Marketplace page (/skills) with category pills, tag filter, search, import/export, Skill Creator GUI (/skills/create) with live SKILL.md preview, Editor/Preview tabs, DB migration (8 new columns: version, author, license, tags, allowed_tools, argument_hint, invocation_mode, raw_frontmatter), API routes for list/import/export, ENABLE_SKILL_MARKETPLACE feature flag, 10 parser tests
- **Entity Permissions UI** — CRUD repository (getEntityPermissions, grantEntityPermission, revokeEntityPermission), /api/permissions route (GET/POST/DELETE admin-only), React Query hooks, EntityPermissionsPanel component, 13 tests
- **Teams UI pages** — Teams list with create form, team detail with member management (add, remove, inline role editing), 4 new pages in /teams
- **RBAC API tests** — 20 route tests for /api/teams (5) and /api/teams/[slug] (15) with role checks

## [0.39.0] - 2026-03-08

### Added
- **Plugin System** — Governance plugins marketplace with install/uninstall/configure, widget slots on catalog entities, 6 official plugins (Tech Debt Scanner, Architecture Guard, Security Posture, Scalability Analyzer, Planning Enforcer, Dependency Health)
- **Plugin API routes** — GET/POST/DELETE/PATCH `/api/plugins` and `/api/plugins/[slug]` with auth, Sentry error capture, pagination
- **Plugin widget slots** — Extensible `<PluginSlot>` component renders active plugins on entity detail pages
- **Entity Relationships** — Backstage-inspired typed directional relations (9 types: dependsOn, consumesAPI, providesAPI, ownedBy, partOf, hasPart, implements, deployedTo, monitoredBy) with DB migration, repository, API, hooks, and UI panel
- **Dependency Graph relationships** — Catalog graph now includes entity relationships with color-coded edges by type
- **TechDocs v2** — Table of contents sidebar with heading extraction, toggle button, anchor-linked headings via custom `marked` renderer
- **Search Federation** — Plugins added to global search API and ⌘K command palette with PuzzleIcon

---

## [0.38.0] - 2026-03-08

### Added
- **Supabase-backed rate limiting** — Replace in-memory Map with database-backed rate limits; free tier tightened to 5 gen/month (#372)
- **Conversation context** — Multi-turn refinement via `conversationContext` in `buildPrompt()` (#380)
- **SSE stream timeout** — 30s `Promise.race` timeout prevents UI freezes when providers stop sending (#380)
- **Sentry error logging** — All generation providers now log errors via `captureServerError()` (#371)
- **Skills system enabled** — `ENABLE_SKILLS` feature flag now true by default (#379)
- **Audit dashboard enabled** — `ENABLE_AUDIT_DASHBOARD` feature flag now true by default (#379)
- **Catalog Auto-Discovery** — Scan GitHub repos for `catalog-info.yaml`, preview and batch import (#363)
- **Parameterized Golden Path Templates** — Dynamic scaffold form with 4 input types (#363)
- **Global Search (⌘K)** — Command palette searches across projects, catalog, golden paths, templates (#363)
- **API Playground** — Interactive "Try It" panel on API docs with live requests (#365)
- **TechDocs Auto-Detection** — Docs indicator scanning with badges on discovered repos (#365)
- **API Documentation Viewer** — Inline OpenAPI 3.x renderer (~4 KB gzipped, zero deps) (#361)
- **CI/CD Visibility Panel** — Inline GitHub Actions workflow runs on catalog entities

### Changed
- **Provider-agnostic generation** — Decoupled from Gemini; configurable via `DEFAULT_GENERATION_PROVIDER` / `DEFAULT_GENERATION_MODEL` env vars (#370)
- **Generate page simplification** — Collapsed AI Provider and Advanced sections into accordions (#370)
- **Vercel deployment** — Migrated from Cloudflare Workers to Vercel (#369)
- **Siza AI routing** — Always routes to Gemini Flash, removed Anthropic quality escalation (#372)
- **CI reusable workflows** — Replaced security workflows with org composite actions (#359, #360)

### Fixed
- **BYOK fallback** — User API keys now passed through Anthropic quota fallback path (#380)
- **Usage API 401** — Proper `UnauthorizedError` handling instead of 500 (#379)
- **Quota detection** — Upgraded from substring to word-boundary regex (#379)
- **Hardcoded model** — Fixed `generateWithGoogle` ignoring model parameter (#371)
- **Background video** — Replaced 1.7 MB video with CSS noise + animated gradients (#362)
- **Production bugs** — Usage count, breadcrumb UUID, keyboard shortcuts (#366)
- **Gemini model** — Updated deprecated `gemini-2.0-flash` to `gemini-2.5-flash` (#367)
- **Auth page** — Capitalized "Back to Sign In" on forgot-password (#368)

---

## [0.37.0] - 2026-03-07

### Added
- **Keyboard shortcuts dialog** — Press ⌘? to see all shortcuts (#349)
- **TechDocsPanel** — Catalog entity documentation panel with markdown rendering (#351)
- **Dependency graph enhancements** — Navigation, lifecycle indicators, and auth-aware edges (#355)
- **Generation error categorization** — Structured error messages with icons, titles, and suggestions (#353)
- **Docs site theme toggle** — Dark/light theme support for documentation (#346)
- **ARCHITECTURE.md** — Contributor onboarding guide with system architecture overview (#339)

### Changed
- **Empty dashboard CTA** — Improved call-to-action with direct generate action (#354)
- **Docs site rebrand** — Forge Space identity applied to documentation site (#356)
- **Onboarding redirect** — Incomplete onboarding users redirected to wizard (#345)

### Security
- **Semgrep CE + Trivy scanning** — CI security scanning pipeline (#352)

### Internal
- **Replace depcheck with knip** — Better dead code detection (#357)

---

## [0.36.0] - 2026-03-07

### Added
- **Dashboard generation count** — Shows all-time total generations in stat card with monthly count as subtitle (#333)
- **Catalog scorecard integration** — Quality badges on catalog entries with linked scorecards (#337)
- **Governance guides** — Scorecard, policy packs, and BYOK documentation (#335)
- **catalog-info.yaml** — Backstage-compatible service metadata for IDP self-registration (#338)

### Changed
- **lucide-react** bumped to 0.577.0 (#334)

---

## [0.35.0] - 2026-03-07

### Added
- **Golden Path Templates** — Backstage-inspired project scaffolding blueprints for IDP
- **Golden Paths API** — REST endpoints (GET/POST /api/golden-paths, GET/PATCH/DELETE /api/golden-paths/[id]) with Zod validation
- **Golden Paths UI** — Template grid with search, type filters, lifecycle badges, step/param counts
- **Parametric scaffolding** — Templates define parameters (string/boolean/number/select) and ordered steps
- **Template lifecycle** — draft → beta → ga → deprecated status tracking
- **5 seed templates** — Next.js Service, MCP Server, React Library, Python API, Cloudflare Worker
- **ENABLE_GOLDEN_PATHS feature flag** — Toggle golden paths visibility (default: enabled)
- **Catalog YAML import** — Backstage catalog-info.yaml parser for service discovery import
- **Tests** — 25 new tests (10 service + 15 validation)

---

## [0.34.0] - 2026-03-07

### Added
- **Software Catalog** — Backstage-inspired service registry for IDP with 5 entity types (Service, Component, API, Library, Website)
- **Catalog API** — REST endpoints (GET/POST /catalog, GET/PATCH/DELETE /catalog/[id]) with Zod validation, rate limiting, ownership verification
- **Catalog UI** — Grid/list views, search, type/lifecycle filters, pagination, detail page, create/edit forms
- **Dashboard governance card** — Catalog stats in governance dashboard section
- **ENABLE_SOFTWARE_CATALOG feature flag** — Toggle catalog visibility in sidebar navigation (default: enabled)
- **Dependency tracking** — Track inter-service dependencies with forward/reverse resolution
- **Supabase migration** — catalog_entries table with RLS, GIN-indexed tags, btree indexes
- **Seed data** — 9 Forge Space repos pre-seeded in catalog
- **Tests** — 27 new tests across validation, service, and integration suites

---

## [0.33.0] - 2026-03-07

### Added
- **siza-gen context enrichment** — Wire `@forgespace/siza-gen/lite` `assembleContext()` into generation pipeline for both webapp and API, adding framework conventions, quality rules, and a11y checklist to system prompts
- **ENABLE_SIZA_GEN_CONTEXT feature flag** — Toggle siza-gen context enrichment (default: enabled)
- **prompt-enrichment service** — New `apps/api/src/services/prompt-enrichment.ts` for API-side system prompt enrichment

---

## [0.32.0] - 2026-03-07

### Fixed
- **Deploy** — Stub `@vercel/og` JS wrapper + WASM before build, fitting Workers 3 MiB limit (#298)
- **IDP CI workflows** — Add `@forgespace/core` as devDependency so `forge-scorecard` and `forge-policy` bin commands resolve correctly via `npx` (#300)
- **Scorecard/Policy workflows** — Remove fallback skip logic (CLI is now published on npm)

### Changed
- **TemplatePreview** — Remove shiki dynamic import, use plain `<pre>` for code display (reduces bundle) (#299)
- **Ambient video** — Rename to `ambient-bg.webm` (cleaner path) (#299)

---

## [0.31.0] - 2026-03-07

### Added
- **Onboarding wizard** — Enable `ENABLE_ONBOARDING` flag for new user onboarding flow
- **Scorecard CI workflow** — `scorecard.yml` runs project quality evaluation on PRs, posts score as comment
- **Policy check CI workflow** — `policy-check.yml` enforces governance policies on PRs via `@forgespace/core`

---

## [0.30.0] - 2026-03-07

### Added
- **ProjectDetail IDE layout** — Component/History sidebar with tabbed navigation, Code/Preview output panel, generation status dots
- **Admin audit design overhaul** — Replaced `zinc-*` colors with `surface-*`/`text-*`/`violet-*` design tokens, skeleton loading states, proper empty states
- **Project scorecard design overhaul** — Score gauges with level-based colors, category cards with icon backgrounds, history bar chart, back navigation

## [0.29.0] - 2026-03-07

### Added
- **Workspace UI overhaul** — 2-column generate page layout with sidebar panel, enriched dashboard with usage stats/plan badge/usage bars, redesigned template cards with visual preview and framework badges
- **Auth pages polish** — Brand violet accents on signin/signup pages

### Dependencies
- npm_and_yarn group updates (#284)

## [0.28.0] - 2026-03-07

### Added
- **Audit dashboard** — Admin-only governance dashboard at `/admin/audit` with event filtering, severity badges, pagination
- **Project scorecards** — Per-project score dashboard at `/projects/[id]/scorecard` with 4-category breakdown (security, quality, performance, compliance), violations list, recommendations, trend history
- **Scorecard API** — `/api/scorecards` route with auth + project ownership verification
- **Audit API proxy** — `/api/audit` route proxying to MCP gateway audit events API (admin-only)
- **Unleash proxy client** — `unleash-client.ts` for centralized feature flag management with 30s cache TTL and namespaced lookup
- **Database migration** — `project_scorecards` table with per-category scores, JSONB breakdowns, RLS policies
- **Feature flags** — `ENABLE_AUDIT_DASHBOARD`, `ENABLE_POLICY_ENGINE`, `ENABLE_PROJECT_SCORECARDS` governance flags
- **design-tokens.ts** — Raw Siza token values for contexts without CSS (e.g. global-error).

### Fixed
- **Build** — Removed HeroParticlesBackground (React 19 / @react-three/fiber peer conflict). Can be reintroduced when React 19–compatible three.js stack is available.

### Changed
- **shadcn CLI v4** — Migrated from individual `@radix-ui/react-*` packages to unified `radix-ui` package (shadcn CLI v4). Consolidated 23 package dependencies into 2 (`radix-ui` in apps/web + packages/ui).
- **Design tokens migration (Phase 2)** — Replaced `--siza-*` design tokens with `--forge-*` from `@forgespace/brand-guide`. `globals.css` now imports `forge-tokens.css`; `design-tokens.ts` renamed to `forgeTokens`; Tailwind configs (web + UI) use `--forge-ease`, `--forge-radius-*`, `--forge-surface`; components updated to `var(--forge-border)` and related tokens. Legacy aliases (`--surface-0`, `--brand`, `--font-sans`, etc.) point to `--forge-*` for backward compatibility.
- **global-error** — Replaced NextError with brand-aligned custom UI (Sora/DM Sans, sizaTokens, styled Try again button). Kept Sentry reporting.
- **Gap analysis primary cleanup** — Replaced remaining `rgba(124,58,237)` with `rgba(139,92,246)` in PhaseCard, PhaseNavigator, CTASection, EcosystemSection, DashboardPreview, and tailwind.config.ts for token consistency.
- **UX overhaul (gap analysis)** — LandingFooter: fixed Platform → `/`, Pricing → `/pricing`. AI Keys: added Secure storage banner. Roadmap: added Desktop app (Electron/Tauri) item. Roadmap Desktop filter already present.
- **Motion migration** — Migrated from `framer-motion` to `motion` (motion.dev); updated imports to `motion/react`. Added `useReducedMotion()` across HeroSection, EcosystemSection, CapabilitiesSection, CTASection, PhaseCard, roadmap, and about pages. Enhanced hover/tap gestures (`whileHover`, `whileTap`) on CTAs and cards per animation guidelines.
- **Full design-system implementation pass (phase batch)** — Unified app tokens with canonical `--siza-*` aliases in `globals.css`, aligned Tailwind theme mapping (`primary`, `surface`, `foreground`, `primary-hover`), and updated display font to Sora in Tailwind config.
- **Shared shells aligned to design-system** — Auth shell now matches centered 440px card + radial glow + subtle pattern; dashboard chrome now uses 56px top bar, breadcrumb/command search, notifications dot, and token-consistent surfaces/borders.
- **Landing + auth + projects visual parity** — Landing nav/footer/hero moved to design-system language (beta badge, production-grade headline, docs CTA, token colors), auth forms updated to design-system card/input/button styles, projects page/cards now include design-style view toggle and metric/progress presentation while preserving real project data/actions.
- **Brand alignment (Modern Horn)** — Primary palette updated to #8B5CF6 / #A78BFA / #6D28D9 in globals.css, theme defaults, and design context. Display font switched from Plus Jakarta Sans to Sora via `next/font/google`; CSS variable `--font-display` now uses `--font-sora`. Public logo SVGs and tests updated to new palette.
- **Public logo SVGs (Modern Horn)** — `apps/web/public/siza-icon.svg` and `siza-logo.svg` now use the Modern Horn icon from brand-guide `/explore` (path + two rects, palette #A78BFA / #8B5CF6 / #6D28D9, Sora wordmark).
- **Siza app UI migration foundation** — Added migration primitives (`AuthCardShell`, `MarketingSection`, `DashboardSection`) and global utility classes (`siza-shell-card`, `siza-prose`, `siza-video-bg`, `siza-scrollbar`) to align route-level visual language.
- **Dashboard nav unification** — Sidebar, MobileNav, and page metadata now consume a single shared navigation source (`components/dashboard/navigation.ts`) to prevent route-label/icon drift.
- **Mapped + gap route visual refresh** — Updated landing/about ambient backgrounds, auth surfaces (signin/signup/forgot/reset), roadmap desktop scope filter, templates/history pagination controls, AI Keys/Billing/Settings headers, and redesigned privacy/terms/maintenance/billing-success pages.
- **Role-aware dashboard navigation** — Sidebar, MobileNav, and breadcrumb metadata now receive admin-aware route sets and display the `Admin` entry only for users with `profiles.role = 'admin'`.

### Added
- **Design system — Code view**: CodeEditor (Monaco) aligned to Siza design tokens: indent guides, 2-space indentation (insertSpaces, indentSize), IBM Plex Mono font, line height 23px, vertical padding 16px; `.siza-code-editor` wrapper and Monaco background use `--surface-0` in globals.css
- **Keyboard shortcuts (generate page)** (#266): ⌘↵ submit generation, ⌘K focus prompt, ⌘S save as template, Escape close modals; `useGeneratePageShortcuts` hook, tooltips on Generate / Save as Template, ⌘K hint in prompt label, unit tests for hook
- **Brand monogram**: Forge Space monogram.svg as app logo in Sidebar, LandingNav, error, not-found, maintenance, and loading pages
- **Ambient route background support** — New `AmbientVideoBackground` component for media-backed hero/about backgrounds with gradient fallback layering.
- **Admin feature flags panel** — New dashboard `Admin` page with list/toggle/create/delete controls backed by existing `/api/features` and `/api/features/[id]` routes, plus server guard in `(dashboard)/admin/layout.tsx`.
- **Local admin bootstrap script** — Added `scripts/grant-admin-by-email.ts` and `npm run admin:grant -- <email>` to set `public.profiles.role = 'admin'` for local or staging users.

## [0.27.0] - 2026-03-01

### Added
- **Loading skeletons**: Structured loading states for projects, generate, and settings pages with Skeleton component in @siza/ui (#279)

### Fixed
- **Error messages**: Actionable, user-friendly error messages across generation API — covers providers, MCP gateway, validation, and streaming errors (#278)

### Testing
- **Billing component tests**: 38 tests across PricingCard, SubscriptionStatus, UsageChart, and UpgradePrompt (#280)

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
