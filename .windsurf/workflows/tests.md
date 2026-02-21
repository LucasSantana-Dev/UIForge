---
description: Test Coverage
---

# Test Coverage

Check and improve test coverage across the project.

// turbo
1. **Run coverage**: `npm run test -- --coverage`

2. Review coverage report — identify files below 85% threshold.

3. For each under-covered file:
   - Add unit tests for untested functions/branches
   - Add integration tests for untested flows
   - Mock Supabase, fetch, and external dependencies

// turbo
4. **Re-run coverage**: `npm run test -- --coverage`

5. Confirm all thresholds met:
   - Statements ≥ 85%
   - Functions ≥ 85%
   - Lines ≥ 85%
   - Branches ≥ 80%

## Coverage targets per area (from plan.MD)

- **API tests**: 54 tests, all must pass
- **Web unit tests**: components, hooks, stores, utilities
- **E2E**: all critical user flows (auth, generation, templates, projects)
