import { POST } from '../route';
import { captureCoreFlowValidationSnapshot } from '@/lib/services/core-flow-validation.service';

jest.mock('@/lib/services/core-flow-validation.service');

const mockCaptureCoreFlowValidationSnapshot =
  captureCoreFlowValidationSnapshot as jest.MockedFunction<
    typeof captureCoreFlowValidationSnapshot
  >;

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/internal/validation/snapshot', {
    method: 'POST',
    headers,
  });
}

describe('POST /api/internal/validation/snapshot', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      METRICS_SNAPSHOT_TOKEN: 'snapshot-token',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 503 when endpoint is not configured', async () => {
    delete process.env.METRICS_SNAPSHOT_TOKEN;

    const response = await POST(makeRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Snapshot endpoint is not configured' });
  });

  it('returns 401 for missing authorization header', async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 for invalid bearer token', async () => {
    const response = await POST(makeRequest({ authorization: 'Bearer wrong-token' }));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('captures snapshot and returns report summary', async () => {
    mockCaptureCoreFlowValidationSnapshot.mockResolvedValue({
      generatedAt: '2026-03-11T00:00:00.000Z',
      capturedSnapshotDate: '2026-03-11',
      current: {
        snapshotDate: '2026-03-11',
        totalUsers: 70,
        onboardedUsers: 62,
        usersWithProject: 58,
        usersWithCompletedGeneration: 54,
        qualifiedUsers: 52,
        qualifiedRatio: 74.29,
      },
      snapshots: [],
      trend: {
        previousWeekAvg: 53,
        currentWeekAvg: 52,
        weekOverWeekDropPct: 1.89,
        maxAllowedDropPct: 10,
        hasTwoFullWeeks: true,
        missingDays: 0,
      },
      gate: {
        passed: true,
        reasons: ['PASS'],
        qualifiedTarget: 50,
        maxDropPct: 10,
      },
    } as any);

    const response = await POST(makeRequest({ authorization: 'Bearer snapshot-token' }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Snapshot captured');
    expect(body.capturedSnapshotDate).toBe('2026-03-11');
    expect(body.current.qualifiedUsers).toBe(52);
    expect(mockCaptureCoreFlowValidationSnapshot).toHaveBeenCalledTimes(1);
  });
});
