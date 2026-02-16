/**
 * Integration Tests for Individual Project API Routes
 */

import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '../route';
import { createClient } from '@/lib/supabase/server';
import * as auth from '@/lib/api/auth';
import * as rateLimit from '@/lib/api/rate-limit';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/rate-limit');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifySession = auth.verifySession as jest.MockedFunction<
  typeof auth.verifySession
>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<
  typeof rateLimit.checkRateLimit
>;

describe('Projects API - GET /api/projects/[id]', () => {
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

  it('should return project by ID for owner', async () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      user_id: 'user-123',
      framework: 'react',
      is_public: false,
    };

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123');
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await GET(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('proj-123');
  });

  it('should return public project for non-owner', async () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Public Project',
      user_id: 'user-456',
      framework: 'react',
      is_public: true,
    };

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123');
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await GET(request, context);

    expect(response.status).toBe(200);
  });

  it('should return 403 for private project of another user', async () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Private Project',
      user_id: 'user-456',
      framework: 'react',
      is_public: false,
    };

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123');
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await GET(request, context);

    expect(response.status).toBe(403);
  });

  it('should return 404 when project not found', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-999');
    const context = { params: Promise.resolve({ id: 'proj-999' }) };
    const response = await GET(request, context);

    expect(response.status).toBe(404);
  });
});

describe('Projects API - PATCH /api/projects/[id]', () => {
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

  it('should update project when user is owner', async () => {
    const updatedProject = {
      id: 'proj-123',
      name: 'Updated Project',
      user_id: 'user-123',
      framework: 'react',
    };

    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_id: 'user-123' },
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedProject,
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Project' }),
    });
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await PATCH(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Updated Project');
  });

  it('should return 403 when user is not owner', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_id: 'user-456' },
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    });
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await PATCH(request, context);

    expect(response.status).toBe(403);
  });

  it('should return 404 when project not found', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-999', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    });
    const context = { params: Promise.resolve({ id: 'proj-999' }) };
    const response = await PATCH(request, context);

    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid update data', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_id: 'user-123' },
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123', {
      method: 'PATCH',
      body: JSON.stringify({ framework: 'invalid-framework' }),
    });
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await PATCH(request, context);

    expect(response.status).toBe(400);
  });
});

describe('Projects API - DELETE /api/projects/[id]', () => {
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

  it('should delete project when user is owner', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_id: 'user-123' },
              error: null,
            }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123', {
      method: 'DELETE',
    });
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await DELETE(request, context);

    expect(response.status).toBe(204);
  });

  it('should return 403 when user is not owner', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_id: 'user-456' },
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123', {
      method: 'DELETE',
    });
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await DELETE(request, context);

    expect(response.status).toBe(403);
  });

  it('should return 404 when project not found', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-999', {
      method: 'DELETE',
    });
    const context = { params: Promise.resolve({ id: 'proj-999' }) };
    const response = await DELETE(request, context);

    expect(response.status).toBe(404);
  });

  it('should handle database errors', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_id: 'user-123' },
              error: null,
            }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost/api/projects/proj-123', {
      method: 'DELETE',
    });
    const context = { params: Promise.resolve({ id: 'proj-123' }) };
    const response = await DELETE(request, context);

    expect(response.status).toBe(500);
  });
});
