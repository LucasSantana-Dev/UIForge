import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { parseWindowDays } from '@/lib/services/metrics.service';
import { getSecurityTelemetryReport } from '@/lib/services/security-telemetry.service';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/admin');
jest.mock('@/lib/services/metrics.service');
jest.mock('@/lib/services/security-telemetry.service');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;
const mockParseWindowDays = parseWindowDays as jest.MockedFunction<typeof parseWindowDays>;
const mockGetSecurityTelemetryReport = getSecurityTelemetryReport as jest.MockedFunction<
  typeof getSecurityTelemetryReport
>;

const makeRequest = (windowDays?: number) =>
  new Request(
    windowDays
      ? `http://localhost:3000/api/admin/security?windowDays=${windowDays}`
      : 'http://localhost:3000/api/admin/security'
  );

function setupAdmin(isAdmin: boolean) {
  mockCreateClient.mockResolvedValue({} as any);
  mockVerifyAdmin.mockResolvedValue(isAdmin ? ({ id: 'admin-1' } as any) : null);
}

describe('GET /api/admin/security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseWindowDays.mockImplementation((value) => {
      const candidate = Number(value);
      return candidate === 7 || candidate === 30 || candidate === 90 ? candidate : 30;
    });
  });

  it('blocks non-admin callers', async () => {
    setupAdmin(false);

    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
    expect(mockGetSecurityTelemetryReport).not.toHaveBeenCalled();
  });

  it('returns telemetry and forwards the requested window', async () => {
    setupAdmin(true);
    mockGetSecurityTelemetryReport.mockResolvedValue({
      timestamp: '2026-03-12T00:00:00.000Z',
      windowDays: 7,
      summary: {
        totalReports: 10,
        totalFindings: 6,
        reportsWithFindings: 4,
        highRiskGenerations: 2,
        scannerErrors: 1,
      },
      severityDistribution: { critical: 1, high: 2, medium: 2, low: 1, info: 0 },
      riskDistribution: { high: 3, medium: 2, low: 1 },
      topRules: [{ ruleId: 'SEC-INJ-001', count: 2, maxSeverity: 'high', maxRiskLevel: 'high' }],
      recentHighRiskGenerations: [],
    });

    const response = await GET(makeRequest(7));

    expect(response.status).toBe(200);
    expect(mockParseWindowDays).toHaveBeenCalledWith('7');
    expect(mockGetSecurityTelemetryReport).toHaveBeenCalledWith(7);
  });

  it.each([
    {
      failure: new Error('Security telemetry service configuration missing'),
      status: 503,
      error: 'Security telemetry service is not configured',
    },
    {
      failure: new Error('Unexpected failure'),
      status: 500,
      error: 'Failed to load security telemetry',
    },
  ])('maps telemetry failure to HTTP $status', async ({ failure, status, error }) => {
    setupAdmin(true);
    mockGetSecurityTelemetryReport.mockRejectedValue(failure);

    const response = await GET(makeRequest());

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error });
  });
});
