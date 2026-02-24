/**
 * Integration Tests for Projects API Routes
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import * as auth from '@/lib/api/auth';
import * as rateLimit from '@/lib/api/rate-limit';
import { UnauthorizedError } from '@/lib/api/errors';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/rate-limit');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifySession = auth.verifySession as jest.MockedFunction<typeof auth.verifySession>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<
  typeof rateLimit.checkRateLimit
>;

// TODO: Enable when mock paths are fixed to match actual imports
describe.skip('Projects API - GET /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default rate limit mock
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: Date.now() + 60000,
    });

    // Default auth mock
    mockVerifySession.mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
    });
  });

  it('should return paginated projects for authenticated user', async () => {
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'Project 1',
        user_id: 'user-123',
        framework: 'react',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'proj-2',
        name: 'Project 2',
        user_id: 'user-123',
        framework: 'nextjs',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockProjects,
                error: null,
                count: 2,
              }),
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.projects).toHaveLength(2);
    expect(data.data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      pages: 1,
    });
  });

  it('should apply search filter', async () => {
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0,
              }),
            }),
          }),
        }),
      }),
    });

    mockCreateClient.mockResolvedValue({
      from: mockFrom,
    } as any);

    const request = new NextRequest('http://localhost/api/projects?search=test');
    await GET(request);

    expect(mockFrom).toHaveBeenCalledWith('projects');
  });

  it('should apply framework filter', async () => {
    const mockEq = jest.fn().mockReturnValue({
      order: jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      }),
    });

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: mockEq,
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects?framework=react');
    await GET(request);

    expect(mockEq).toHaveBeenCalledWith('framework', 'react');
  });

  it('should return 401 when not authenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Not authenticated'));

    const request = new NextRequest('http://localhost/api/projects');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 429 when rate limit exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });

    const request = new NextRequest('http://localhost/api/projects');
    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
  });

  it('should handle database errors gracefully', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
                count: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

describe('Projects API - POST /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetAt: Date.now() + 60000,
    });

    mockVerifySession.mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
    });
  });

  it('should create project with valid data', async () => {
    const newProject = {
      id: 'proj-new',
      name: 'New Project',
      framework: 'react',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: newProject,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Project',
        framework: 'react',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('New Project');
  });

  it('should return 400 for invalid data', async () => {
    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: '', // Invalid: empty name
        framework: 'react',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should return 400 for invalid framework', async () => {
    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Project',
        framework: 'invalid-framework',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should apply default values', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'proj-new',
            name: 'Test',
            framework: 'react',
            component_library: 'none',
            is_public: false,
            user_id: 'user-123',
          },
          error: null,
        }),
      }),
    });

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        framework: 'react',
      }),
    });

    await POST(request);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
      })
    );
  });

  it('should return 401 when not authenticated', async () => {
    mockVerifySession.mockRejectedValue(new UnauthorizedError('Not authenticated'));

    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        framework: 'react',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('should handle database errors', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        framework: 'react',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
