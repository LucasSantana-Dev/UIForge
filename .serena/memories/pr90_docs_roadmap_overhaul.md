# PR #90 — Docs Overhaul, Homepage Perf, Roadmap Interactivity (2026-02-25)

## What Changed
- **Docs page**: Rose Pine Moon syntax highlighting, redesigned homepage, components showcase, layout branding
- **Homepage perf**: 3 CSS keyframes added (mesh-rotate, particle-drift, cursor-blink), particles 20→8, throttled scroll, removed force-dynamic
- **Roadmap**: Interactive phase cards with progress bars, status filters, expand/collapse, phase navigator dots
- **Social**: Twitter → LinkedIn links across LandingFooter, landing, docs

## CodeRabbit Fixes (Round 2)
- `force-dynamic` removed from docs page (static content)
- `Button asChild` for LinkedIn link (consistent component usage)
- `EASE_SIZA` imported from shared `@/components/landing/constants`
- `useMemo` on status counts in roadmap page
- `setTimeout` to clear `activePhase` after scroll (transient highlight)
- `min(calc(...), 1)` ceiling on particle-drift opacity
- `<h2>` → `<span role="heading" aria-level={2}>` inside button (PhaseCard)
- `aria-controls`/`id` pairing for expandable content
- `aria-label="Open menu"` on mobile SheetTrigger
- Fixed unused params lint error in Generator.test.tsx

## Key Files
- `apps/web/src/app/(marketing)/docs/page.tsx`
- `apps/web/src/app/(marketing)/roadmap/page.tsx`
- `apps/web/src/components/roadmap/PhaseCard.tsx`
- `apps/web/src/components/roadmap/PhaseNavigator.tsx`
- `apps/web/src/components/roadmap/StatusFilter.tsx`
- `apps/web/src/components/landing/LandingNav.tsx`
- `apps/web/src/app/globals.css`

## State
- Merged to main as squash commit `58da2ff`
- CI: Build, Lint, TypeCheck, UnitTests, Security all GREEN
- 322 tests passing, 25 suites
- Superseded PR #87 (closed by PostToolUse hook interference)
