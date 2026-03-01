import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Polyfill ReadableStream for jsdom
if (typeof globalThis.ReadableStream === 'undefined') {
  const { ReadableStream } = require('stream/web');
  globalThis.ReadableStream = ReadableStream;
}

const mockCheckRateLimit = jest.fn();
const mockVerifySession = jest.fn();
const mockRouteGeneration = jest.fn();

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: (...args: any[]) => mockCheckRateLimit(...args),
  setRateLimitHeaders: jest.fn(),
}));

jest.mock('@/lib/api/auth', () => ({
  verifySession: () => mockVerifySession(),
  getSession: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/services/provider-router', () => ({
  routeGeneration: (...args: any[]) => mockRouteGeneration(...args),
}));

jest.mock('@/lib/services/generation.service', () => ({
  buildDesignContext: jest.fn().mockReturnValue(''),
  enrichWithRag: jest.fn().mockResolvedValue(''),
  createGenerationRecord: jest.fn().mockResolvedValue('gen-1'),
  completeGeneration: jest.fn().mockResolvedValue(undefined),
  failGeneration: jest.fn().mockResolvedValue(undefined),
  runQualityGates: jest.fn().mockReturnValue({ passed: true, score: 100, gates: [] }),
  postGenerationTasks: jest.fn().mockResolvedValue(undefined),
  createSseEvent: jest.fn((data: any) => 'data: ' + JSON.stringify(data) + '\n\n'),
  buildStreamPrompt: jest.fn((desc: string) => desc),
}));

jest.mock('@/lib/services/conversation.service', () => ({
  validateConversation: jest.fn().mockResolvedValue(undefined),
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
    mockRouteGeneration.mockReturnValue(
      (async function* () {
        yield { type: 'start', timestamp: 1 };
        yield { type: 'complete', timestamp: 2 };
      })()
    );

    const response = await POST(createRequest(validBody));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('calls provider router with correct params', async () => {
    mockRouteGeneration.mockReturnValue(
      (async function* () {
        yield { type: 'complete', timestamp: 1 };
      })()
    );

    const response = await POST(createRequest(validBody));
    await response.text();

    expect(mockRouteGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: validBody.description,
        framework: 'react',
        componentLibrary: 'tailwind',
        typescript: true,
        provider: 'siza',
      })
    );
  });

  it('passes BYOK userApiKey to provider router', async () => {
    mockRouteGeneration.mockReturnValue(
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

    expect(mockRouteGeneration).toHaveBeenCalledWith(
      expect.objectContaining({ userApiKey: 'user-key-123' })
    );
  });
});

describe('GET /api/generate', () => {
  it('returns API info', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.version).toBe('4.0.0');
    expect(data.provider).toBe('gemini-2.0-flash');
  });
});
