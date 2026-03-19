---
name: test-recovery
description: Systematically analyze, fix, and recover failing or skipped test suites
version: 1.0.0
tags: [testing, jest, debug, coverage, recovery]
---

# Test Recovery

Systematically diagnose and fix failing, skipped, or broken test suites in the Siza monorepo.

## When to Use
- Tests are failing after a feature merge
- Test suites were skipped (`describe.skip`, `it.skip`) and need recovery
- Coverage dropped below thresholds
- Mock drift caused by interface changes

## Workflow

### Phase 1: Inventory
Get the current test landscape:
```bash
cd apps/web && npx jest --forceExit --passWithNoTests 2>&1 | tail -5
```

Find skipped tests:
```bash
cd apps/web && grep -rn 'describe\.skip\|it\.skip\|test\.skip\|xdescribe\|xit\|xtest' src/__tests__/ --include='*.ts' --include='*.tsx'
```

### Phase 2: Classify Failures
For each failing suite, classify the root cause:

| Category | Symptoms | Fix Strategy |
|----------|----------|-------------|
| **Mock drift** | `TypeError: X is not a function`, `Cannot read property` | Update mock to match current interface |
| **Missing mock** | `Cannot find module`, `ReferenceError` | Add `jest.mock()` for the dependency |
| **Async leak** | Jest hangs, `--detectOpenHandles` | Add `--forceExit`, close connections in `afterAll` |
| **Environment** | `process.env.X is undefined` | Add env setup in `beforeEach` |
| **Import error** | `SyntaxError: Cannot use import` | Check `jest.config` transform rules, moduleNameMapper |
| **Stale snapshot** | `Snapshot mismatch` | `npx jest --updateSnapshot` after visual review |
| **Type mismatch** | `Type 'X' is not assignable to type 'Y'` | Update test to match new types |

### Phase 3: Fix (per suite)

For each failing suite:

1. **Run in isolation**: `cd apps/web && npx jest <test-file> --forceExit --verbose`
2. **Read the error**: Focus on the first failure — later failures often cascade
3. **Check the source**: Read the function being tested to understand current behavior
4. **Update the test**: Fix mocks, assertions, or setup to match current code
5. **Verify**: Run the suite again to confirm the fix
6. **Run full suite**: Ensure no regressions

### Phase 4: Validate

```bash
# Full test run
cd apps/web && npx jest --forceExit --passWithNoTests

# Coverage check
cd apps/web && npx jest --forceExit --coverage 2>&1 | grep -A4 'All files'
```

Coverage thresholds (from jest.config):
- Branches: 60%
- Functions: 65%
- Lines: 75%
- Statements: 75%

## Common Mock Patterns

### Supabase Client
```typescript
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));
```

### Next.js Navigation
```typescript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}));
```

### TanStack React Query
```typescript
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  }),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));
```

### Feature Flags
```typescript
jest.mock('@/lib/features/client', () => ({
  useFeatureFlag: jest.fn().mockReturnValue(true),
}));
```

## Gotchas
- **Run from `apps/web/`**, never repo root
- **Always `--forceExit`** — Supabase mocks leak handles
- **`__mocks__/` directory** is globally ignored in eslint.config.js
- **Auth test mocking**: Use `createClient().auth.signInWithPassword()` pattern, NOT direct `signIn()` imports
- **React 19**: `renderHook` from `@testing-library/react` — no separate hooks package
- **Dynamic imports**: Mock the module, not the dynamic import call

## Output
After recovery:
```
TEST RECOVERY RESULTS:
  Fixed: N suites (list them)
  Still failing: M suites (with reasons)
  Skipped: K suites (with justification)
  Coverage: X% branches, Y% functions, Z% lines
```
