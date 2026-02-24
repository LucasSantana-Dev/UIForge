---
description: Run the complete test suite for Siza
---

# Run Tests Workflow

This workflow runs all tests for the Siza application.

## Steps

### 1. Run Unit Tests
```bash
npm run test
```

### 2. Run E2E Tests (requires running dev server)
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

### 3. Check Test Coverage
```bash
npm run test:coverage
```

### 4. Verify All Quality Checks
```bash
npm run lint
npm run type-check
npm run format:check
npm run build
```

## Expected Results

- ✅ All unit tests pass
- ✅ All E2E tests pass
- ✅ Coverage meets thresholds (80%)
- ✅ No linting errors
- ✅ No type errors
- ✅ Build succeeds

## Troubleshooting

If tests fail, check:
1. Environment variables are set in `.env.local`
2. Supabase project is running
3. Dependencies are installed (`npm install`)
4. No conflicting processes on ports 3000, 54321, 54322
