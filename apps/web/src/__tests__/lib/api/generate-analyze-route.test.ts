import { POST } from '@/app/api/generate/analyze/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/lib/services/image-analysis', () => ({
  analyzeDesignImage: jest.fn(),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { analyzeDesignImage } from '@/lib/services/image-analysis';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockAnalyzeDesignImage = analyzeDesignImage as jest.MockedFunction<typeof analyzeDesignImage>;

// Minimal valid base64 image (100+ chars)
const VALID_IMAGE_B64 = 'a'.repeat(200);
const ANALYSIS_RESULT = {
  components: ['Button', 'Header'],
  colors: ['#1a1a1a'],
  layout: 'flex',
  suggestions: 'Use a card layout',
};

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/generate/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 4,
    resetAt: Date.now() + 60000,
  });
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);
  mockAnalyzeDesignImage.mockResolvedValue(ANALYSIS_RESULT as never);
});

describe('POST /api/generate/analyze', () => {
  it('returns image analysis on valid request', async () => {
    const res = await POST(
      makeRequest({
        imageBase64: VALID_IMAGE_B64,
        imageMimeType: 'image/png',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.analysis.components).toContain('Button');
    expect(mockAnalyzeDesignImage).toHaveBeenCalledWith(VALID_IMAGE_B64, 'image/png', undefined);
  });

  it('forwards userApiKey to analysis service', async () => {
    await POST(
      makeRequest({
        imageBase64: VALID_IMAGE_B64,
        imageMimeType: 'image/jpeg',
        userApiKey: 'user-api-key-123',
      })
    );
    expect(mockAnalyzeDesignImage).toHaveBeenCalledWith(
      VALID_IMAGE_B64,
      'image/jpeg',
      'user-api-key-123'
    );
  });

  it('returns 400 when imageBase64 is missing', async () => {
    const res = await POST(makeRequest({ imageMimeType: 'image/png' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  it('returns 400 for invalid mime type', async () => {
    const res = await POST(
      makeRequest({
        imageBase64: VALID_IMAGE_B64,
        imageMimeType: 'image/gif', // not in enum
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() });
    const res = await POST(
      makeRequest({ imageBase64: VALID_IMAGE_B64, imageMimeType: 'image/png' })
    );

    expect(res.status).toBe(429);
  });

  it('returns 401 on authentication failure', async () => {
    mockVerifySession.mockRejectedValue(new Error('Authentication required'));
    const res = await POST(
      makeRequest({ imageBase64: VALID_IMAGE_B64, imageMimeType: 'image/png' })
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/authentication required/i);
  });

  it('returns 500 on analysis service error', async () => {
    mockAnalyzeDesignImage.mockRejectedValue(new Error('Gemini API error'));
    const res = await POST(
      makeRequest({ imageBase64: VALID_IMAGE_B64, imageMimeType: 'image/png' })
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Gemini API error/i);
  });
});
