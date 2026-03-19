import { NextRequest } from 'next/server';
import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/sentry/server');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockSetRateLimitHeaders = setRateLimitHeaders as jest.MockedFunction<
  typeof setRateLimitHeaders
>;

describe('GET /api/templates', () => {
  const mockRange = jest.fn();
  const mockOrder = jest.fn(() => ({ range: mockRange }));
  const mockEq = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 119,
      resetAt: Date.now() + 60000,
    });

    mockSetRateLimitHeaders.mockImplementation((response) => response);

    const chain = {
      eq: mockEq,
      order: mockOrder,
      range: mockRange,
      select: jest.fn(),
    } as any;

    chain.select.mockReturnValue(chain);
    mockEq.mockReturnValue(chain);
    mockOrder.mockReturnValue(chain);
    mockRange.mockResolvedValue({ data: [], error: null });

    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => chain),
    } as any);
  });

  it('applies official ownership filter for unauthenticated all mode', async () => {
    mockGetSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/templates?ownership=all');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockEq).toHaveBeenCalledWith('is_official', true);
  });

  it('does not apply ownership restriction for authenticated all mode', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'f4d6ebfe-efec-4180-b0f0-5a31db00ecfe' } as any,
    });

    const request = new NextRequest('http://localhost/api/templates?ownership=all');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockEq).not.toHaveBeenCalledWith('created_by', 'f4d6ebfe-efec-4180-b0f0-5a31db00ecfe');
  });

  it('applies official-only filter', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'f4d6ebfe-efec-4180-b0f0-5a31db00ecfe' } as any,
    });

    const request = new NextRequest('http://localhost/api/templates?ownership=official');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockEq).toHaveBeenCalledWith('is_official', true);
  });

  it('applies mine filter for authenticated user', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'f4d6ebfe-efec-4180-b0f0-5a31db00ecfe' } as any,
    });

    const request = new NextRequest('http://localhost/api/templates?ownership=mine');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockEq).toHaveBeenCalledWith('created_by', 'f4d6ebfe-efec-4180-b0f0-5a31db00ecfe');
  });

  it('returns 401 for ownership=mine without session', async () => {
    mockGetSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/templates?ownership=mine');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.message).toContain('Authentication required for ownership=mine');
  });

  it('returns 500 on database error', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'f4d6ebfe-efec-4180-b0f0-5a31db00ecfe' } as any,
    });
    mockRange.mockResolvedValue({ data: null, error: { message: 'db failed' } });

    const request = new NextRequest('http://localhost/api/templates?ownership=all');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
