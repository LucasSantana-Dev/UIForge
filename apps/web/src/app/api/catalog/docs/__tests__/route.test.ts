import { NextRequest, NextResponse } from 'next/server';
import * as api from '@/lib/api';
import * as rateLimit from '@/lib/api/rate-limit';

jest.mock('@/lib/api');
jest.mock('@/lib/api/rate-limit');

const mockVerifySession = api.verifySession as jest.MockedFunction<typeof api.verifySession>;
const mockSuccessResponse = api.successResponse as jest.MockedFunction<typeof api.successResponse>;
const mockErrorResponse = api.errorResponse as jest.MockedFunction<typeof api.errorResponse>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<
  typeof rateLimit.checkRateLimit
>;
const mockSetRateLimitHeaders = rateLimit.setRateLimitHeaders as jest.MockedFunction<
  typeof rateLimit.setRateLimitHeaders
>;

const mockFetch = jest.fn();

beforeAll(() => {
  (global as any).fetch = mockFetch;
  if (!AbortSignal.timeout) {
    (AbortSignal as any).timeout = (ms: number) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), ms);
      return controller.signal;
    };
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
  mockSetRateLimitHeaders.mockImplementation((response) => response as any);
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 59,
    resetAt: Date.now() + 60000,
  });
  mockVerifySession.mockResolvedValue({ user: { id: 'user-1' } } as any);
  mockSuccessResponse.mockImplementation((data) =>
    NextResponse.json({ success: true, data }, { status: 200 })
  );
  mockErrorResponse.mockImplementation((msg, code) =>
    NextResponse.json({ error: msg }, { status: code || 500 })
  );
});

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

let GET: typeof import('../route').GET;

beforeAll(async () => {
  const mod = await import('../route');
  GET = mod.GET;
});

describe('Catalog Docs API - /api/catalog/docs', () => {
  it('returns 400 when url parameter is missing', async () => {
    const req = makeRequest('/api/catalog/docs');
    await GET(req);
    expect(mockErrorResponse).toHaveBeenCalledWith('Missing url parameter', 400);
  });

  it('returns 400 for unresolvable URL', async () => {
    const req = makeRequest('/api/catalog/docs?url=https://example.com/page');
    await GET(req);
    expect(mockErrorResponse).toHaveBeenCalledWith('Unable to resolve documentation URL', 400);
  });

  it('resolves GitHub blob URL to raw content', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Hello'),
    });
    const req = makeRequest(
      '/api/catalog/docs?url=' +
        encodeURIComponent('https://github.com/Forge-Space/siza/blob/main/README.md')
    );
    await GET(req);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/Forge-Space/siza/main/README.md',
      expect.objectContaining({ headers: { 'User-Agent': 'Siza-IDP/1.0' } })
    );
  });

  it('resolves GitHub repo root to default README.md', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Project'),
    });
    const req = makeRequest(
      '/api/catalog/docs?url=' + encodeURIComponent('https://github.com/Forge-Space/siza')
    );
    await GET(req);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/Forge-Space/siza/main/README.md',
      expect.any(Object)
    );
  });

  it('passes through raw.githubusercontent.com URLs', async () => {
    const rawUrl = 'https://raw.githubusercontent.com/Forge-Space/siza/main/docs/guide.md';
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Raw'),
    });
    const req = makeRequest('/api/catalog/docs?url=' + encodeURIComponent(rawUrl));
    await GET(req);
    expect(mockFetch).toHaveBeenCalledWith(rawUrl, expect.any(Object));
  });

  it('accepts .md URLs from any host', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# External docs'),
    });
    const req = makeRequest(
      '/api/catalog/docs?url=' + encodeURIComponent('https://docs.example.com/api.md')
    );
    await GET(req);
    expect(mockFetch).toHaveBeenCalledWith('https://docs.example.com/api.md', expect.any(Object));
  });

  it('returns fetched content with source and truncated flag', async () => {
    const markdown = '# Hello World\\n\\nSome content here.';
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(markdown),
    });
    const req = makeRequest(
      '/api/catalog/docs?url=' + encodeURIComponent('https://github.com/org/repo')
    );
    await GET(req);
    expect(mockSuccessResponse).toHaveBeenCalledWith({
      content: markdown,
      source: 'https://raw.githubusercontent.com/org/repo/main/README.md',
      truncated: false,
    });
  });

  it('returns error when upstream fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    const req = makeRequest(
      '/api/catalog/docs?url=' + encodeURIComponent('https://github.com/org/repo')
    );
    await GET(req);
    expect(mockErrorResponse).toHaveBeenCalledWith('Failed to fetch documentation', 404);
  });

  it('respects rate limiting', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });
    const req = makeRequest(
      '/api/catalog/docs?url=' + encodeURIComponent('https://github.com/org/repo')
    );
    await GET(req);
    expect(mockErrorResponse).toHaveBeenCalledWith('Rate limit exceeded', 429, expect.any(Object));
  });
});
