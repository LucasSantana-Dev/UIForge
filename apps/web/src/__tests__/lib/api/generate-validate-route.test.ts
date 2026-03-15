import { POST } from '@/app/api/generate/validate/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const VALIDATE_RESULT = { valid: true, issues: [], score: 95 };

function makeRequest(body: Record<string, unknown>, authHeader?: string) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (authHeader) headers['authorization'] = authHeader;
  return new NextRequest('http://localhost/api/generate/validate', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = 'https://test-api.example.com';
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => VALIDATE_RESULT,
    text: async () => JSON.stringify(VALIDATE_RESULT),
  });
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_API_URL;
});

describe('POST /api/generate/validate', () => {
  it('proxies valid code to the API and returns result', async () => {
    const res = await POST(
      makeRequest({ code: 'export default function C() {}', language: 'tsx' })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.valid).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test-api.example.com/api/generate/validate',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('forwards Authorization header to upstream', async () => {
    await POST(makeRequest({ code: 'foo', language: 'tsx' }, 'Bearer token-123'));
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer token-123');
  });

  it('returns 400 when code is missing', async () => {
    const res = await POST(makeRequest({ language: 'tsx' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/code and language are required/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when language is missing', async () => {
    const res = await POST(makeRequest({ code: 'foo' }));

    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('propagates upstream error status and body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Parse failed' }),
      text: async () => '{"error":"Parse failed"}',
    });

    const res = await POST(makeRequest({ code: 'invalid!!!', language: 'tsx' }));
    expect(res.status).toBe(422);
  });

  it('returns 408 on request timeout (AbortError)', async () => {
    mockFetch.mockRejectedValue(Object.assign(new Error('AbortError'), { name: 'AbortError' }));

    const res = await POST(makeRequest({ code: 'foo', language: 'tsx' }));
    const body = await res.json();

    expect(res.status).toBe(408);
    expect(body.error).toMatch(/timeout/i);
  });

  it('returns 500 on unexpected fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('network failure'));

    const res = await POST(makeRequest({ code: 'foo', language: 'tsx' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/internal server error/i);
  });

  it('returns 500 on invalid JSON request body', async () => {
    const req = new NextRequest('http://localhost/api/generate/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
