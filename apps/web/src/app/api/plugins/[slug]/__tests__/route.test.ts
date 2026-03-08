/**
 * Integration Tests for Plugins API Routes - /api/plugins/[slug]
 */

import { NextRequest } from 'next/server';
import { GET, POST, DELETE, PATCH } from '../route';

const mockCreateClient = jest.fn();
const mockGetPluginDetail = jest.fn();
const mockInstallPluginForUser = jest.fn();
const mockUninstallPluginForUser = jest.fn();
const mockUpdatePluginConfigForUser = jest.fn();
const mockCaptureServerError = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

jest.mock('@/lib/services/plugin.service', () => ({
  getPluginDetail: (...args: unknown[]) => mockGetPluginDetail(...args),
  installPluginForUser: (...args: unknown[]) => mockInstallPluginForUser(...args),
  uninstallPluginForUser: (...args: unknown[]) => mockUninstallPluginForUser(...args),
  updatePluginConfigForUser: (...args: unknown[]) => mockUpdatePluginConfigForUser(...args),
}));

jest.mock('@/lib/sentry/server', () => ({
  captureServerError: (...args: unknown[]) => mockCaptureServerError(...args),
}));

type RouteContext = { params: Promise<{ slug: string }> };

describe('Plugins API - GET /api/plugins/[slug]', () => {
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

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications');
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await GET(request, context);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
    expect(mockGetPluginDetail).not.toHaveBeenCalled();
  });

  it('should return plugin detail for authenticated user', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockPlugin = {
      id: 'plugin-1',
      slug: 'slack-notifications',
      name: 'Slack Notifications',
      description: 'Send notifications to Slack',
      category: 'communication',
      status: 'active',
      icon_url: 'https://example.com/slack.png',
      widget_slots: ['dashboard'],
      installation: {
        enabled: true,
        installed_at: '2024-01-01T00:00:00Z',
        config: { webhook_url: 'https://hooks.slack.com/...' },
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

    mockGetPluginDetail.mockResolvedValue(mockPlugin);

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications');
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await GET(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockPlugin);
    expect(mockGetPluginDetail).toHaveBeenCalledWith('slack-notifications', 'user-123');
  });

  it('should return 404 for unknown plugin slug', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockGetPluginDetail.mockRejectedValue(new Error('Plugin "unknown-plugin" not found'));

    const request = new NextRequest('http://localhost/api/plugins/unknown-plugin');
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'unknown-plugin' }),
    };
    const response = await GET(request, context);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Plugin not found');
  });

  it('should return 500 and capture error for unexpected errors', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const unexpectedError = new Error('Database connection failed');
    mockGetPluginDetail.mockRejectedValue(unexpectedError);

    const request = new NextRequest('http://localhost/api/plugins/test-plugin');
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'test-plugin' }),
    };
    const response = await GET(request, context);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal error');
    expect(mockCaptureServerError).toHaveBeenCalledWith(unexpectedError, {
      route: '/api/plugins/test-plugin',
    });
  });
});

describe('Plugins API - POST /api/plugins/[slug]', () => {
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

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'POST',
      body: JSON.stringify({ config: { webhook_url: 'https://hooks.slack.com/...' } }),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await POST(request, context);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
    expect(mockInstallPluginForUser).not.toHaveBeenCalled();
  });

  it('should install plugin with config', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const config = { webhook_url: 'https://hooks.slack.com/...' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockInstallPluginForUser.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'POST',
      body: JSON.stringify({ config }),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await POST(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ installed: true });
    expect(mockInstallPluginForUser).toHaveBeenCalledWith(
      'slack-notifications',
      'user-123',
      config
    );
  });

  it('should install plugin without config', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockInstallPluginForUser.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/plugins/simple-plugin', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'simple-plugin' }),
    };
    const response = await POST(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ installed: true });
    expect(mockInstallPluginForUser).toHaveBeenCalledWith('simple-plugin', 'user-123', undefined);
  });

  it('should handle invalid JSON body gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockInstallPluginForUser.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/plugins/test-plugin', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'test-plugin' }),
    };
    const response = await POST(request, context);

    expect(response.status).toBe(200);
    expect(mockInstallPluginForUser).toHaveBeenCalledWith('test-plugin', 'user-123', undefined);
  });

  it('should return 404 for unknown plugin slug', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockInstallPluginForUser.mockRejectedValue(new Error('Plugin "unknown-plugin" not found'));

    const request = new NextRequest('http://localhost/api/plugins/unknown-plugin', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'unknown-plugin' }),
    };
    const response = await POST(request, context);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Plugin not found');
  });

  it('should return 500 and capture error for installation failure', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const installError = new Error('Installation failed');
    mockInstallPluginForUser.mockRejectedValue(installError);

    const request = new NextRequest('http://localhost/api/plugins/test-plugin', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'test-plugin' }),
    };
    const response = await POST(request, context);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to install');
    expect(mockCaptureServerError).toHaveBeenCalledWith(installError, {
      route: '/api/plugins/test-plugin',
    });
  });
});

describe('Plugins API - DELETE /api/plugins/[slug]', () => {
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

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'DELETE',
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await DELETE(request, context);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
    expect(mockUninstallPluginForUser).not.toHaveBeenCalled();
  });

  it('should uninstall plugin for authenticated user', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockUninstallPluginForUser.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'DELETE',
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await DELETE(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ uninstalled: true });
    expect(mockUninstallPluginForUser).toHaveBeenCalledWith('slack-notifications', 'user-123');
  });

  it('should return 500 and capture error for uninstallation failure', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const uninstallError = new Error('Database error');
    mockUninstallPluginForUser.mockRejectedValue(uninstallError);

    const request = new NextRequest('http://localhost/api/plugins/test-plugin', {
      method: 'DELETE',
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'test-plugin' }),
    };
    const response = await DELETE(request, context);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to uninstall');
    expect(mockCaptureServerError).toHaveBeenCalledWith(uninstallError, {
      route: '/api/plugins/test-plugin',
    });
  });
});

describe('Plugins API - PATCH /api/plugins/[slug]', () => {
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

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'PATCH',
      body: JSON.stringify({ config: { webhook_url: 'https://hooks.slack.com/new' } }),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await PATCH(request, context);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
    expect(mockUpdatePluginConfigForUser).not.toHaveBeenCalled();
  });

  it('should update plugin config for authenticated user', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const config = { webhook_url: 'https://hooks.slack.com/new' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockUpdatePluginConfigForUser.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await PATCH(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ updated: true });
    expect(mockUpdatePluginConfigForUser).toHaveBeenCalledWith(
      'slack-notifications',
      'user-123',
      config
    );
  });

  it('should return 400 when no config in body', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await PATCH(request, context);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Config required');
    expect(mockUpdatePluginConfigForUser).not.toHaveBeenCalled();
  });

  it('should return 400 when config is not provided', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'PATCH',
      body: JSON.stringify({ other_field: 'value' }),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await PATCH(request, context);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Config required');
  });

  it('should handle invalid JSON body gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const request = new NextRequest('http://localhost/api/plugins/slack-notifications', {
      method: 'PATCH',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'slack-notifications' }),
    };
    const response = await PATCH(request, context);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Config required');
  });

  it('should return 500 and capture error for update failure', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const config = { webhook_url: 'https://hooks.slack.com/new' };

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const updateError = new Error('Update failed');
    mockUpdatePluginConfigForUser.mockRejectedValue(updateError);

    const request = new NextRequest('http://localhost/api/plugins/test-plugin', {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'test-plugin' }),
    };
    const response = await PATCH(request, context);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to update config');
    expect(mockCaptureServerError).toHaveBeenCalledWith(updateError, {
      route: '/api/plugins/test-plugin',
    });
  });

  it('should accept empty object as config', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const config = {};

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    mockUpdatePluginConfigForUser.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/plugins/test-plugin', {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    });
    const context: RouteContext = {
      params: Promise.resolve({ slug: 'test-plugin' }),
    };
    const response = await PATCH(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ updated: true });
    expect(mockUpdatePluginConfigForUser).toHaveBeenCalledWith('test-plugin', 'user-123', config);
  });
});
