# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- Deleted broken scaffold workflows (`dev-deploy.yml`, `production.yml`, `deploy-admin.yml`) that ran builds without checkout/install
- Rewrote `deploy-web-admin.yml` to use Cloudflare Workers deployment via OpenNext (was incorrectly using Pages)
- Standardized Node.js 22 across all CI workflows (`release-branch.yml`, `release-automation.yml`, `supabase-setup-admin.yml`)
- Fixed README badges and references (Next.js 16, Node.js 22, Cloudflare Workers deployment docs)

### Added

- **Cloudflare Workers deployment**: production deployment via OpenNext (`@opennextjs/cloudflare`) with `nodejs_compat` for full Node.js API support
- **Deploy workflow** (`.github/workflows/deploy-web.yml`): automated build + deploy on push to dev/main using `wrangler-action@v3`
- **OpenNext config** (`apps/web/open-next.config.ts`, `apps/web/wrangler.jsonc`): Workers-native Next.js deployment
- **Image Recognition (Gemini Vision)**: upload UI screenshots for AI-powered component generation via multimodal input
- **Image analysis service** (`apps/web/src/lib/services/image-analysis.ts`): standalone Gemini Vision analysis returning structured `DesignAnalysis` (layout, components, colors, typography, spacing, interactions, suggestedPrompt)
- **Analyze-image API endpoint** (`apps/web/src/app/api/analyze-image/route.ts`): POST endpoint with rate limiting and session auth for standalone image analysis
- **Drag-and-drop image upload**: collapsible reference image section in GeneratorForm with preview, file validation (5MB max, PNG/JPEG/WebP), and accessible drop zone
- **RAG context enrichment**: generation pipeline enriches prompts with relevant context from previous generations via embeddings

### Fixed

- **Edge middleware** (`apps/web/src/middleware.ts`): converted `proxy.ts` to standard `middleware.ts` with `runtime = 'experimental-edge'` — `proxy.ts` with `runtime = 'edge'` is illegal in Next.js 16 and breaks the build
- **Next.js config**: wrapped `initOpenNextCloudflareForDev()` in development-only guard to prevent production build failures
- **Deploy workflow**: added `--legacy-peer-deps` to `npm ci` for peer dependency resolution

### Changed

- **Rate limiter** (`apps/web/src/lib/api/rate-limit.ts`): replaced `setInterval` with bounded lazy cleanup (max 10 per request) for Workers compatibility
- **API routes**: removed explicit `runtime` declarations from all routes — OpenNext handles runtime automatically
- **`.env.example`**: added `NEXT_PUBLIC_BASE_URL` for OAuth redirects
- **Next.js config**: added `initOpenNextCloudflareForDev()` for Cloudflare dev server compatibility
- **Gemini service** (`apps/web/src/lib/services/gemini.ts`): added `imageBase64`/`imageMimeType` to options, sends multimodal `[text, inlineData]` content when image is present
- **Generate API route** (`apps/web/src/app/api/generate/route.ts`): extended Zod schema with image fields, bumped API version to 3.0.0, added `image-input` feature flag
- **GeneratorForm** (`apps/web/src/components/generator/GeneratorForm.tsx`): added image upload UI with drag-and-drop, preview, and file-to-base64 conversion
- **Generation client API** (`apps/web/src/lib/api/generation.ts`): added `imageBase64`/`imageMimeType` to `GenerationOptions` interface

## [0.2.0] - Phase 1 & 2

### Added

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
