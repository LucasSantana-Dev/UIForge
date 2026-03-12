import { GET } from '../route';
import { getMetricsReport, parseWindowDays } from '@/lib/services/metrics.service';

jest.mock('@/lib/services/metrics.service');

const mockGetMetricsReport = getMetricsReport as jest.MockedFunction<typeof getMetricsReport>;
const mockParseWindowDays = parseWindowDays as jest.MockedFunction<typeof parseWindowDays>;

const VALID_KEY = 'test-metrics-key';

function makeRequest(headers: Record<string, string> = {}, search = '') {
  return new Request(`http://localhost:3000/api/metrics${search}`, { headers });
}

describe('GET /api/metrics', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockParseWindowDays.mockImplementation((value) => {
      const parsed = Number(value);
      return parsed === 7 || parsed === 30 || parsed === 90 ? parsed : 30;
    });
    process.env = {
      ...originalEnv,
      METRICS_API_KEY: VALID_KEY,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 503 when METRICS_API_KEY is not set', async () => {
    delete process.env.METRICS_API_KEY;
    const res = await GET(makeRequest());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'Metrics endpoint not configured' });
  });

  it('returns 401 with no authorization header', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 with wrong API key', async () => {
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-key' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed auth header', async () => {
    const res = await GET(makeRequest({ authorization: VALID_KEY }));
    expect(res.status).toBe(401);
  });

  it('returns metrics payload with quality block', async () => {
    mockGetMetricsReport.mockResolvedValue({
      timestamp: '2026-03-12T00:00:00.000Z',
      users: { total: 42, last7d: 5, last30d: 15, active: 2 },
      generations: { total: 200, last24h: 10, last7d: 50, successRate: 90 },
      projects: { total: 30 },
      quality: {
        windowDays: 30,
        totalGenerations: 120,
        revisionRate: 35,
        satisfactionRate: 72,
        satisfactionVotes: 18,
        mcpCoverage: 61,
      },
    });

    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }, '?windowDays=30'));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      users: { total: 42, last7d: 5, last30d: 15, active: 2 },
      generations: { total: 200, last24h: 10, last7d: 50, successRate: 90 },
      projects: { total: 30 },
      quality: {
        windowDays: 30,
        totalGenerations: 120,
        revisionRate: 35,
        satisfactionRate: 72,
        satisfactionVotes: 18,
        mcpCoverage: 61,
      },
    });
    expect(mockParseWindowDays).toHaveBeenCalledWith('30');
    expect(mockGetMetricsReport).toHaveBeenCalledWith(30);
  });

  it('falls back to default 30-day window when query is invalid', async () => {
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

    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }, '?windowDays=14'));
    expect(res.status).toBe(200);
    expect(mockParseWindowDays).toHaveBeenCalledWith('14');
    expect(mockGetMetricsReport).toHaveBeenCalledWith(30);
  });

  it('returns 500 when metrics service fails', async () => {
    mockGetMetricsReport.mockRejectedValue(new Error('Database query failed'));
    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Database query failed' });
  });

  it('returns 503 when metrics service configuration is missing', async () => {
    mockGetMetricsReport.mockRejectedValue(new Error('Metrics service configuration missing'));
    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'Metrics service configuration missing' });
  });
});
