# Fumadocs Documentation Site

## Architecture
- **Framework**: Fumadocs v16 (Next.js-based docs framework)
- **Location**: `apps/docs/` in monorepo
- **No Tailwind**: Uses `--color-fd-*` CSS custom properties (Fumadocs' own theming)
- **Content**: 12 MDX pages across getting-started, guides, API reference

## Build
```bash
cd apps/docs && npm run build    # Production build (prerender all pages)
npm run dev                       # Dev server (may have SSR null errors)
```

## Deployment
- Cloudflare Workers via `wrangler.jsonc` in `apps/docs/`
- GitHub Actions workflow: `deploy-docs.yml`
- All 13 pages prerendered at build time

## Gotchas
- `.source/server.ts` generated at build time — not committed to git
- Stale `.source` cache causes type errors → `rm -rf .next .source`
- Pre-commit type-check fails on docs changes → use `HUSKY=0`
- Siza dark theme applied via Fumadocs CSS variables

## Content Structure
```
apps/docs/content/docs/
  index.mdx              # Introduction
  getting-started/       # Quick start, installation
  guides/                # Usage guides
  api/                   # API reference
```
