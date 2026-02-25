# Siza Testing State

## Current Stats (as of v0.8.0, 2026-02-25)
- 376 tests passing, 26 suites on main (post-merge)
- Coverage thresholds: branches 60%, functions 65%, lines 75%, statements 75%
- CI: ALL 8 JOBS GREEN (Lint, TypeCheck, Build, UnitTests, Security, ShellLint, E2E, Deploy)

## API Route Test Patterns

### Mock Pitfalls
- `setRateLimitHeaders`: Projects routes do `return setRateLimitHeaders(response, ...)` — auto-mock returns undefined. Must use `mockImplementation((res) => res)`.
- Components routes call `setRateLimitHeaders()` as void statement — auto-mock is safe.
- `searchParams.get()` returns `null` for missing params, but Zod `.optional().default()` only handles `undefined`. Use `Object.fromEntries(searchParams.entries())`.

### Supabase Mock Patterns
- Single-query routes: `mockReturnThis()` chain works fine
- Multi-query routes (DELETE): use `fromCallCount` with separate chain objects per query
- When route does `from('A').select().eq().single()` then `from('B').select().eq().eq().single()`, a single chain with `eqCallCount` breaks because counts cross queries

### Mock Dependencies by Route
- Components routes: `@/lib/supabase/server`, `@/lib/api/auth`, `@/lib/api/rate-limit`, `@/lib/sentry/server`, `@/lib/api/storage`
- Projects routes: `@/lib/supabase/server`, `@/lib/api/auth`, `@/lib/api/rate-limit`, `@/lib/usage/limits`, `@/lib/usage/tracker`
- Let pure modules work naturally: `@/lib/api/response`, `@/lib/api/errors`, `@/lib/api/validation/*`

## PR #91: Unskip 4 API Route Test Suites
- Branch: feat/unskip-api-route-tests
- Status: MERGED (2026-02-25)
- +57 tests (322→379), +5 suites (25→30)
- Fixed projects/route.ts null query param bug
