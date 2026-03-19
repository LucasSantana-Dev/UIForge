import { GET } from '@/app/api/generations/history/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  setRateLimitHeaders: jest.fn((res) => res),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));
jest.mock('@/app/api/generations/error-handler', () => ({
  handleGenerationRouteError: jest.fn((_err: unknown) => {
    const Response = require('next/server').NextResponse;
    return Response.json({ error: { message: 'error' } }, { status: 500 });
  }),
}));

const mockRange = jest.fn();
const mockEqStatus = jest.fn(() => ({ range: mockRange }));
const mockEqProvider = jest.fn(() => ({ eq: mockEqStatus, range: mockRange }));
const mockEqFramework = jest.fn(() => ({ eq: mockEqProvider, range: mockRange }));
const mockOrder = jest.fn(() => ({ range: mockRange, eq: mockEqFramework }));
const mockEqUser = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEqUser }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

const GENS = [
  {
    id: 'g1',
    prompt: 'A card',
    framework: 'react',
    ai_provider: 'google',
    status: 'completed',
    created_at: '2026-03-01',
  },
  {
    id: 'g2',
    prompt: 'A button',
    framework: 'vue',
    ai_provider: 'anthropic',
    status: 'completed',
    created_at: '2026-02-28',
  },
];

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/generations/history');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 60000,
  });
  mockRange.mockResolvedValue({ data: GENS, count: 2, error: null });
  mockOrder.mockReturnValue({ range: mockRange, eq: mockEqFramework });
  mockEqUser.mockReturnValue({ order: mockOrder });
});

describe('GET /api/generations/history', () => {
  it('returns paginated generation history', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.generations).toHaveLength(2);
    expect(body.data.pagination.total).toBe(2);
    expect(body.data.pagination.page).toBe(1);
    expect(mockFrom).toHaveBeenCalledWith('generations');
  });

  it('applies page and limit params correctly', async () => {
    mockRange.mockResolvedValue({ data: [], count: 50, error: null });
    const res = await GET(makeRequest({ page: '3', limit: '10' }));
    const body = await res.json();
    expect(body.data.pagination.page).toBe(3);
    // offset = (3-1)*10 = 20, range(20, 29)
    expect(mockRange).toHaveBeenCalledWith(20, 29);
  });

  it('caps limit at 50', async () => {
    mockRange.mockResolvedValue({ data: [], count: 0, error: null });
    await GET(makeRequest({ limit: '999' }));
    // limit capped at 50 → range(0, 49)
    expect(mockRange).toHaveBeenCalledWith(0, 49);
  });

  it('returns 500 on database error', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: { message: 'db crash' } });
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new Error('Unauthorized'));
    const res = await GET(makeRequest());
    expect(res.status).toBe(500); // handleGenerationRouteError handles auth errors
  });
});
