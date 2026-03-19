import { GET } from '@/app/api/audit/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/local-auth-bypass', () => ({ isLocalAuthBypassEnabled: jest.fn() }));
jest.mock('@/lib/audit/client', () => ({
  fetchAuditEvents: jest.fn(),
  fetchAuditSummary: jest.fn(),
}));

const mockGetUser = jest.fn();
const mockProfileSingle = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: jest.fn(() => ({
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: mockProfileSingle })) })),
      })),
    })
  ),
}));

import { isLocalAuthBypassEnabled } from '@/lib/auth/local-auth-bypass';
import { fetchAuditEvents, fetchAuditSummary } from '@/lib/audit/client';

const mockIsLocalAuthBypass = isLocalAuthBypassEnabled as jest.MockedFunction<
  typeof isLocalAuthBypassEnabled
>;
const mockFetchAuditEvents = fetchAuditEvents as jest.MockedFunction<typeof fetchAuditEvents>;
const mockFetchAuditSummary = fetchAuditSummary as jest.MockedFunction<typeof fetchAuditSummary>;

const ADMIN_USER = { id: 'admin-1', email: 'admin@test.com' };
const AUDIT_EVENTS = { events: [{ id: '1', event_type: 'login', severity: 'info' }], total: 1 };
const AUDIT_SUMMARY = { total: 100, by_severity: { info: 90, warn: 10 } };

function makeRequest(searchParams: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/audit');
  Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsLocalAuthBypass.mockReturnValue(false);
  mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER }, error: null });
  mockProfileSingle.mockResolvedValue({ data: { role: 'admin' }, error: null });
  mockFetchAuditEvents.mockResolvedValue(AUDIT_EVENTS as never);
  mockFetchAuditSummary.mockResolvedValue(AUDIT_SUMMARY as never);
});

describe('GET /api/audit', () => {
  it('returns audit events for admin user', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(AUDIT_EVENTS);
    expect(mockFetchAuditEvents).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 50 })
    );
  });

  it('returns audit summary when summary=true', async () => {
    const res = await GET(makeRequest({ summary: 'true' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(AUDIT_SUMMARY);
    expect(mockFetchAuditSummary).toHaveBeenCalled();
    expect(mockFetchAuditEvents).not.toHaveBeenCalled();
  });

  it('passes query params to fetchAuditEvents', async () => {
    await GET(
      makeRequest({
        page: '2',
        page_size: '10',
        event_type: 'login',
        severity: 'warn',
        user_id: 'u5',
      })
    );

    expect(mockFetchAuditEvents).toHaveBeenCalledWith({
      page: 2,
      page_size: 10,
      event_type: 'login',
      severity: 'warn',
      user_id: 'u5',
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not admin', async () => {
    mockProfileSingle.mockResolvedValue({ data: { role: 'user' }, error: null });

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('allows access when local auth bypass is enabled', async () => {
    mockIsLocalAuthBypass.mockReturnValue(true);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    // Should not check user/profile when bypass enabled
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('returns 502 when audit fetch fails', async () => {
    mockFetchAuditEvents.mockRejectedValue(new Error('Audit service unreachable'));

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.error).toBe('Audit service unreachable');
  });
});
