/**
 * Integration Tests for Plugins API Routes - GET /api/plugins
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

const mockCreateClient = jest.fn();
const mockListPluginsForUser = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

jest.mock('@/lib/services/plugin.service', () => ({
  listPluginsForUser: (...args: unknown[]) => mockListPluginsForUser(...args),
}));

jest.mock('@/lib/sentry/server', () => ({
  captureServerError: jest.fn(),
}));

describe('Plugins API - GET /api/plugins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no authenticated user', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });

    const request = new NextRequest('http://localhost/api/plugins');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
    expect(mockListPluginsForUser).not.toHaveBeenCalled();
  });

  it('should return plugins list with default pagination', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockResult = {
      data: [
        {
          id: 'plugin-1',
          slug: 'slack-notifications',
          name: 'Slack Notifications',
          category: 'communication',
          status: 'active',
          installation: { enabled: true, installed_at: '2024-01-01T00:00:00Z' },
        },
        {
          id: 'plugin-2',
          slug: 'github-integration',
          name: 'GitHub Integration',
          category: 'vcs',
          status: 'active',
          installation: null,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        pages: 1,
      },
    };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost/api/plugins');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResult);
    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: undefined,
      category: undefined,
      status: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('should pass search query parameter to service', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    });

    const request = new NextRequest('http://localhost/api/plugins?search=slack');
    await GET(request);

    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: 'slack',
      category: undefined,
      status: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('should pass category filter to service', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    });

    const request = new NextRequest('http://localhost/api/plugins?category=communication');
    await GET(request);

    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: undefined,
      category: 'communication',
      status: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('should pass status filter to service', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    });

    const request = new NextRequest('http://localhost/api/plugins?status=active');
    await GET(request);

    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: undefined,
      category: undefined,
      status: 'active',
      page: 1,
      limit: 20,
    });
  });

  it('should pass custom page and limit to service', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue({
      data: [],
      pagination: { page: 2, limit: 50, total: 0, pages: 0 },
    });

    const request = new NextRequest('http://localhost/api/plugins?page=2&limit=50');
    await GET(request);

    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: undefined,
      category: undefined,
      status: undefined,
      page: 2,
      limit: 50,
    });
  });

  it('should pass all query parameters combined to service', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue({
      data: [],
      pagination: { page: 3, limit: 10, total: 0, pages: 0 },
    });

    const request = new NextRequest(
      'http://localhost/api/plugins?search=github&category=vcs&status=active&page=3&limit=10'
    );
    await GET(request);

    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: 'github',
      category: 'vcs',
      status: 'active',
      page: 3,
      limit: 10,
    });
  });

  it('should return correct JSON response shape', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockResult = {
      data: [
        {
          id: 'plugin-1',
          slug: 'test-plugin',
          name: 'Test Plugin',
          description: 'A test plugin',
          category: 'utility',
          status: 'active',
          icon_url: 'https://example.com/icon.png',
          widget_slots: ['dashboard', 'sidebar'],
          installation: {
            enabled: true,
            installed_at: '2024-01-01T00:00:00Z',
            config: { key: 'value' },
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      },
    };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost/api/plugins');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResult);
    expect(data.data).toBeInstanceOf(Array);
    expect(data.pagination).toBeDefined();
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('limit');
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('pages');
  });

  it('should handle non-numeric page parameter', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    });

    const request = new NextRequest('http://localhost/api/plugins?page=invalid');
    await GET(request);

    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: undefined,
      category: undefined,
      status: undefined,
      page: NaN,
      limit: 20,
    });
  });

  it('should handle empty string query parameters as undefined', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockListPluginsForUser.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    });

    const request = new NextRequest('http://localhost/api/plugins?search=&category=');
    await GET(request);

    expect(mockListPluginsForUser).toHaveBeenCalledWith('user-123', {
      search: undefined,
      category: undefined,
      status: undefined,
      page: 1,
      limit: 20,
    });
  });
});
