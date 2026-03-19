import { GET } from '@/app/api/scorecards/route';
import { NextRequest } from 'next/server';

const mockGetUser = jest.fn();
const mockSingle = jest.fn();
const mockLimit: jest.Mock = jest.fn(() => ({ single: mockSingle }));
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEqProject = jest.fn(() => ({ order: mockOrder }));

// projects ownership: .select().eq('id').eq('user_id').single()
const mockEqUserId = jest.fn(() => ({ single: mockSingle }));
const mockEqProjectId = jest.fn(() => ({ eq: mockEqUserId }));
const mockSelectProjectOwnership = jest.fn(() => ({ eq: mockEqProjectId }));
const mockSelectScorecard = jest.fn(() => ({ eq: mockEqProject }));

const mockFrom = jest.fn((table: string) => {
  if (table === 'projects') {
    return { select: mockSelectProjectOwnership };
  }
  if (table === 'project_scorecards') {
    return { select: mockSelectScorecard };
  }
  return {};
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/scorecards');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

const SCORECARD = {
  id: 'sc-1',
  project_id: 'proj-1',
  overall_score: 85,
  security_score: 90,
  quality_score: 80,
  performance_score: 82,
  compliance_score: 88,
  breakdowns: {},
  violations: [],
  recommendations: [],
  created_at: '2026-03-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
  mockEqUserId.mockReturnValue({ single: mockSingle });
  mockSingle.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
  mockEqProject.mockReturnValue({ order: mockOrder });
  mockOrder.mockReturnValue({ limit: mockLimit });
  // default single scorecard
  mockLimit.mockReturnValue({
    single: jest.fn().mockResolvedValue({ data: SCORECARD, error: null }),
  });
});

describe('GET /api/scorecards', () => {
  it('returns latest scorecard for a project', async () => {
    const res = await GET(makeRequest({ projectId: 'proj-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.scorecard.id).toBe('sc-1');
    expect(body.scorecard.overall_score).toBe(85);
  });

  it('returns scorecard history when ?history=true', async () => {
    // history=true uses .limit() that resolves to array, not single
    mockLimit.mockResolvedValue({ data: [SCORECARD], error: null });

    const res = await GET(makeRequest({ projectId: 'proj-1', history: 'true' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.scorecards).toHaveLength(1);
    expect(body.scorecards[0].id).toBe('sc-1');
  });

  it('returns null scorecard when none found (PGRST116)', async () => {
    mockLimit.mockReturnValue({
      single: jest
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } }),
    });

    const res = await GET(makeRequest({ projectId: 'proj-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.scorecard).toBeNull();
  });

  it('returns 400 when projectId is missing', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/projectId required/i);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET(makeRequest({ projectId: 'proj-1' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns 403 when project does not belong to user', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    const res = await GET(makeRequest({ projectId: 'proj-other' }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toMatch(/access denied/i);
  });

  it('returns 500 on scorecard DB error', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { code: 'UNKNOWN', message: 'crash' } });

    const res = await GET(makeRequest({ projectId: 'proj-1', history: 'true' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/crash/i);
  });
});
