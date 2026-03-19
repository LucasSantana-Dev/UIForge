#!/usr/bin/env node
/**
 * scaffold-route-test.ts
 *
 * Scaffolds a Jest unit test file for a Next.js App Router API route handler.
 *
 * Usage:
 *   npx tsx scripts/scaffold-route-test.ts apps/web/src/app/api/my-route/route.ts
 *   npx tsx scripts/scaffold-route-test.ts catalog/ci
 *
 * Features:
 *   - Detects exported HTTP methods
 *   - Detects auth/rate-limit/supabase/sentry imports
 *   - Detects dynamic route params ([id], [slug])
 *   - Generates standard mock blocks and describe/it scaffolds
 *   - Writes to apps/web/src/__tests__/lib/api/<name>-route.test.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const API_SRC = resolve(ROOT, 'apps/web/src/app/api');
const TEST_DIR = resolve(ROOT, 'apps/web/src/__tests__/lib/api');

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: npx tsx scripts/scaffold-route-test.ts <route-path>');
  process.exit(1);
}

let routeFile: string;
if (arg.endsWith('route.ts') && existsSync(arg)) {
  routeFile = resolve(arg);
} else {
  const candidate = resolve(API_SRC, arg.replace(/^\//, ''), 'route.ts');
  if (existsSync(candidate)) {
    routeFile = candidate;
  } else {
    console.error(`Route not found: ${candidate}`);
    process.exit(1);
  }
}

const source = readFileSync(routeFile, 'utf-8');
const routeRelative = relative(API_SRC, routeFile).replace('/route.ts', '');

const methods = (['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const).filter((m) =>
  new RegExp(`export\\s+async\\s+function\\s+${m}\\b`).test(source)
);

if (methods.length === 0) {
  console.error('No exported HTTP methods found');
  process.exit(1);
}

const hasAuthBarrel =
  source.includes("from '@/lib/api'") && !source.includes("from '@/lib/api/auth'");
const hasAuthDirect = source.includes("from '@/lib/api/auth'") || source.includes('verifySession');
const hasRateLimit = source.includes('checkRateLimit');
const hasSupabase = source.includes('createClient');
const hasSentry = source.includes('captureServerError');
const hasDynamic = /params:\s*Promise/.test(source);
const hasRedirect = source.includes('NextResponse.redirect');
const paramMatch = /params:\s*Promise<\{[^}]*(\w+):\s*string/.exec(source);
const paramName = paramMatch ? paramMatch[1] : 'id';

const testName =
  routeRelative
    .replace(/\[(\w+)\]/g, '$1')
    .replace(/\//g, '-')
    .toLowerCase() + '-route.test.ts';
const testFile = resolve(TEST_DIR, testName);

if (existsSync(testFile)) {
  console.log(`EXISTS: ${relative(ROOT, testFile)}`);
  process.exit(0);
}

const methodList = methods.join(', ');
const importPath = `@/app/api/${routeRelative}/route`;

const parts: string[] = [];

// Imports
parts.push(`import { ${methodList} } from '${importPath}';`);
parts.push(`import { NextRequest${hasRedirect ? ', NextResponse' : ''} } from 'next/server';`);
parts.push('');

// Mocks
if (hasAuthBarrel) {
  parts.push(`jest.mock('@/lib/api', () => ({
  verifySession: jest.fn(),
  successResponse: jest.fn((data: unknown) => new Response(JSON.stringify({ data }), { status: 200 })),
  createdResponse: jest.fn((data: unknown) => new Response(JSON.stringify({ data }), { status: 201 })),
  errorResponse: jest.fn((msg: string, status: number) =>
    new Response(JSON.stringify({ error: { message: msg, status } }), { status })
  ),
  apiErrorResponse: jest.fn((err: { message: string; statusCode: number }) =>
    new Response(JSON.stringify({ error: { message: err.message } }), { status: err.statusCode })
  ),
  jsonResponse: jest.fn((data: unknown) => new Response(JSON.stringify(data), { status: 200 })),
}));
`);
} else if (hasAuthDirect) {
  parts.push(`jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));`);
  parts.push('');
}

if (hasRateLimit) {
  parts.push(`jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res: Response) => res),
}));
`);
}

if (hasSupabase) {
  parts.push(`const mockFrom = jest.fn();
const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({ from: mockFrom, auth: { getUser: mockGetUser } })
  ),
}));
`);
}

if (hasSentry) {
  parts.push(`jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));`);
  parts.push('');
}

if (hasRedirect) {
  parts.push(`const redirectUrls: string[] = [];
jest.spyOn(NextResponse, 'redirect').mockImplementation((url: string | URL) => {
  redirectUrls.push(String(url));
  return new Response(null, { status: 307, headers: { location: String(url) } }) as never;
});
`);
}

// Variable declarations
if (hasAuthBarrel) {
  parts.push(`import { verifySession } from '@/lib/api';`);
  parts.push(
    `const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;`
  );
} else if (hasAuthDirect) {
  parts.push(`import { verifySession } from '@/lib/api/auth';`);
  parts.push(
    `const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;`
  );
}
if (hasRateLimit) {
  parts.push(`import { checkRateLimit } from '@/lib/api/rate-limit';`);
  parts.push(
    `const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;`
  );
}
parts.push('');

// beforeEach
const setupLines: string[] = ['jest.clearAllMocks();'];
if (hasRedirect) setupLines.push('redirectUrls.length = 0;');
if (hasAuthBarrel || hasAuthDirect)
  setupLines.push(
    `mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 'user@test.com' } } as never);`
  );
if (hasRateLimit)
  setupLines.push(
    `mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59, resetAt: Date.now() + 60000 } as never);`
  );
if (hasSupabase)
  setupLines.push(`mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });`);

parts.push(`beforeEach(() => {
  ${setupLines.join('\n  ')}
});
`);

// Helpers
const hasBody = methods.some((m) => ['POST', 'PATCH', 'PUT'].includes(m));
if (hasBody) {
  parts.push(`function makeRequest(method: string, body?: Record<string, unknown>) {
  return new NextRequest(\`http://localhost/api/${routeRelative}\`, {
    method,
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
}
`);
} else {
  parts.push(`function makeRequest(params: Record<string, string> = {}) {
  const url = new URL(\`http://localhost/api/${routeRelative}\`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}
`);
}

if (hasDynamic) {
  parts.push(`function makeContext(${paramName} = 'test-${paramName}') {
  return { params: Promise.resolve({ ${paramName} }) };
}
`);
}

// Describe blocks
for (const method of methods) {
  const isWrite = ['POST', 'PATCH', 'PUT'].includes(method);
  const contextArg = hasDynamic ? `, makeContext()` : '';
  const reqArg = isWrite ? `makeRequest('${method}', { /* TODO */ })` : `makeRequest()`;
  const successStatus = method === 'POST' ? 201 : method === 'DELETE' ? 200 : 200;

  const authGuard =
    hasAuthBarrel || hasAuthDirect
      ? `
  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new Error('Unauthorized'));
    const res = await ${method}(${reqArg}${contextArg});
    expect(res.status).toBe(401);
  });
`
      : '';

  const rateLimitGuard = hasRateLimit
    ? `
  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() } as never);
    const res = await ${method}(${reqArg}${contextArg});
    expect(res.status).toBe(429);
  });
`
    : '';

  parts.push(`describe('${method} /api/${routeRelative}', () => {
  it('returns ${successStatus} for valid request', async () => {
    const res = await ${method}(${reqArg}${contextArg});
    const body = await res.json();

    expect(res.status).toBe(${successStatus});
    // TODO: assert body shape
    void body;
  });
${authGuard}${rateLimitGuard}});
`);
}

mkdirSync(TEST_DIR, { recursive: true });
writeFileSync(testFile, parts.join('\n'), 'utf-8');

console.log(`CREATED: ${relative(ROOT, testFile)}`);
console.log(
  `Methods: ${methodList} | Auth: ${hasAuthBarrel || hasAuthDirect} | RateLimit: ${hasRateLimit} | Dynamic: ${hasDynamic}`
);
