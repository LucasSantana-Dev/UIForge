import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  verifySession: jest.fn(),
}));

describe('GET /api/components', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and components list for authenticated user', async () => {
    const { verifySession } = require('@/lib/auth');
    const { createClient } = require('@/lib/supabase');

    verifySession.mockResolvedValue({ user: mockUser });

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'Button', component_type: 'generated' },
          { id: '2', name: 'Card', component_type: 'custom' }
        ],
        error: null
      })
    };

    const mockSupabase = {
      from: jest.fn(() => mockChain)
    };

    createClient.mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/components');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe('Button');
  });

  it('should return 401 for unauthenticated request', async () => {
    const { verifySession } = require('@/lib/auth');

    verifySession.mockResolvedValue({ user: null });

    const request = new NextRequest('http://localhost:3000/api/components');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return 500 on database error', async () => {
    const { verifySession } = require('@/lib/auth');
    const { createClient } = require('@/lib/supabase');

    verifySession.mockResolvedValue({ user: mockUser });

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockRejectedValue(new Error('Database error'))
    };

    const mockSupabase = {
      from: jest.fn(() => mockChain)
    };

    createClient.mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/components');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
