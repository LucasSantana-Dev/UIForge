import { NextRequest } from 'next/server';
import { GET } from '../route';
import { verifySession } from '@/lib/api/auth';
import { UnauthorizedError } from '@/lib/api/errors';
import { checkRateLimit } from '@/lib/api/rate-limit';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/sentry/server');

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;

describe('Generations History API - GET /api/generations/history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: Date.now() + 60000,
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Authentication required'));

    const request = new NextRequest('http://localhost/api/generations/history');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.message).toBe('Authentication required');
  });
});
