import { GET } from '@/app/api/plugins/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/services/plugin.service', () => ({
  listPluginsForUser: jest.fn(),
}));

const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ auth: { getUser: mockGetUser } })),
}));

import { listPluginsForUser } from '@/lib/services/plugin.service';
const mockListPluginsForUser = listPluginsForUser as jest.MockedFunction<typeof listPluginsForUser>;

const PLUGINS_RESULT = {
  plugins: [
    { slug: 'security-scan', name: 'Security Scan', enabled: true },
    { slug: 'code-quality', name: 'Code Quality', enabled: true },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
};

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/plugins');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
  mockListPluginsForUser.mockResolvedValue(PLUGINS_RESULT as never);
});

describe('GET /api/plugins', () => {
  it('returns plugin list for authenticated user', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.plugins).toHaveLength(2);
    expect(mockListPluginsForUser).toHaveBeenCalledWith('u1', {
      search: undefined,
      category: undefined,
      status: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('passes query params to service', async () => {
    await GET(makeRequest({ search: 'sec', category: 'security', page: '2', limit: '10' }));
    expect(mockListPluginsForUser).toHaveBeenCalledWith('u1', {
      search: 'sec',
      category: 'security',
      status: undefined,
      page: 2,
      limit: 10,
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns empty list when service returns no plugins', async () => {
    mockListPluginsForUser.mockResolvedValue({
      plugins: [],
      total: 0,
      page: 1,
      pageSize: 20,
    } as never);
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.plugins).toHaveLength(0);
  });
});
