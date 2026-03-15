---
name: cron-routes
description: Add Vercel Cron scheduled API routes to Siza — scaffold, auth pattern, test, and vercel.json config
version: 1.0.0
tags: [cron, vercel, automation, email, campaigns]
---

# Cron Routes

Add or extend Vercel Cron scheduled API routes in Siza. Every cron route must:
1. Authenticate with `CRON_SECRET` bearer token
2. Be listed in `vercel.json`
3. Have a unit test (CI route coverage gate will fail otherwise)
4. Be feature-flagged if it sends external traffic (email, webhooks)

## Standard Cron Route Pattern

```typescript
// apps/web/src/app/api/<category>/<name>/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Auth guard — always first
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Idempotent work — safe to retry
  try {
    // ... do work ...
    return NextResponse.json({ processed: N });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

## vercel.json Schedule

```json
{
  "crons": [
    { "path": "/api/campaigns/reengagement", "schedule": "0 10 * * 1" },
    { "path": "/api/your-new-route", "schedule": "0 9 * * *" }
  ]
}
```

**Cron syntax** (UTC):
- `0 10 * * 1` — Mondays at 10am
- `0 9 * * *` — Daily at 9am
- `0 */6 * * *` — Every 6 hours
- `0 0 1 * *` — First of each month

## Environment Variables

| Var | Purpose |
|-----|---------|
| `CRON_SECRET` | Bearer token, required for all cron endpoints |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin DB operations (bypass RLS) |
| `NEXT_PUBLIC_SUPABASE_URL` | Required with service role client |

For admin Supabase access (not SSR client):
```typescript
import { createClient } from '@supabase/supabase-js';
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Service role not configured');
  return createClient(url, key);
}
```

## Test Pattern

Scaffold with: `npm run routes:scaffold <category>/<name>`

Then replace the scaffold with this cron-specific pattern:

```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => { /* mock per table */ }),
    auth: { admin: { listUsers: jest.fn() } },
  })),
}));

const CRON_SECRET = 'test-cron-secret';

function makeRequest(secret?: string) {
  return new Request('http://localhost/api/...', {
    headers: secret !== undefined ? { authorization: `Bearer ${secret}` } : {},
  });
}

beforeEach(() => {
  process.env.CRON_SECRET = CRON_SECRET;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
});

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

// Required test cases:
it('returns 401 when CRON_SECRET not configured');
it('returns 401 when authorization header missing');
it('returns 401 when wrong token');
it('happy path: processes N items, returns { processed }');
it('returns 0 processed when nothing to do');
```

## Checklist

When adding a new cron route:
- [ ] Route follows `GET(request: Request)` signature (no `NextRequest` needed for crons)
- [ ] `CRON_SECRET` bearer auth is the first check
- [ ] Work is idempotent (safe to re-run on cron retry)
- [ ] Rate bounded (MAX_BATCH constant, never process unlimited rows)
- [ ] `vercel.json` entry added
- [ ] Unit test created and all auth cases covered
- [ ] `npm run routes:check` passes
- [ ] Feature flag guards external side effects (email, webhooks, charges)

## Existing Cron Routes

| Route | Schedule | Purpose |
|-------|----------|---------|
| `/api/campaigns/reengagement` | Mondays 10am UTC | Email users who signed up but never generated |

## Triggering Manually (local dev)

```bash
# Invoke with correct secret (set in .env.local)
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/campaigns/reengagement
```
