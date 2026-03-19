import { POST } from '@/app/api/generate/format/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const VALID_BODY = {
  code: 'const x = 1',
  language: 'typescript',
};

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/generate/format', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: 'Bearer token123' },
    body: JSON.stringify(body),
  });
}

function mockApiSuccess(data: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
}

function mockApiError(status: number, data: unknown, isJson = true) {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
    json: isJson ? () => Promise.resolve(data) : () => Promise.reject(new Error('not json')),
    text: () => Promise.resolve(String(data)),
  } as Response);
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
});

describe('POST /api/generate/format', () => {
  it('proxies to external API and returns formatted code', async () => {
    const formatted = { formatted: 'const x = 1;\n' };
    mockApiSuccess(formatted);

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(formatted);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/generate/format',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('forwards authorization header to external API', async () => {
    mockApiSuccess({ formatted: 'x' });

    await POST(makeRequest(VALID_BODY));

    const fetchCall = mockFetch.mock.calls[0] as unknown as [string, RequestInit];
    const headers = fetchCall[1].headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer token123');
  });

  it('returns 400 when code is missing', async () => {
    const res = await POST(makeRequest({ language: 'typescript' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Code and language are required/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when language is missing', async () => {
    const res = await POST(makeRequest({ code: 'const x = 1' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Code and language are required/i);
  });

  it('propagates error status from external API (JSON error)', async () => {
    mockApiError(422, { error: 'Parse failed' });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toBe('Parse failed');
  });

  it('propagates error status from external API (plain text error)', async () => {
    mockApiError(500, 'Internal server error', false);

    const res = await POST(makeRequest(VALID_BODY));
    const text = await res.text();

    expect(res.status).toBe(500);
    expect(text).toBe('Internal server error');
  });

  it('falls back to NEXT_PUBLIC_API_URL default when env not set', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    mockApiSuccess({ formatted: 'x' });

    await POST(makeRequest(VALID_BODY));

    const fetchCall = mockFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(fetchCall[0]).toMatch(/^https:\/\//);
  });

  it('returns 500 on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Internal server error');
  });
});
