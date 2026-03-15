---
name: api-route-testing
description: Write unit tests for Next.js App Router API route handlers in Siza — mock patterns, auth, rate-limit, Supabase chaining
version: 1.2.0
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

### Chain with order + range (gallery/history pagination)
```typescript
const mockRange = jest.fn().mockResolvedValue({ data: [], count: 0, error: null });
const mockOrder2 = jest.fn(() => ({ range: mockRange }));
const mockOrder = jest.fn(() => ({ order: mockOrder2, range: mockRange }));
const mockEq = jest.fn(() => ({ order: mockOrder, eq: mockEqFramework }));
```

### Chain with order + limit (scorecard/history)
```typescript
const mockLimit: jest.Mock = jest.fn(() => ({ single: mockSingle }));
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEq = jest.fn(() => ({ order: mockOrder }));
```

### Mutation: upsert
```typescript
const mockUpsert = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));
```

### Mutation: update + eq
```typescript
const mockEq = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));
```

### Multi-table parallel queries (Promise.all)
```typescript
mockFrom.mockImplementation((table: string) => {
  if (table === 'projects') return projectsChain;
  if (table === 'subscriptions') return subscriptionsChain;
  if (table === 'plan_limits') return { select: jest.fn().mockResolvedValue({ data: LIMITS, error: null }) };
  return defaultChain;
});
```

### Table chain for parallel ilike/or queries (suggestions pattern)
```typescript
function tableChain(data: unknown[]) {
  const resolved = Promise.resolve({ data, error: null });
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn(() => resolved),
  };
}
```

### auth.getUser() pattern (no verifySession)
```typescript
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({ auth: { getUser: mockGetUser }, from: mockFrom })
  ),
}));
```

### Routes with custom error handlers
```typescript
jest.mock('@/app/api/generations/error-handler', () => ({
  handleGenerationRouteError: jest.fn((_err: unknown) => {
    const Response = require('next/server').NextResponse;
    return Response.json({ error: { message: 'error' } }, { status: 500 });
  }),
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
| Empty/null data | Correct fallback behavior |
| Pagination offset | Correct `range(offset, offset+limit-1)` called |
| Param clamping | Max/min limits enforced |

## Response Body Shapes

**Critical**: There are 3 different response helpers — each wraps data differently.

| Helper | Body shape | Used for |
|--------|-----------|----------|
| `errorResponse(msg, status)` | `{ error: { message, status } }` | All errors |
| `successResponse(data)` | `{ data: ...data }` — wraps in `{ data }` | Successful responses |
| `jsonResponse(data)` | Raw `data` passed in — **no wrapper** | Direct JSON pass-through |
| `NextResponse.json(data)` | Raw `data` — **no wrapper** | Direct in route |

```typescript
// errorResponse
expect(body.error.message).toMatch(/unauthorized/i);  // ✓
expect(body.error).toMatch(/unauthorized/i);           // ✗ — body.error is an object

// successResponse
expect(body.data.templates).toHaveLength(2);  // ✓ — extra .data wrapper
expect(body.templates).toHaveLength(2);       // ✗

// jsonResponse (teams route uses this)
expect(body.data).toHaveLength(2);   // ✓ — jsonResponse({ data: teams }) → body.data = teams
expect(body.data.data).toHaveLength(2);  // ✗ — no double-wrapping

// NextResponse.json directly (tour, scorecards)
expect(body.completed).toBe(true);   // ✓
expect(body.data.completed).toBe(true);  // ✗
```

**Pattern**: Check the route source to see which helper it uses before asserting on body shape.

`successResponse()` wraps in `{ data: ... }`:
```typescript
expect(body.data.completed).toBe(true);  // ✓
expect(body.completed).toBe(true);       // ✗ — extra .data wrapper
```

Routes using `NextResponse.json()` directly return the raw shape (no wrapper):
```typescript
expect(body.completed).toBe(true);  // ✓ for NextResponse.json({ completed: true })
```

## Auth Patterns

```typescript
import { verifySession } from '@/lib/api/auth';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;

// Success
mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);

// UnauthorizedError (routes with catch that check instanceof UnauthorizedError)
mockVerifySession.mockRejectedValue(new UnauthorizedError('Unauthorized'));

// Generic failure (routes with bare catch)
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

67 route files total. 14 actively tested in `__tests__/lib/api/` (default jest run).

| Route | Test file | Tests |
|-------|-----------|-------|
| `GET /api/gallery` | `gallery-route.test.ts` ✓ | 5 |
| `GET /api/search` | `search-route.test.ts` ✓ | 6 |
| `GET /api/usage/current` | `usage-current-route.test.ts` ✓ | 6 |
| `POST /api/onboarding/complete` | `onboarding-complete-route.test.ts` ✓ | 3 |
| `POST /api/tour/complete` | `tour-complete-route.test.ts` ✓ | 3 |
| `GET /api/scorecards` | `scorecards-route.test.ts` ✓ | 7 |
| `GET /api/suggestions` | `suggestions-route.test.ts` ✓ | 7 |
| `GET /api/generations/history` | `generations-history-route.test.ts` ✓ | 5 |
| `PATCH /api/generations/[id]/feature` | `generation-feature-route.test.ts` ✓ | 6 |
| `GET /api/metrics` | `metrics-route.test.ts` ✓ | 6 |
| `GET+POST /api/teams` | `teams-route.test.ts` ✓ | 8 |
| `GET /api/plugins` | `plugins-route.test.ts` ✓ | 4 |
| `GET+POST /api/golden-paths` | `golden-paths-route.test.ts` ✓ | 6 |
| `GET+POST /api/templates` | `templates-route.test.ts` ✓ | 7 |
| `GET /api/catalog` | `integration/catalog-route.test.ts` (excluded from default run) | — |
| `GET /api/catalog/[id]` | `integration/catalog-id-route.test.ts` (excluded) | — |

**Next targets:** `generate/analyze`, `generate/validate`, `generate/format`, `generations/[id]`, `components`, `projects`
