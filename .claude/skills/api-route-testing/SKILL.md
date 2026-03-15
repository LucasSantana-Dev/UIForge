---
name: api-route-testing
description: Write unit tests for Next.js App Router API route handlers in Siza — mock patterns, auth, rate-limit, Supabase chaining
version: 1.0.0
tags: [testing, api, routes, jest, nextjs]
---

# API Route Testing

Write Jest unit tests for Next.js App Router route handlers (`route.ts` files).

## Placement

Tests for API routes go in `apps/web/src/__tests__/lib/api/` (NOT in `integration/` — that directory is excluded from the default jest run).

Name pattern: `apps/web/src/__tests__/lib/api/<route-name>-route.test.ts`

## Quick Anatomy of a Route Test

```typescript
import { GET } from '@/app/api/your/route';
import { NextRequest } from 'next/server';

// 1. Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

// 2. Mock auth (if route calls verifySession)
jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));

// 3. Mock rate-limit (if route calls checkRateLimit)
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));

// 4. Mock Sentry (if route calls captureServerError)
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

// 5. Tests
describe('GET /api/your-route', () => {
  it('returns data on success', async () => {
    const res = await GET(new NextRequest('http://localhost/api/your-route'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });
});
```

## Supabase Mock Patterns

### Single-table, simple chain
```typescript
const mockSingle = jest.fn().mockResolvedValue({ data: { id: '1' }, error: null });
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
```

### Multi-eq chain (e.g., `.eq('id').eq('user_id').single()`)
```typescript
const mockEqUserId = jest.fn(() => ({ single: mockSingle }));
const mockEqId = jest.fn(() => ({ eq: mockEqUserId }));
const mockSelect = jest.fn(() => ({ eq: mockEqId }));
```

### Chain with order + limit (scorecard history pattern)
```typescript
const mockLimit = jest.fn(() => ({ single: mockSingle }));
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
```

### Mutation: upsert/update/insert
```typescript
const mockUpsert = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

// update with eq:
const mockEq = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));
```

### Multi-table parallel queries (Promise.all)
Use `mockFrom.mockImplementation((table)=>...)` to dispatch per table:
```typescript
mockFrom.mockImplementation((table: string) => {
  if (table === 'projects') return projectsChain;
  if (table === 'subscriptions') return subscriptionsChain;
  if (table === 'plan_limits') return { select: jest.fn().mockResolvedValue({ data: LIMITS, error: null }) };
  return defaultChain;
});
```

### Public gallery-style (no auth, chained eq + order + range)
```typescript
const mockRange = jest.fn().mockResolvedValue({ data: [], count: 0, error: null });
const mockOrder2 = jest.fn(() => ({ range: mockRange }));
const mockOrder = jest.fn(() => ({ order: mockOrder2, range: mockRange }));
const mockEq2 = jest.fn(() => ({ order: mockOrder, eq: mockEqFramework }));
const mockEq1 = jest.fn(() => ({ eq: mockEq2 }));
const mockSelect = jest.fn(() => ({ eq: mockEq1 }));
```

### auth.getUser() pattern (scorecards route — no verifySession)
```typescript
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser }, from: mockFrom })
  ),
}));
```

## Standard Test Cases per Route

| Scenario | Assert |
|----------|--------|
| Happy path | `res.status === 200`, data present |
| Missing required param | `res.status === 400` |
| Unauthenticated | `res.status === 401` |
| Insufficient permissions | `res.status === 403` |
| DB error | `res.status === 500` |
| Rate limited | `res.status === 429` |
| Edge case (empty/null data) | Correct fallback behavior |

## Response Body Shapes

`errorResponse()` from `@/lib/api/response` returns `{ error: { message, status } }` — NOT `{ error: "string" }`:
```typescript
expect(body.error.message).toMatch(/unauthorized/i);  // correct
expect(body.error).toMatch(/unauthorized/i);           // wrong — body.error is an object
```

`successResponse()` wraps in `{ data: ... }`:
```typescript
expect(body.data.completed).toBe(true);
```

Routes using `NextResponse.json()` directly return the raw shape:
```typescript
expect(body.completed).toBe(true);
```

## Auth Patterns

```typescript
import { verifySession } from '@/lib/api/auth';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;

// Success
mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);

// UnauthorizedError (routes that use verifySession + catch block)
mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));

// Generic auth failure (routes that use try/catch without typed error)
mockVerifySession.mockRejectedValue(new Error('not authenticated'));
```

## Running Tests

```bash
# Single route
cd apps/web && npx jest --forceExit src/__tests__/lib/api/<name>-route.test.ts --verbose

# All route tests
cd apps/web && npx jest --forceExit src/__tests__/lib/api/ --verbose

# Full suite (confirms no regressions)
cd apps/web && npx jest --forceExit --silent
```

## Route Coverage Map (as of 2026-03-15)

| Route | Test file |
|-------|-----------|
| `GET /api/gallery` | `gallery-route.test.ts` ✓ |
| `GET /api/search` | `search-route.test.ts` ✓ |
| `GET /api/usage/current` | `usage-current-route.test.ts` ✓ |
| `POST /api/onboarding/complete` | `onboarding-complete-route.test.ts` ✓ |
| `POST /api/tour/complete` | `tour-complete-route.test.ts` ✓ |
| `GET /api/scorecards` | `scorecards-route.test.ts` ✓ |
| `GET /api/catalog` | `integration/catalog-route.test.ts` (excluded from default run) |
| `GET /api/catalog/[id]` | `integration/catalog-id-route.test.ts` (excluded) |

Next targets: `suggestions`, `generate/analyze`, `generate/validate`, `teams`, `plugins`.
