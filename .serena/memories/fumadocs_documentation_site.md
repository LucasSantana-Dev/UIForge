# Fumadocs Documentation Site

## Architecture
- **Framework**: Fumadocs v16 (Next.js-based docs framework)
- **Location**: `apps/docs/` in monorepo
- **No Tailwind**: Uses `--color-fd-*` CSS custom properties (Fumadocs' own theming)
- **Content**: 19 MDX pages across getting-started, guides, api-reference, ecosystem

## UI Components
- **CodeBlock** (`src/components/mdx/CodeBlock.tsx`): Language detection, copy-to-clipboard, dark header bar
- **Callout** (`src/components/mdx/Callout.tsx`): 4 variants (info/warning/tip/danger) with left border accent
- **mdx-components.tsx**: Registers CodeBlock + Callout for MDX rendering
- **globals.css**: ~726 lines — landing page styles + minimal content overrides. Fumadocs prose typography handles headings, tables, inline code, lists, links natively

## Build
```bash
cd apps/docs && npm run build    # Production build (prerender all pages)
npm run dev                       # Dev server (may have SSR null errors)
```

## Deployment
- Cloudflare Workers via `wrangler.jsonc` in `apps/docs/`
- GitHub Actions workflow: `deploy-docs.yml`

## Gotchas
- `.source/server.ts` generated at build time — not committed to git
- Stale `.source` cache causes type errors -> `rm -rf .next .source`
- Pre-commit type-check fails on docs changes -> use `HUSKY=0`
- Siza dark theme applied via Fumadocs CSS variables

## Content Structure
```
apps/docs/content/docs/
  index.mdx                      # Introduction
  getting-started/               # quick-start, installation, configuration, deployment, self-hosting
  guides/                        # first-component, components, templates, quality-gates, desktop-app, github-export, mcp-integration, troubleshooting
  api-reference/                 # rest-api, mcp-tools, webhooks
  ecosystem/                     # architecture, contributing
```

## Current State (2026-03-01)
- v0.20.0: Docs UI/UX overhaul shipped (PR #226)
- 19 MDX content files
- Premium typography with Outfit headings
- Enhanced sidebar with gradient active indicators