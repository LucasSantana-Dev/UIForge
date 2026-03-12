import { NextRequest } from 'next/server';
import { GET } from '../route';
import { verifySession } from '@/lib/api/auth';
import { UnauthorizedError } from '@/lib/api/errors';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/sentry/server');

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockSetRateLimitHeaders = setRateLimitHeaders as jest.MockedFunction<
  typeof setRateLimitHeaders
>;

describe('Generations API - GET /api/generations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: Date.now() + 60000,
    });
    mockSetRateLimitHeaders.mockImplementation((response) => response);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Authentication required'));

    const request = new NextRequest('http://localhost/api/generations/gen-1');
    const context = { params: Promise.resolve({ id: 'gen-1' }) };
    const response = await GET(request, context);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.message).toBe('Authentication required');
  });
});
