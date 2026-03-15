import { GET as getMetrics } from '@/app/api/admin/metrics/route';
import { GET as getSecurity } from '@/app/api/admin/security/route';
import { GET as getValidation } from '@/app/api/admin/validation/route';

jest.mock('@/lib/api/admin', () => ({ verifyAdmin: jest.fn() }));
jest.mock('@/lib/services/metrics.service', () => ({
  getMetricsReport: jest.fn(),
  parseWindowDays: jest.fn((v) => (v ? parseInt(v, 10) : 7)),
}));
jest.mock('@/lib/services/security-telemetry.service', () => ({
  getSecurityTelemetryReport: jest.fn(),
}));
jest.mock('@/lib/services/core-flow-validation.service', () => ({
  getCoreFlowValidationReport: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({})),
}));

import { verifyAdmin } from '@/lib/api/admin';
import { getMetricsReport } from '@/lib/services/metrics.service';
import { getSecurityTelemetryReport } from '@/lib/services/security-telemetry.service';
import { getCoreFlowValidationReport } from '@/lib/services/core-flow-validation.service';

const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;
const mockGetMetricsReport = getMetricsReport as jest.MockedFunction<typeof getMetricsReport>;
const mockGetSecurityReport = getSecurityTelemetryReport as jest.MockedFunction<
  typeof getSecurityTelemetryReport
>;
const mockGetValidationReport = getCoreFlowValidationReport as jest.MockedFunction<
  typeof getCoreFlowValidationReport
>;

const ADMIN_USER = { id: 'admin-1', email: 'admin@test.com' };
const METRICS_REPORT = { totalGenerations: 100, activeUsers: 50 };
const SECURITY_REPORT = { violations: 3, blocked: 1 };
const VALIDATION_REPORT = { passed: 95, failed: 5 };

function makeRequest(path = '/api/admin/metrics', searchParams?: Record<string, string>) {
  const url = new URL(`http://localhost${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Request(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyAdmin.mockResolvedValue(ADMIN_USER as never);
  mockGetMetricsReport.mockResolvedValue(METRICS_REPORT as never);
  mockGetSecurityReport.mockResolvedValue(SECURITY_REPORT as never);
  mockGetValidationReport.mockResolvedValue(VALIDATION_REPORT as never);
});

describe('GET /api/admin/metrics', () => {
  it('returns metrics report for admin', async () => {
    const res = await getMetrics(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(METRICS_REPORT);
    expect(mockGetMetricsReport).toHaveBeenCalled();
  });

  it('passes windowDays query param', async () => {
    await getMetrics(makeRequest('/api/admin/metrics', { windowDays: '30' }));
    expect(mockGetMetricsReport).toHaveBeenCalledWith(30);
  });

  it('returns 403 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValue(null);

    const res = await getMetrics(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('returns 503 when metrics not configured', async () => {
    mockGetMetricsReport.mockRejectedValue(new Error('configuration missing'));

    const res = await getMetrics(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetMetricsReport.mockRejectedValue(new Error('DB error'));

    const res = await getMetrics(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to load metrics/i);
  });
});

describe('GET /api/admin/security', () => {
  it('returns security telemetry report for admin', async () => {
    const res = await getSecurity(makeRequest('/api/admin/security'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(SECURITY_REPORT);
    expect(mockGetSecurityReport).toHaveBeenCalled();
  });

  it('passes windowDays query param', async () => {
    await getSecurity(makeRequest('/api/admin/security', { windowDays: '14' }));
    expect(mockGetSecurityReport).toHaveBeenCalledWith(14);
  });

  it('returns 403 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValue(null);

    const res = await getSecurity(makeRequest('/api/admin/security'));
    const body = await res.json();

    expect(res.status).toBe(403);
  });

  it('returns 503 when service not configured', async () => {
    mockGetSecurityReport.mockRejectedValue(new Error('configuration missing'));

    const res = await getSecurity(makeRequest('/api/admin/security'));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetSecurityReport.mockRejectedValue(new Error('Network error'));

    const res = await getSecurity(makeRequest('/api/admin/security'));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to load security telemetry/i);
  });
});

describe('GET /api/admin/validation', () => {
  it('returns core-flow validation report for admin', async () => {
    const res = await getValidation(makeRequest('/api/admin/validation'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(VALIDATION_REPORT);
    expect(mockGetValidationReport).toHaveBeenCalled();
  });

  it('passes windowDays to validation report', async () => {
    await getValidation(makeRequest('/api/admin/validation', { windowDays: '3' }));
    expect(mockGetValidationReport).toHaveBeenCalledWith(expect.any(Date), 3);
  });

  it('returns 403 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValue(null);

    const res = await getValidation(makeRequest('/api/admin/validation'));
    const body = await res.json();

    expect(res.status).toBe(403);
  });

  it('returns 503 when service not configured', async () => {
    mockGetValidationReport.mockRejectedValue(new Error('configuration missing'));

    const res = await getValidation(makeRequest('/api/admin/validation'));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetValidationReport.mockRejectedValue(new Error('compute error'));

    const res = await getValidation(makeRequest('/api/admin/validation'));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to load validation metrics/i);
  });
});
