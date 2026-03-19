import { GET as getReport } from '@/app/api/internal/validation/report/route';
import { POST as postSnapshot } from '@/app/api/internal/validation/snapshot/route';

jest.mock('@/lib/services/core-flow-validation.service', () => ({
  getCoreFlowValidationReport: jest.fn(),
  captureCoreFlowValidationSnapshot: jest.fn(),
}));
jest.mock('@/lib/services/core-flow-validation-report.service', () => ({
  buildInternalCoreFlowValidationReport: jest.fn(),
}));

import {
  getCoreFlowValidationReport,
  captureCoreFlowValidationSnapshot,
} from '@/lib/services/core-flow-validation.service';
import { buildInternalCoreFlowValidationReport } from '@/lib/services/core-flow-validation-report.service';

const mockGetReport = getCoreFlowValidationReport as jest.MockedFunction<
  typeof getCoreFlowValidationReport
>;
const mockCaptureSnapshot = captureCoreFlowValidationSnapshot as jest.MockedFunction<
  typeof captureCoreFlowValidationSnapshot
>;
const mockBuildReport = buildInternalCoreFlowValidationReport as jest.MockedFunction<
  typeof buildInternalCoreFlowValidationReport
>;

const TOKEN = 'secret-token-123';
const RAW_REPORT = { gate: 'pass', current: { score: 95 } };
const BUILT_REPORT = { status: 'healthy', score: 95, gates: [] };
const SNAPSHOT_RESULT = {
  capturedSnapshotDate: '2026-03-15T10:00:00Z',
  gate: 'pass',
  current: { score: 95 },
};

function makeRequest(method: string, token?: string) {
  return new Request(
    `http://localhost/api/internal/validation/${method === 'GET' ? 'report' : 'snapshot'}`,
    {
      method,
      headers: token ? { authorization: `Bearer ${token}` } : {},
    }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.METRICS_SNAPSHOT_TOKEN = TOKEN;
  mockGetReport.mockResolvedValue(RAW_REPORT as never);
  mockBuildReport.mockReturnValue(BUILT_REPORT as never);
  mockCaptureSnapshot.mockResolvedValue(SNAPSHOT_RESULT as never);
});

afterEach(() => {
  delete process.env.METRICS_SNAPSHOT_TOKEN;
});

describe('GET /api/internal/validation/report', () => {
  it('returns validation report with valid token', async () => {
    const res = await getReport(makeRequest('GET', TOKEN));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(BUILT_REPORT);
    expect(mockGetReport).toHaveBeenCalled();
    expect(mockBuildReport).toHaveBeenCalledWith(RAW_REPORT);
  });

  it('returns 503 when METRICS_SNAPSHOT_TOKEN is not set', async () => {
    delete process.env.METRICS_SNAPSHOT_TOKEN;

    const res = await getReport(makeRequest('GET', TOKEN));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await getReport(makeRequest('GET'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 when token is wrong', async () => {
    const res = await getReport(makeRequest('GET', 'wrong-token'));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('returns 503 when service is misconfigured', async () => {
    mockGetReport.mockRejectedValue(new Error('configuration missing'));

    const res = await getReport(makeRequest('GET', TOKEN));
    void (await res.json());

    expect(res.status).toBe(503);
  });

  it('returns 500 on unexpected service error', async () => {
    mockGetReport.mockRejectedValue(new Error('DB connection failed'));

    const res = await getReport(makeRequest('GET', TOKEN));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to load validation report/i);
  });
});

describe('POST /api/internal/validation/snapshot', () => {
  it('captures snapshot with valid token', async () => {
    const res = await postSnapshot(makeRequest('POST', TOKEN));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('Snapshot captured');
    expect(body.capturedSnapshotDate).toBe(SNAPSHOT_RESULT.capturedSnapshotDate);
    expect(body.gate).toBe('pass');
    expect(mockCaptureSnapshot).toHaveBeenCalled();
  });

  it('returns 503 when METRICS_SNAPSHOT_TOKEN is not set', async () => {
    delete process.env.METRICS_SNAPSHOT_TOKEN;

    const res = await postSnapshot(makeRequest('POST', TOKEN));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await postSnapshot(makeRequest('POST'));
    void (await res.json());

    expect(res.status).toBe(401);
  });

  it('returns 403 when token is wrong', async () => {
    const res = await postSnapshot(makeRequest('POST', 'bad-token'));
    void (await res.json());

    expect(res.status).toBe(403);
  });

  it('returns 503 on configuration error', async () => {
    mockCaptureSnapshot.mockRejectedValue(new Error('configuration missing'));

    const res = await postSnapshot(makeRequest('POST', TOKEN));
    void (await res.json());

    expect(res.status).toBe(503);
  });

  it('returns 500 on unexpected error', async () => {
    mockCaptureSnapshot.mockRejectedValue(new Error('snapshot storage failed'));

    const res = await postSnapshot(makeRequest('POST', TOKEN));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/Failed to capture snapshot/i);
  });
});
