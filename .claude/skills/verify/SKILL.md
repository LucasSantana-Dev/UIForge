---
name: verify
description: Run Siza quality gates — lint, type-check, test, build — and report results
version: 1.2.0
tags: [quality, lint, test, build, ci, verification]
---

# Verify

Run the full suite of quality gates for the Siza monorepo. Use before commits, PRs, or releases to catch issues early.

## Quick Mode (default)
Run lint and type-check only — fast feedback loop:
```bash
npm run lint && npm run type-check
```

## Full Mode
Run all gates including tests, route coverage check, and build:
```bash
npm run lint && npm run type-check && npm run routes:check && cd apps/web && npx jest --forceExit --passWithNoTests && cd ../.. && npm run build
```

## Gate Sequence

### Gate 1: Lint (ESLint + Prettier)
```bash
npm run lint
```
- Auto-fix: `npm run lint -- --fix`
- Known issue: `apps/docs` has pre-existing Fumadocs TS errors — skip with `--filter=!@siza/docs` if needed
- ESLint 9 flat config at `apps/web/eslint.config.js`
- CI uses `--max-warnings 0` — treat warnings as errors locally too

### Gate 2: Type Check
```bash
npm run type-check
```
- Runs `tsc --noEmit` across all workspaces via Turbo
- Known issue: `apps/docs` types depend on `.source/server` generated at build time
- If blocked by docs: `cd apps/web && npx tsc --noEmit`

### Gate 3: Unit Tests
```bash
cd apps/web && npx jest --forceExit --passWithNoTests
```
- **Run from `apps/web/`** — NOT repo root (babel parsing errors at root)
- Always use `--forceExit` (Supabase client mocks leave async handles)
- Coverage thresholds: branches 60%, functions 65%, lines 75%, statements 75%
- Current: 169 suites, 1659 tests (as of 2026-03-15, v0.47.1)
- API route tests live in `__tests__/lib/api/` (NOT `integration/` — excluded from default run)
- 100% route coverage: 68/68 routes tested — enforced in CI via `npm run routes:check`

### Gate 3b: Route Coverage (new routes only)
```bash
npm run routes:check          # check all 68 routes covered
npm run routes:scaffold <path> # scaffold test for new route
```
- Blocks CI when any `route.ts` lacks a test
- Scaffold first, then fill in the TODO assertions

### Gate 4: Build
```bash
npm run build
```
- Builds all workspaces via Turbo
- Verify `apps/web/.next/BUILD_ID` exists after build
- Turbopack is default in Next.js 16

### Gate 5: E2E Tests (optional, CI-only)
```bash
npm run test:e2e
```
- Requires running dev server or built app
- 22 spec files covering auth, dashboard, billing, catalog, teams, golden paths, gallery, lead-readiness, marketplace, production smoke
- Typically run in CI only — use `npm run test:e2e:ui` for local debugging

## Interpreting Results

```
VERIFY RESULTS:
  [PASS/FAIL] Lint: N errors, M warnings
  [PASS/FAIL] Type check: clean / N errors
  [PASS/FAIL] Tests: N passed, M failed, K suites
  [PASS/FAIL] Build: success / failed

Overall: GREEN / BLOCKED (N issues)
```

## Common Fixes

| Issue | Fix |
|-------|-----|
| Unused import | Remove it or prefix with `_` |
| Unused variable | Prefix with `_` or remove |
| `body.error` is object not string | Use `body.error.message` — `errorResponse` nests in `{ error: { message, status } }` |
| Type error in test mock | Check mock return shape matches interface |
| `body.data.foo` undefined | Check if route uses `jsonResponse` (no wrapper) vs `successResponse` (wraps in `{ data: ... }`) |
| Prettier formatting | `npx prettier --write <file>` |
| Build fails on docs | Set `HUSKY=0` for non-code commits |
| Tests hang | Add `--forceExit` flag |
| Jest at root fails | Always run from `apps/web/` |
| Stale eslint-disable directive | Remove comment when rule no longer triggers |
| New route needs test | Run `npm run routes:scaffold <path>` then fill in TODOs |
| Route coverage CI fails | Check `npm run routes:check` locally, create test file |

## Pre-commit Hook
The repo has a Husky pre-commit hook that runs:
1. `lint-staged` (ESLint + Prettier on staged files)
2. `npm run type-check` (full monorepo)

To bypass for docs/config commits: `HUSKY=0 git commit -m "docs: ..."`

## CI Alignment
These gates mirror the CI workflow at `.github/workflows/ci.yml`. Running them locally catches issues before push.

CI checks run: Lint, Type Check, Unit Tests, Build, Security Audit, Shell Lint, Desktop Security Guard, E2E Tests, CodeQL, Semgrep, Trivy, SonarCloud (advisory), TruffleHog, GitGuardian, ai-review.
