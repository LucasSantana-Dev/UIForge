import { NextRequest } from 'next/server';

const mockVerifySession = jest.fn();
const mockSuccessResponse = jest.fn();
const mockErrorResponse = jest.fn();
const mockApiErrorResponse = jest.fn();
const mockCheckRateLimit = jest.fn();
const mockSetRateLimitHeaders = jest.fn();
const mockCreateClient = jest.fn();

jest.mock('@/lib/api', () => ({
  verifySession: (...args: unknown[]) => mockVerifySession(...args),
  successResponse: (...args: unknown[]) => mockSuccessResponse(...args),
  errorResponse: (...args: unknown[]) => mockErrorResponse(...args),
  apiErrorResponse: (...args: unknown[]) => mockApiErrorResponse(...args),
}));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  setRateLimitHeaders: (...args: unknown[]) => mockSetRateLimitHeaders(...args),
}));
jest.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));
jest.mock('@/lib/github/client', () => ({
  getInstallationOctokit: jest.fn(),
}));

import { GET } from '../route';

const mockFetch = jest.fn();
const originalFetch = global.fetch;
global.fetch = mockFetch;

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/catalog/ci');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url);
}

function setupSupabaseMock() {
  mockCreateClient.mockResolvedValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: [] }),
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [] }),
          }),
        }),
      }),
    }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSetRateLimitHeaders.mockImplementation((response) => response);
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 59,
    resetAt: Date.now() + 60000,
  });
  mockVerifySession.mockResolvedValue({
    user: { id: 'user-1', email: 'test@example.com' },
  });
  mockSuccessResponse.mockImplementation(
    (data) => new Response(JSON.stringify({ data }))
  );
  mockErrorResponse.mockImplementation(
    (msg, status) =>
      new Response(JSON.stringify({ error: msg }), { status })
  );
  setupSupabaseMock();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('GET /api/catalog/ci', () => {
  it('returns 400 when repo param is missing', async () => {
    await GET(makeRequest());
    expect(mockErrorResponse).toHaveBeenCalledWith(
      'Missing repo parameter',
      400
    );
  });

  it('returns 400 when repo param is invalid', async () => {
    await GET(makeRequest({ repo: 'invalid-format' }));
    expect(mockErrorResponse).toHaveBeenCalledWith(
      'Invalid repo format, expected owner/repo',
      400
    );
  });

  it('fetches and transforms workflow runs from public API', async () => {
    const mockGitHubRuns = {
      workflow_runs: [
        {
          id: 100,
          name: 'CI',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'main',
          head_commit: { message: 'feat: Test' },
          html_url: 'https://github.com/org/repo/actions/runs/100',
          run_started_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:02:00Z',
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGitHubRuns),
    });

    await GET(makeRequest({ repo: 'Forge-Space/siza' }));

    expect(mockSuccessResponse).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 100,
          name: 'CI',
          status: 'completed',
          conclusion: 'success',
          branch: 'main',
        }),
      ])
    );
  });

  it('returns empty array when no workflow runs exist', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workflow_runs: [] }),
    });

    await GET(makeRequest({ repo: 'Forge-Space/siza' }));

    expect(mockSuccessResponse).toHaveBeenCalledWith([]);
  });

  it('returns 502 on GitHub API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
    });

    await GET(makeRequest({ repo: 'Forge-Space/siza' }));

    expect(mockErrorResponse).toHaveBeenCalledWith(
      'Failed to fetch workflow runs',
      502
    );
  });
});
