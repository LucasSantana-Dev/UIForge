import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { getCoreFlowValidationReport } from '@/lib/services/core-flow-validation.service';
import { parseWindowDays } from '@/lib/services/metrics.service';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/admin');
jest.mock('@/lib/services/core-flow-validation.service');
jest.mock('@/lib/services/metrics.service');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;
const mockGetCoreFlowValidationReport = getCoreFlowValidationReport as jest.MockedFunction<
  typeof getCoreFlowValidationReport
>;
const mockParseWindowDays = parseWindowDays as jest.MockedFunction<typeof parseWindowDays>;

function makeRequest(search = '') {
  return new Request(`http://localhost:3000/api/admin/validation${search}`);
}

describe('GET /api/admin/validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseWindowDays.mockReturnValue(30);
  });

  it('returns 403 for non-admin users', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue(null);

    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('returns validation report for admins', async () => {
    const report = {
      generatedAt: '2026-03-11T00:00:00.000Z',
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
      activationFunnel: {
        windowDays: 30,
        computedAt: '2026-03-11T00:00:00.000Z',
        cohortStartDate: '2026-02-09',
        counts: {
          startedOnboarding: 40,
          completedOnboarding: 28,
          firstProject: 22,
          firstCompletedGeneration: 18,
          qualifiedUsers: 16,
        },
        conversionRates: {
          onboardingCompletion: 70,
          projectActivation: 78.57,
          generationActivation: 81.82,
          qualification: 40,
        },
        topDropoffReasons: [
          { reason: 'NO_PROJECT', count: 6 },
          { reason: 'NO_COMPLETED_GENERATION', count: 4 },
        ],
      },
    };

    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetCoreFlowValidationReport.mockResolvedValue(report as any);
    mockParseWindowDays.mockReturnValue(7);

    const response = await GET(makeRequest('?windowDays=7'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(report);
    expect(mockGetCoreFlowValidationReport).toHaveBeenCalledTimes(1);
    expect(mockParseWindowDays).toHaveBeenCalledWith('7');
    expect(mockGetCoreFlowValidationReport).toHaveBeenCalledWith(expect.any(Date), 7);
  });

  it('returns 503 when service-role config is missing', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetCoreFlowValidationReport.mockRejectedValue(
      new Error('Core flow validation service configuration missing')
    );

    const response = await GET(makeRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Core-flow validation is not configured' });
  });
});
