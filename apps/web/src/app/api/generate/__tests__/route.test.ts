import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Polyfill ReadableStream for jsdom
if (typeof globalThis.ReadableStream === 'undefined') {
  const { ReadableStream } = require('stream/web');
  globalThis.ReadableStream = ReadableStream;
}

const mockCheckRateLimit = jest.fn();
const mockVerifySession = jest.fn();
const mockGenerateComponentStream = jest.fn();

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: (...args) => mockCheckRateLimit(...args),
  setRateLimitHeaders: jest.fn(),
}));

jest.mock('@/lib/api/auth', () => ({
  verifySession: () => mockVerifySession(),
  getSession: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/services/gemini', () => ({
  generateComponentStream: (...args) => mockGenerateComponentStream(...args),
}));

jest.mock('@/lib/usage/limits', () => ({
  checkGenerationQuota: jest.fn().mockResolvedValue({
    allowed: true,
    current: 0,
    limit: -1,
    remaining: -1,
  }),
}));

jest.mock('@/lib/usage/tracker', () => ({
  incrementGenerationCount: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 'gen-1' } }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null }),
      }),
    }),
  }),
}));

jest.mock('@/lib/services/context-enrichment', () => ({
  enrichPromptWithContext: jest.fn().mockResolvedValue({
    systemPromptAddition: '',
  }),
}));

jest.mock('@/lib/services/embeddings', () => ({
  storeGenerationEmbedding: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/quality/gates', () => ({
  runAllGates: jest.fn().mockReturnValue({ passed: true, gates: [] }),
}));

function createRequest(body: any): NextRequest {
  return new NextRequest('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  description: 'Create a modern button component with hover effects',
  framework: 'react',
  componentLibrary: 'tailwind',
  typescript: true,
};

describe('POST /api/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 14,
      resetAt: Date.now() + 60000,
    });
    mockVerifySession.mockResolvedValue({
      user: { id: 'user-1' },
    });
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const response = await POST(createRequest(validBody));
    expect(response.status).toBe(429);
  });

  it('returns 401 when not authenticated', async () => {
    mockVerifySession.mockRejectedValue(new Error('Authentication required'));

    const response = await POST(createRequest(validBody));
    expect(response.status).toBe(401);
  });

  it('returns 400 for short description', async () => {
    const response = await POST(createRequest({ description: 'short' }));
    expect(response.status).toBe(400);
  });

  it('returns SSE stream for valid request', async () => {
    mockGenerateComponentStream.mockReturnValue(
      (async function* () {
        yield { type: 'start', timestamp: 1 };
        yield { type: 'complete', timestamp: 2 };
      })()
    );

    const response = await POST(createRequest(validBody));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('calls Gemini service with correct params', async () => {
    mockGenerateComponentStream.mockReturnValue(
      (async function* () {
        yield { type: 'complete', timestamp: 1 };
      })()
    );

    const response = await POST(createRequest(validBody));
    await response.text();

    expect(mockGenerateComponentStream).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: validBody.description,
        framework: 'react',
        componentLibrary: 'tailwind',
        typescript: true,
      })
    );
  });

  it('passes BYOK apiKey to Gemini service', async () => {
    mockGenerateComponentStream.mockReturnValue(
      (async function* () {
        yield { type: 'complete', timestamp: 1 };
      })()
    );

    const response = await POST(
      createRequest({
        ...validBody,
        userApiKey: 'user-key-123',
      })
    );
    await response.text();

    expect(mockGenerateComponentStream).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'user-key-123' })
    );
  });
});

describe('GET /api/generate', () => {
  it('returns API info', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.version).toBe('3.1.0');
    expect(data.provider).toBe('gemini-2.0-flash');
  });
});
