# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] — 2026-02-25

### Added

- **Documentation site**: Fumadocs-powered docs at `apps/docs/` with 12 content pages (Getting Started, Guides, API Reference, Ecosystem)
- **Docs deployment**: Cloudflare Workers deploy workflow for documentation
- **Community infrastructure**: GitHub Discussions, homepage URL, updated repo descriptions
- **Visual overhaul**: Dark-only Siza brand identity across 37 files
- **SizaBackground component**: Ambient dot grid + brand glow for marketing/auth pages
- **Skip-to-content link**: Accessibility improvement in root layout
- **Stripe production activation**: Webhook endpoint, test-mode products (Pro $19/mo, Team $49/mo), 12 Cloudflare Workers secrets
- **CI status badge**: README now shows CI workflow status
- **GitHub Discussions**: Enabled on siza repository for community engagement

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
