import { GET } from '@/app/api/metrics/route';

jest.mock('@/lib/services/metrics.service', () => ({
  getMetricsReport: jest.fn(),
  parseWindowDays: jest.fn((v: string | null) => (v ? parseInt(v, 10) : 7)),
}));

import { getMetricsReport } from '@/lib/services/metrics.service';
const mockGetMetricsReport = getMetricsReport as jest.MockedFunction<typeof getMetricsReport>;

const REPORT = { totalUsers: 100, activeUsers: 40, generations: 500 };

function makeRequest(opts: { auth?: string; windowDays?: string } = {}) {
  const url = new URL('http://localhost/api/metrics');
  if (opts.windowDays) url.searchParams.set('windowDays', opts.windowDays);
  const headers: Record<string, string> = {};
  if (opts.auth !== undefined) headers['authorization'] = opts.auth;
  return new Request(url.toString(), { headers });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.METRICS_API_KEY = 'secret-key';
  mockGetMetricsReport.mockResolvedValue(REPORT as never);
});

afterEach(() => {
  delete process.env.METRICS_API_KEY;
});

describe('GET /api/metrics', () => {
  it('returns metrics report with valid API key', async () => {
    const res = await GET(makeRequest({ auth: 'Bearer secret-key' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalUsers).toBe(100);
    expect(mockGetMetricsReport).toHaveBeenCalledWith(7);
  });

  it('passes windowDays param to service', async () => {
    await GET(makeRequest({ auth: 'Bearer secret-key', windowDays: '30' }));
    expect(mockGetMetricsReport).toHaveBeenCalledWith(30);
  });

  it('returns 401 with wrong API key', async () => {
    const res = await GET(makeRequest({ auth: 'Bearer wrong-key' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
    expect(mockGetMetricsReport).not.toHaveBeenCalled();
  });

  it('returns 401 with missing authorization header', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 503 when METRICS_API_KEY is not set', async () => {
    delete process.env.METRICS_API_KEY;
    const res = await GET(makeRequest({ auth: 'Bearer secret-key' }));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 500 on service error', async () => {
    mockGetMetricsReport.mockRejectedValue(new Error('DB unavailable'));
    const res = await GET(makeRequest({ auth: 'Bearer secret-key' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/DB unavailable/i);
  });
});
