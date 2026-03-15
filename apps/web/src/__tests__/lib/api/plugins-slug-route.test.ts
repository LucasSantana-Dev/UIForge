import { GET, POST, DELETE, PATCH } from '@/app/api/plugins/[slug]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/services/plugin.service', () => ({
  getPluginDetail: jest.fn(),
  installPluginForUser: jest.fn(),
  uninstallPluginForUser: jest.fn(),
  updatePluginConfigForUser: jest.fn(),
}));
jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ auth: { getUser: mockGetUser } })),
}));

import {
  getPluginDetail,
  installPluginForUser,
  uninstallPluginForUser,
  updatePluginConfigForUser,
} from '@/lib/services/plugin.service';

const mockGetPluginDetail = getPluginDetail as jest.MockedFunction<typeof getPluginDetail>;
const mockInstallPlugin = installPluginForUser as jest.MockedFunction<typeof installPluginForUser>;
const mockUninstallPlugin = uninstallPluginForUser as jest.MockedFunction<
  typeof uninstallPluginForUser
>;
const mockUpdatePluginConfig = updatePluginConfigForUser as jest.MockedFunction<
  typeof updatePluginConfigForUser
>;

const USER = { id: 'u1', email: 'user@test.com' };
const PLUGIN = {
  slug: 'security-scan',
  name: 'Security Scan',
  enabled: true,
  installed: false,
};

function makeRequest(method: string, slug: string, body?: Record<string, unknown>) {
  return new NextRequest(`http://localhost/api/plugins/${slug}`, {
    method,
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

function makeContext(slug = 'security-scan') {
  return { params: Promise.resolve({ slug }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
  mockGetPluginDetail.mockResolvedValue(PLUGIN as never);
  mockInstallPlugin.mockResolvedValue(undefined);
  mockUninstallPlugin.mockResolvedValue(undefined);
  mockUpdatePluginConfig.mockResolvedValue(undefined);
});

describe('GET /api/plugins/[slug]', () => {
  it('returns plugin detail for authenticated user', async () => {
    const res = await GET(makeRequest('GET', 'security-scan'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockGetPluginDetail).toHaveBeenCalledWith('security-scan', USER.id);
    expect(body.slug).toBe('security-scan');
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await GET(makeRequest('GET', 'security-scan'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 404 when plugin not found', async () => {
    mockGetPluginDetail.mockRejectedValue(new Error('Plugin not found'));

    const res = await GET(makeRequest('GET', 'unknown'), makeContext('unknown'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Plugin not found');
  });

  it('returns 500 on unexpected error', async () => {
    mockGetPluginDetail.mockRejectedValue(new Error('DB error'));

    const res = await GET(makeRequest('GET', 'security-scan'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(500);
  });
});

describe('POST /api/plugins/[slug] — install', () => {
  it('installs plugin for user', async () => {
    const res = await POST(
      makeRequest('POST', 'security-scan', { config: { threshold: 5 } }),
      makeContext()
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.installed).toBe(true);
    expect(mockInstallPlugin).toHaveBeenCalledWith('security-scan', USER.id, { threshold: 5 });
  });

  it('installs plugin without config', async () => {
    const res = await POST(makeRequest('POST', 'security-scan', {}), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.installed).toBe(true);
    expect(mockInstallPlugin).toHaveBeenCalledWith('security-scan', USER.id, undefined);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await POST(makeRequest('POST', 'security-scan', {}), makeContext());
    expect(res.status).toBe(401);
  });

  it('returns 404 when plugin not found', async () => {
    mockInstallPlugin.mockRejectedValue(new Error('Plugin security-scan not found'));

    const res = await POST(makeRequest('POST', 'security-scan', {}), makeContext());
    const body = await res.json();

    expect(res.status).toBe(404);
  });

  it('returns 500 on unexpected error', async () => {
    mockInstallPlugin.mockRejectedValue(new Error('DB error'));

    const res = await POST(makeRequest('POST', 'security-scan', {}), makeContext());
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/plugins/[slug] — uninstall', () => {
  it('uninstalls plugin for user', async () => {
    const res = await DELETE(makeRequest('DELETE', 'security-scan'), makeContext());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.uninstalled).toBe(true);
    expect(mockUninstallPlugin).toHaveBeenCalledWith('security-scan', USER.id);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await DELETE(makeRequest('DELETE', 'security-scan'), makeContext());
    expect(res.status).toBe(401);
  });

  it('returns 500 on unexpected error', async () => {
    mockUninstallPlugin.mockRejectedValue(new Error('DB error'));

    const res = await DELETE(makeRequest('DELETE', 'security-scan'), makeContext());
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/plugins/[slug] — update config', () => {
  it('updates plugin config', async () => {
    const res = await PATCH(
      makeRequest('PATCH', 'security-scan', { config: { threshold: 10 } }),
      makeContext()
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.updated).toBe(true);
    expect(mockUpdatePluginConfig).toHaveBeenCalledWith('security-scan', USER.id, {
      threshold: 10,
    });
  });

  it('returns 400 when config is missing', async () => {
    const res = await PATCH(makeRequest('PATCH', 'security-scan', {}), makeContext());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Config required/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await PATCH(
      makeRequest('PATCH', 'security-scan', { config: { x: 1 } }),
      makeContext()
    );
    expect(res.status).toBe(401);
  });

  it('returns 500 on unexpected error', async () => {
    mockUpdatePluginConfig.mockRejectedValue(new Error('DB error'));

    const res = await PATCH(
      makeRequest('PATCH', 'security-scan', { config: { x: 1 } }),
      makeContext()
    );
    expect(res.status).toBe(500);
  });
});
