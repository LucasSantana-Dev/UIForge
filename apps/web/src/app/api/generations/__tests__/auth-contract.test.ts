import { NextRequest } from 'next/server';
import { GET as getGenerationById } from '../[id]/route';
import { GET as getGenerationsList } from '../route';
import { GET as getGenerationsHistory } from '../history/route';
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

type Scenario = {
  name: string;
  createRequest: () => NextRequest;
  run: (request: NextRequest) => Promise<Response>;
};

const scenarios: Scenario[] = [
  {
    name: 'GET /api/generations',
    createRequest: () => new NextRequest('http://localhost/api/generations?project_id=proj-1'),
    run: (request) => getGenerationsList(request),
  },
  {
    name: 'GET /api/generations/history',
    createRequest: () => new NextRequest('http://localhost/api/generations/history'),
    run: (request) => getGenerationsHistory(request),
  },
  {
    name: 'GET /api/generations/[id]',
    createRequest: () => new NextRequest('http://localhost/api/generations/gen-1'),
    run: (request) => getGenerationById(request, { params: Promise.resolve({ id: 'gen-1' }) }),
  },
];

describe('Generations API auth contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: Date.now() + 60000,
    });
    mockSetRateLimitHeaders.mockImplementation((response) => response);
  });

  it.each(scenarios)('$name returns 401 when unauthenticated', async ({ createRequest, run }) => {
    mockVerifySession.mockRejectedValueOnce(new UnauthorizedError('Authentication required'));

    const response = await run(createRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: 'Authentication required' },
    });
  });
});
