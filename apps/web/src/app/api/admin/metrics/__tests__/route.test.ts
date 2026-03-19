import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { getMetricsReport, parseWindowDays } from '@/lib/services/metrics.service';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/admin');
jest.mock('@/lib/services/metrics.service');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;
const mockGetMetricsReport = getMetricsReport as jest.MockedFunction<typeof getMetricsReport>;
const mockParseWindowDays = parseWindowDays as jest.MockedFunction<typeof parseWindowDays>;

function makeRequest(search = '') {
  return new Request(`http://localhost:3000/api/admin/metrics${search}`);
}

describe('GET /api/admin/metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseWindowDays.mockImplementation((value) => {
      const parsed = Number(value);
      return parsed === 7 || parsed === 30 || parsed === 90 ? parsed : 30;
    });
  });

  it('returns 403 for non-admin users', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue(null);

    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('returns metrics for admins', async () => {
    const report = {
      timestamp: '2026-03-12T00:00:00.000Z',
      users: { total: 50, last7d: 8, last30d: 22, active: 10 },
      generations: { total: 400, last24h: 16, last7d: 70, successRate: 91 },
      projects: { total: 33 },
      quality: {
        windowDays: 7 as const,
        totalGenerations: 70,
        revisionRate: 24,
        satisfactionRate: 80,
        satisfactionVotes: 10,
        mcpCoverage: 67,
      },
    };

    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetMetricsReport.mockResolvedValue(report);

    const response = await GET(makeRequest('?windowDays=7'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(report);
    expect(mockParseWindowDays).toHaveBeenCalledWith('7');
    expect(mockGetMetricsReport).toHaveBeenCalledWith(7);
  });

  it('falls back to default 30-day window when query is invalid', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetMetricsReport.mockResolvedValue({
      timestamp: '2026-03-12T00:00:00.000Z',
      users: { total: 0, last7d: 0, last30d: 0, active: 0 },
      generations: { total: 0, last24h: 0, last7d: 0, successRate: 0 },
      projects: { total: 0 },
      quality: {
        windowDays: 30,
        totalGenerations: 0,
        revisionRate: 0,
        satisfactionRate: null,
        satisfactionVotes: 0,
        mcpCoverage: 0,
      },
    });

    const response = await GET(makeRequest('?windowDays=14'));

    expect(response.status).toBe(200);
    expect(mockParseWindowDays).toHaveBeenCalledWith('14');
    expect(mockGetMetricsReport).toHaveBeenCalledWith(30);
  });

  it('returns 503 when service config is missing', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetMetricsReport.mockRejectedValue(new Error('Metrics service configuration missing'));

    const response = await GET(makeRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Metrics service is not configured' });
  });
});
