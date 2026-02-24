# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
