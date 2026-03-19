import { GET } from '../route';
import { getCoreFlowValidationReport } from '@/lib/services/core-flow-validation.service';
import { buildInternalCoreFlowValidationReport } from '@/lib/services/core-flow-validation-report.service';

jest.mock('@/lib/services/core-flow-validation.service');
jest.mock('@/lib/services/core-flow-validation-report.service');

const mockGetCoreFlowValidationReport = getCoreFlowValidationReport as jest.MockedFunction<
  typeof getCoreFlowValidationReport
>;
const mockBuildInternalCoreFlowValidationReport =
  buildInternalCoreFlowValidationReport as jest.MockedFunction<
    typeof buildInternalCoreFlowValidationReport
  >;

function requestWithAuth(auth?: string) {
  const headers: HeadersInit | undefined = auth ? { authorization: auth } : undefined;
  return new Request('http://localhost/api/internal/validation/report', {
    method: 'GET',
    headers,
  });
}

describe('GET /api/internal/validation/report', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, METRICS_SNAPSHOT_TOKEN: 'snapshot-token' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it.each([
    {
      name: 'returns 503 when endpoint is not configured',
      env: undefined,
      auth: undefined,
      status: 503,
      body: { error: 'Validation report endpoint is not configured' },
    },
    {
      name: 'returns 401 for missing authorization header',
      env: 'snapshot-token',
      auth: undefined,
      status: 401,
      body: { error: 'Unauthorized' },
    },
    {
      name: 'returns 403 for invalid bearer token',
      env: 'snapshot-token',
      auth: 'Bearer wrong-token',
      status: 403,
      body: { error: 'Forbidden' },
    },
  ])('$name', async ({ env, auth, status, body }) => {
    if (env === undefined) {
      delete process.env.METRICS_SNAPSHOT_TOKEN;
    } else {
      process.env.METRICS_SNAPSHOT_TOKEN = env;
    }

    const response = await GET(requestWithAuth(auth));
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual(body);
  });

  it('returns internal report for valid token', async () => {
    mockGetCoreFlowValidationReport.mockResolvedValue({
      generatedAt: '2026-03-12T03:00:00.000Z',
    } as any);
    mockBuildInternalCoreFlowValidationReport.mockReturnValue({
      generatedAt: '2026-03-12T03:00:00.000Z',
      gate: { passed: false, reasons: ['TARGET_NOT_REACHED'] },
      reasons: ['TARGET_NOT_REACHED'],
      latestSnapshotDate: '2026-03-12',
      freshness: { status: 'fresh' },
      trend14d: [],
      weekOverWeek: {
        previousWeekAvg: 0,
        currentWeekAvg: 0,
        dropPct: 0,
        maxAllowedDropPct: 10,
        hasTwoFullWeeks: false,
        missingDays: 4,
      },
      current: { qualifiedUsers: 32 },
    } as any);

    const response = await GET(requestWithAuth('Bearer snapshot-token'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.gate.passed).toBe(false);
    expect(body.reasons).toEqual(['TARGET_NOT_REACHED']);
    expect(body.latestSnapshotDate).toBe('2026-03-12');
    expect(mockGetCoreFlowValidationReport).toHaveBeenCalledTimes(1);
    expect(mockBuildInternalCoreFlowValidationReport).toHaveBeenCalledTimes(1);
  });

  it('returns 503 when report service configuration is missing', async () => {
    mockGetCoreFlowValidationReport.mockRejectedValue(
      new Error('Core flow validation service configuration missing')
    );
    const response = await GET(requestWithAuth('Bearer snapshot-token'));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Validation report endpoint is not configured',
    });
  });
});
