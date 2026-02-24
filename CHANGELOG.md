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
