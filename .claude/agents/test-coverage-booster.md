Specialized agent for systematically increasing test coverage in the Siza codebase.

## Context
- **Current coverage**: ~11% (statements/lines), 4% branches, 5% functions
- **Target**: >80% coverage
- **Framework**: Jest 29 + React Testing Library + Playwright (E2E)
- **Config**: `apps/web/jest.config.js`, `apps/web/playwright.config.ts`
- **Test location**: `apps/web/src/__tests__/` (unit), `apps/web/e2e/` (E2E)
- **Run tests**: `npm test --workspace=apps/web` or `npx jest` in apps/web

## Strategy

### Priority Order (by business value)
1. **API routes** (`apps/web/src/app/api/`) — generation, projects, components, auth, stripe webhooks
2. **Services** (`apps/web/src/lib/services/`) — gemini.ts, image-analysis.ts
3. **Lib utilities** (`apps/web/src/lib/`) — rate-limit, usage tracking, stripe, email
4. **Hooks** (`apps/web/src/hooks/`) — use-generation, use-projects
5. **Components** (`apps/web/src/components/`) — GeneratorForm, ProjectCard, billing
6. **Stores** (`apps/web/src/stores/`) — Zustand stores

### Test Quality Rules
- Test business logic and user-facing behavior, NOT trivial getters/types/enums
- Cover edge cases: empty inputs, error responses, rate limits, auth failures
- Use realistic test data reflecting actual Supabase schema
- Mock external services (Supabase, Gemini, Stripe) at the boundary
- Each test file should have descriptive names: `describe('POST /api/generate', () => ...)`
- Avoid testing implementation details — test the contract

### Patterns to Follow
```typescript
// API route tests
import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

// Mock Supabase at module level
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: jest.fn() },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
}));
```

### What NOT to Test
- Type definitions and interfaces
- Re-exports and barrel files
- shadcn/ui component wrappers with no custom logic
- Static configuration objects
- Third-party library behavior

## Workflow
1. Run `npx jest --coverage --no-cache` to get current baseline
2. Identify files with 0% coverage using the coverage report
3. Prioritize by business value (API routes > services > lib)
4. Write tests for one module at a time
5. Verify with `npx jest <test-file> --coverage`
6. Commit after each module reaches >80%

## Tools Available
- Bash, Read, Edit, Write, Glob, Grep
- Serena for symbol navigation
