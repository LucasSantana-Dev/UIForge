# Siza Testing State

## Current Stats (v0.41.0, 2026-03-15)
- **1218 tests passing**, 123 suites, 0 failures on main
- Coverage: 87.57% statements, 79.58% branches, 89.89% functions, 88.83% lines
- CI: ALL jobs green (Lint, TypeCheck, Build, UnitTests, Security, ShellLint, E2E, CodeQL, etc.)

## Coverage Thresholds (jest.config)
- Branches: 60% (actual: 79.58%)
- Functions: 65% (actual: 89.89%)
- Lines: 75% (actual: 88.83%)
- Statements: 75% (actual: 87.57%)

## Low-Coverage Files (as of 2026-03-15)
- `lib/supabase/storage.ts` — 56.8% stmts (missing: getPublicUrl, createSignedUrl, listFiles, moveFile, copyFile, helper fns)
- `lib/usage/limits.ts` — 55.2% stmts (missing: checkProjectQuota)
- `lib/features/provider.tsx` — 53.3% stmts (missing: enabled centralized flags path, polling)

## Test Structure
```
apps/web/src/__tests__/
  components/      # 14 suites (auth, billing, catalog, dashboard, marketing, etc.)
  hooks/           # Hook tests
  integration/     # Integration tests
  lib/             # 20 suites (api, features, quality gates, services, stripe, etc.)
  services/        # Service tests
  stores/          # Zustand store tests
```

## Running Tests
```bash
# Always from apps/web/, NEVER from repo root
cd apps/web && npx jest --forceExit --passWithNoTests

# Single file
cd apps/web && npx jest <test-file> --forceExit --verbose

# With coverage
cd apps/web && npx jest --forceExit --coverage
```

## Critical Gotchas
- **Run from `apps/web/`**, never repo root (babel parsing errors at root)
- **Always `--forceExit`** — Supabase client mocks leave async handles open
- **Auth test mocking**: Use `createClient().auth.signInWithPassword()` pattern, NOT direct `signIn()` imports
- **React 19**: `renderHook` from `@testing-library/react` — no separate hooks package needed
- **`__mocks__/` directory** is globally ignored in eslint.config.js

## API Route Test Patterns

### Multi-query routes (DELETE)
Use separate chain objects per query — a single chain with `eqCallCount` breaks across queries:
```typescript
// Bad: single chain, counts bleed between queries
// Good: mockFrom returns different objects per call
let callCount = 0;
mockFrom.mockImplementation(() => {
  callCount++;
  if (callCount === 1) return firstQueryChain;
  return secondQueryChain;
});
```

### Supabase Mock Patterns
```typescript
const mockSingle = jest.fn();
const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));
```

## E2E Tests (Playwright)
- 15 spec files covering critical flows
- Location: `apps/web/e2e/`
- Run: `npm run test:e2e`
- Auth flows, dashboard, billing, catalog, teams, golden paths, onboarding, gallery
