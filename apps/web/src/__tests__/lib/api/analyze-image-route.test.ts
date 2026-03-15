import { POST } from '@/app/api/analyze-image/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({ checkRateLimit: jest.fn() }));
jest.mock('@/lib/services/image-analysis', () => ({ analyzeDesignImage: jest.fn() }));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { analyzeDesignImage } from '@/lib/services/image-analysis';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockAnalyzeDesignImage = analyzeDesignImage as jest.MockedFunction<typeof analyzeDesignImage>;

const RATE_OK = { allowed: true, remaining: 9, resetAt: Date.now() + 60000 };
const USER = { id: 'u1', email: 'user@test.com' };
const ANALYSIS = { components: ['button', 'input'], layout: 'column', colors: ['#fff'] };

const VALID_BODY = {
  imageBase64: 'aGVsbG8=', // "hello" in base64 — valid min-length string
  mimeType: 'image/png',
};

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue(RATE_OK as never);
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockAnalyzeDesignImage.mockResolvedValue(ANALYSIS as never);
});

describe('POST /api/analyze-image', () => {
  it('returns analysis for valid image', async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(ANALYSIS);
    expect(mockAnalyzeDesignImage).toHaveBeenCalledWith('aGVsbG8=', 'image/png', undefined);
  });

  it('passes userApiKey to service when provided', async () => {
    await POST(makeRequest({ ...VALID_BODY, userApiKey: 'my-key' }));
    expect(mockAnalyzeDesignImage).toHaveBeenCalledWith('aGVsbG8=', 'image/png', 'my-key');
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now(),
    } as never);

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toMatch(/Rate limit exceeded/i);
  });

  it('returns 400 when imageBase64 is missing', async () => {
    const res = await POST(makeRequest({ mimeType: 'image/png' }));
    void (await res.json());

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid mimeType', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, mimeType: 'image/gif' }));
    void (await res.json());

    expect(res.status).toBe(400);
  });

  it('returns 401 when authentication required error is thrown', async () => {
    mockAnalyzeDesignImage.mockRejectedValue(new Error('Authentication required'));

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });

  it('returns 500 on unexpected service error', async () => {
    mockAnalyzeDesignImage.mockRejectedValue(new Error('Vision API timeout'));

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Vision API timeout');
  });

  it('accepts all valid mimeTypes', async () => {
    for (const mimeType of ['image/png', 'image/jpeg', 'image/webp']) {
      const res = await POST(makeRequest({ ...VALID_BODY, mimeType }));
      expect(res.status).toBe(200);
    }
  });
});
