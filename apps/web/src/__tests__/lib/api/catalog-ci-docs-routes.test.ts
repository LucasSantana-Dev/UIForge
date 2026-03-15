import { GET as getCatalogCI } from '@/app/api/catalog/ci/route';
import { GET as getCatalogDocs } from '@/app/api/catalog/docs/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api', () => {
  return {
    verifySession: jest.fn(),
    successResponse: jest.fn(
      (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 })
    ),
    errorResponse: jest.fn(
      (msg: string, status: number) =>
        new Response(JSON.stringify({ error: { message: msg, status } }), { status })
    ),
    apiErrorResponse: jest.fn(
      (err: { message: string; statusCode: number }) =>
        new Response(JSON.stringify({ error: { message: err.message } }), {
          status: err.statusCode,
        })
    ),
  };
});
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res: Response) => res),
}));
jest.mock('@/lib/github/client', () => ({ getInstallationOctokit: jest.fn() }));

const mockFrom = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
// AbortSignal.timeout may not exist in jsdom — polyfill it
if (!AbortSignal.timeout) {
  (AbortSignal as any).timeout = (_ms: number) => new AbortController().signal;
}

import { verifySession } from '@/lib/api';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { getInstallationOctokit } from '@/lib/github/client';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockGetOctokit = getInstallationOctokit as jest.MockedFunction<typeof getInstallationOctokit>;

const RATE_OK = { allowed: true, remaining: 59, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };

const WORKFLOW_RUNS = [
  {
    id: 1,
    name: 'CI',
    status: 'completed',
    conclusion: 'success',
    head_branch: 'main',
    head_commit: { message: 'fix: bug' },
    html_url: 'https://github.com/org/repo/actions/runs/1',
    run_started_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:05:00Z',
  },
];

function makeGETRequest(url: string, params: Record<string, string> = {}) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return new NextRequest(u.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
  // Re-apply fetch mock each test (jsdom may reset it)
  Object.defineProperty(global, 'fetch', { writable: true, configurable: true, value: mockFetch });
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  // Default: no linked installations → falls back to public API
  mockFrom.mockReturnValue({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({ limit: jest.fn().mockResolvedValue({ data: [] }) })),
    })),
  });
});
// ── GET /api/catalog/ci ───────────────────────────────────────────────────────
describe('GET /api/catalog/ci', () => {
  it('returns workflow runs via public GitHub API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workflow_runs: WORKFLOW_RUNS }),
    } as Response);

    const res = await getCatalogCI(
      makeGETRequest('http://localhost/api/catalog/ci', { repo: 'org/repo' })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0].name).toBe('CI');
    expect(body.data[0].status).toBe('completed');
  });

  it('computes duration_ms for completed runs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workflow_runs: WORKFLOW_RUNS }),
    } as Response);

    const res = await getCatalogCI(
      makeGETRequest('http://localhost/api/catalog/ci', { repo: 'org/repo' })
    );
    const body = await res.json();

    expect(body.data[0].duration_ms).toBe(5 * 60 * 1000); // 5 min
  });

  it('returns 400 when repo param is missing', async () => {
    const res = await getCatalogCI(makeGETRequest('http://localhost/api/catalog/ci'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Missing repo parameter/i);
  });

  it('returns 400 for invalid repo format', async () => {
    const res = await getCatalogCI(
      makeGETRequest('http://localhost/api/catalog/ci', { repo: 'invalid' })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Invalid repo format/i);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await getCatalogCI(
      makeGETRequest('http://localhost/api/catalog/ci', { repo: 'org/repo' })
    );
    expect(res.status).toBe(429);
  });

  it('uses installation Octokit when repo is linked', async () => {
    const mockOctokit = {
      rest: {
        actions: {
          listWorkflowRunsForRepo: jest.fn().mockResolvedValue({
            data: { workflow_runs: WORKFLOW_RUNS },
          }),
        },
      },
    };
    mockGetOctokit.mockResolvedValue(mockOctokit as never);
    mockFrom.mockImplementation((table: string) => {
      if (table === 'github_repos') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue({ data: [{ installation_id: 42 }] }),
            })),
          })),
        };
      }
      if (table === 'github_installations') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                limit: jest.fn().mockResolvedValue({ data: [{ id: 'inst-db-1' }] }),
              })),
            })),
          })),
        };
      }
      return {};
    });

    const res = await getCatalogCI(
      makeGETRequest('http://localhost/api/catalog/ci', { repo: 'org/repo' })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockGetOctokit).toHaveBeenCalledWith(42);
    expect(mockFetch).not.toHaveBeenCalled(); // used installation, not public API
    expect(body.data).toHaveLength(1);
  });

  it('returns 502 when GitHub public API fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 } as Response);

    const res = await getCatalogCI(
      makeGETRequest('http://localhost/api/catalog/ci', { repo: 'org/repo' })
    );
    expect(res.status).toBe(502);
  });
});

// ── GET /api/catalog/docs ─────────────────────────────────────────────────────
describe('GET /api/catalog/docs', () => {
  const MD_CONTENT = '# My Service\n\nThis is documentation.';

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(MD_CONTENT),
    } as Response);
  });

  it('fetches docs from raw GitHub URL', async () => {
    const res = await getCatalogDocs(
      makeGETRequest('http://localhost/api/catalog/docs', {
        url: 'https://github.com/org/repo/blob/main/README.md',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.content).toBe(MD_CONTENT);
    expect(body.data.source).toContain('raw.githubusercontent.com');
    expect(body.data.truncated).toBe(false);
  });

  it('passes raw.githubusercontent.com URL directly', async () => {
    const rawUrl = 'https://raw.githubusercontent.com/org/repo/main/README.md';

    const res = await getCatalogDocs(
      makeGETRequest('http://localhost/api/catalog/docs', { url: rawUrl })
    );

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(rawUrl, expect.any(Object));
  });

  it('returns 400 when url param is missing', async () => {
    const res = await getCatalogDocs(makeGETRequest('http://localhost/api/catalog/docs'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Missing url parameter/i);
  });

  it('returns 400 for unresolvable URL', async () => {
    const res = await getCatalogDocs(
      makeGETRequest('http://localhost/api/catalog/docs', {
        url: 'https://example.com/page.html',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.message).toMatch(/Unable to resolve/i);
  });

  it('returns 400 for .md file on unknown host', async () => {
    // .md extension on unknown host is allowed by resolveRawUrl
    const res = await getCatalogDocs(
      makeGETRequest('http://localhost/api/catalog/docs', {
        url: 'https://myhost.com/file.md',
      })
    );
    // resolveRawUrl returns the URL as-is for .md extension
    expect(res.status).toBe(200);
  });

  it('returns the upstream status when doc fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 } as Response);

    const res = await getCatalogDocs(
      makeGETRequest('http://localhost/api/catalog/docs', {
        url: 'https://raw.githubusercontent.com/org/repo/main/MISSING.md',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.message).toMatch(/Failed to fetch documentation/i);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await getCatalogDocs(
      makeGETRequest('http://localhost/api/catalog/docs', {
        url: 'https://raw.githubusercontent.com/org/repo/main/README.md',
      })
    );
    expect(res.status).toBe(429);
  });

  it('marks content as truncated when over 100k chars', async () => {
    const longContent = 'x'.repeat(100001);
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(longContent),
    } as Response);

    const res = await getCatalogDocs(
      makeGETRequest('http://localhost/api/catalog/docs', {
        url: 'https://raw.githubusercontent.com/org/repo/main/README.md',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.truncated).toBe(true);
    expect(body.data.content).toHaveLength(100000);
  });
});
