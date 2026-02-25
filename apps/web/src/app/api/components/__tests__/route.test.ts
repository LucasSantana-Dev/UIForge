/**
 * Integration Tests for Components API Routes
 * Tests for GET /api/components, POST /api/components
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { UnauthorizedError } from '@/lib/api/errors';



jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/sentry/server');
jest.mock('@/lib/api/storage');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockSetRateLimitHeaders = setRateLimitHeaders as jest.MockedFunction<
  typeof setRateLimitHeaders
>;


describe('GET /api/components', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as any;
  const projectId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 119,
      resetAt: Date.now() + 60000,
    });

    mockSetRateLimitHeaders.mockImplementation((res) => res);
  });

  it('should return 200 and components list for authenticated user', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockComponents = [
      { id: '1', name: 'Button', component_type: 'button' },
      { id: '2', name: 'Card', component_type: 'card' },
    ];

    const mockChain: any = {};
    mockChain.select = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);
    mockChain.order = jest.fn().mockResolvedValue({
      data: mockComponents,
      error: null,
    });
    mockChain.single = jest.fn().mockResolvedValue({
      data: { id: projectId, user_id: mockUser.id, is_public: false },
      error: null,
    });

    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => mockChain),
    } as any);

    const request = new NextRequest(
      `http://localhost:3000/api/components?project_id=${projectId}`
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.components).toHaveLength(2);
    expect(result.data.components[0].name).toBe('Button');
  });

  it('should return 401 for unauthenticated request', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Not authenticated'));

    const request = new NextRequest(
      `http://localhost:3000/api/components?project_id=${projectId}`
    );
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 500 on database error', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockChain: any = {};
    mockChain.select = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);
    mockChain.order = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });
    mockChain.single = jest.fn().mockResolvedValue({
      data: { id: projectId, user_id: mockUser.id, is_public: false },
      error: null,
    });

    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => mockChain),
    } as any);

    const request = new NextRequest(
      `http://localhost:3000/api/components?project_id=${projectId}`
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
  });

  it('should return 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });

    const request = new NextRequest(
      `http://localhost:3000/api/components?project_id=${projectId}`
    );
    const response = await GET(request);

    expect(response.status).toBe(429);
  });

  it('should return 404 for non-existent project', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockChain: any = {};
    mockChain.select = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);
    mockChain.single = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => mockChain),
    } as any);

    const request = new NextRequest(
      `http://localhost:3000/api/components?project_id=${projectId}`
    );
    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it('should return 403 for private project of another user', async () => {
    mockVerifySession.mockResolvedValue({ user: mockUser });

    const mockChain: any = {};
    mockChain.select = jest.fn(() => mockChain);
    mockChain.eq = jest.fn(() => mockChain);
    mockChain.single = jest.fn().mockResolvedValue({
      data: { id: projectId, user_id: 'other-user', is_public: false },
      error: null,
    });

    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => mockChain),
    } as any);

    const request = new NextRequest(
      `http://localhost:3000/api/components?project_id=${projectId}`
    );
    const response = await GET(request);

    expect(response.status).toBe(403);
  });
});
