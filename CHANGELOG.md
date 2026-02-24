# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Resend Email Integration**: branded transactional emails (verification, welcome, password reset, email change) via Resend SDK with react-email templates
- **Forgot/Reset Password Flow**: complete password recovery with branded emails and auth callback integration
- **Centralized Feature Flags**: database-backed feature toggle system with admin CRUD API, audit log, React context provider, and env var fallback
- **Stripe Billing Integration**: Checkout sessions, Customer Portal, webhook sync (subscription lifecycle), Free/Pro plan tiers with usage tracking
- **Usage Quota Enforcement**: generation and project creation quotas wired into API routes, gated by `ENABLE_USAGE_LIMITS` flag
- **Billing UI**: pricing page, subscription status, usage charts, upgrade prompts
- **DB Migrations**: `feature_flags`, `feature_flag_changes`, `subscriptions`, `plan_limits`, `usage_tracking`, `stripe_events` tables
- **AI Generation with Gemini**: direct Gemini 2.0 Flash integration for component generation via SSE streaming
- **Gemini service** (`apps/web/src/lib/services/gemini.ts`): async generator wrapper around `@google/generative-ai` SDK
- **BYOK support in GeneratorForm**: users can use their own Gemini API key (client-side encrypted) for generation
- **DB migration**: added `component_name`, `generated_code`, `component_library`, `style`, `typescript` columns to `generations` table
- **Tests**: Gemini service tests (6) and generate route tests (7), all passing
- **Dependencies**: `@google/generative-ai`, `react-hook-form`, `@hookform/resolvers`
- **`@uiforge/forge-patterns`**: added as dev dependency (local file reference) for shared constants access

### Changed

- **Generate API route** (`apps/web/src/app/api/generate/route.ts`): replaced dead Cloudflare Workers proxy with direct Gemini SDK calls
- **Generations CRUD routes**: updated PATCH whitelist and POST insert to support new fields
- **`use-generation` hook**: tracks `generation_time_ms` for performance metrics
- **`.env.example`**: replaced Workers URL with `GEMINI_API_KEY`
- **`packages/eslint-config/index.js`**: added forge-patterns rules — `no-floating-promises` (error), `prefer-template` (warn), `no-duplicate-imports` (error), `require-await` (error)
- **`engines.node`**: `>=20` to `>=22` (aligning with forge ecosystem standard)
- **CI `node-version`**: `'20'` to `'24'` across all jobs in `ci.yml`
- **`.husky/pre-commit`**: upgraded from bare `npx lint-staged` to forge gate pattern
