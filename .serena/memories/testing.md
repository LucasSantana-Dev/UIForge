# Siza Testing State

## Current Stats (2026-03-15, v0.47.1+)
- **1671 tests** — 170 suites, all passing
- **100% API route coverage: 69/69 routes** (incl. campaigns/reengagement)
- Coverage: ~91% stmts, ~83% branches, ~94% fns, ~93% lines
- Skills: `api-route-testing` v1.6.0, `cron-routes` v1.0.0

## Automation
- `npm run routes:check` — verify 100% route coverage (CI gate)
- `npm run routes:scaffold <path>` — scaffold test from route source
- New cron route? → `npm run routes:scaffold` + fill auth guard test cases

## Test Running
```bash
cd apps/web && npx jest --forceExit --passWithNoTests  # full (1671 tests)
cd apps/web && npx jest --forceExit src/__tests__/lib/api/  # route tests only
npm run routes:check  # verify all routes have tests
```

## Critical Gotchas
- **Run from `apps/web/`** never repo root
- **Always `--forceExit`** — Supabase mocks leave async handles
- **Barrel mock unreliable**: mock `@/lib/api/auth`, `@/lib/api/validation/X` directly, NOT `@/lib/api`
- **errorResponse()**: `{ error: { message, status } }` — NOT `{ error: "string" }`
- **successResponse()**: `{ data: ... }` wraps payload; **jsonResponse()**: raw, no wrapper
- **Dynamic route params**: `{ params: Promise.resolve({ id }) }`
- **NextResponse.redirect**: use `jest.spyOn` + stub (not origRedirect) to avoid absolute-URL error
- **global.fetch**: `Object.defineProperty` in `beforeEach` (jsdom resets it)
- **AbortSignal.timeout**: polyfill: `(AbortSignal as any).timeout = () => new AbortController().signal`
- **Cron routes**: use `@supabase/supabase-js` direct (not `@/lib/supabase/server`), mock it directly

## Active PRs with tests
- #510: feat/reengagement-campaign (+9 cron route tests, +12 email tests)
- #511: chore/deps-bump-march-15 (ecosystem updates, 1671 tests pass)
