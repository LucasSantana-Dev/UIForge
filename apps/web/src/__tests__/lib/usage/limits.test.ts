const mockSingle = jest.fn();
const mockEq2 = jest.fn().mockReturnValue({ single: mockSingle });
const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });
const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

jest.mock('@/lib/features/flags', () => ({
  getFeatureFlag: jest.fn(),
}));

import { checkGenerationQuota, checkProjectQuota } from '@/lib/usage/limits';
import { getFeatureFlag } from '@/lib/features/flags';

const mockGetFeatureFlag = getFeatureFlag as jest.MockedFunction<typeof getFeatureFlag>;

beforeEach(() => {
  jest.clearAllMocks();
  mockSelect.mockReturnValue({ eq: mockEq1 });
  mockEq1.mockReturnValue({ eq: mockEq2 });
  mockEq2.mockReturnValue({ single: mockSingle });
});

describe('checkGenerationQuota', () => {
  it('returns unlimited when usage limits disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    const result = await checkGenerationQuota('user-1');
    expect(result).toEqual({ allowed: true, current: 0, limit: -1, remaining: -1 });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns default quota when no record', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    mockSingle.mockResolvedValue({ data: null });
    const result = await checkGenerationQuota('user-1');
    expect(result).toEqual({ allowed: true, current: 0, limit: 5, remaining: 5 });
  });

  it('returns unlimited for unlimited plan', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    mockSingle.mockResolvedValue({
      data: { generations_count: 50, generations_limit: -1 },
    });
    const result = await checkGenerationQuota('user-1');
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(-1);
  });

  it('allows when under limit', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    mockSingle.mockResolvedValue({
      data: { generations_count: 5, generations_limit: 10 },
    });
    const result = await checkGenerationQuota('user-1');
    expect(result).toEqual({ allowed: true, current: 5, limit: 10, remaining: 5 });
  });

  it('blocks when at limit', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    mockSingle.mockResolvedValue({
      data: { generations_count: 10, generations_limit: 10 },
    });
    const result = await checkGenerationQuota('user-1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('clamps remaining to 0 when over limit', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    mockSingle.mockResolvedValue({
      data: { generations_count: 15, generations_limit: 10 },
    });
    const result = await checkGenerationQuota('user-1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe('checkProjectQuota', () => {
  // For checkProjectQuota we need a more flexible mock that handles 3 separate queries:
  // 1. projects count (head=true, returns { count })
  // 2. subscriptions select plan
  // 3. plan_limits select max_projects
  let queryCall = 0;

  beforeEach(() => {
    jest.clearAllMocks();
    queryCall = 0;

    mockFrom.mockImplementation(() => {
      queryCall++;
      const call = queryCall;

      if (call === 1) {
        // projects count query
        const mockHead = jest.fn().mockResolvedValue({ count: 3, error: null });
        const mockEqHead = jest.fn().mockReturnValue({ count: 3, error: null, then: undefined });
        // The actual chain: from('projects').select('id', {count:'exact',head:true}).eq('user_id', userId)
        // returns { count: N } directly
        const selectHead = jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 3, error: null }),
        });
        return { select: selectHead };
      }

      if (call === 2) {
        // subscriptions query → .select('plan').eq('user_id').single()
        const selectSub = jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { plan: 'free' }, error: null }),
          }),
        });
        return { select: selectSub };
      }

      // call === 3: plan_limits query → .select('max_projects').eq('plan').single()
      const selectLimits = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { max_projects: 5 }, error: null }),
        }),
      });
      return { select: selectLimits };
    });
  });

  it('returns unlimited when usage limits disabled', async () => {
    mockGetFeatureFlag.mockReturnValue(false);
    const result = await checkProjectQuota('user-1');
    expect(result).toEqual({ allowed: true, current: 0, limit: -1, remaining: -1 });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('allows when under project limit', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    const result = await checkProjectQuota('user-1');
    expect(result.allowed).toBe(true);
    expect(result.current).toBe(3);
    expect(result.limit).toBe(5);
    expect(result.remaining).toBe(2);
  });

  it('blocks when at project limit', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    queryCall = 0;
    mockFrom.mockImplementation(() => {
      queryCall++;
      if (queryCall === 1) {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
          }),
        };
      }
      if (queryCall === 2) {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { plan: 'free' }, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { max_projects: 5 }, error: null }),
          }),
        }),
      };
    });
    const result = await checkProjectQuota('user-1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns unlimited for unlimited plan (max_projects = -1)', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    queryCall = 0;
    mockFrom.mockImplementation(() => {
      queryCall++;
      if (queryCall === 1) {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 99, error: null }),
          }),
        };
      }
      if (queryCall === 2) {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { plan: 'team' }, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { max_projects: -1 }, error: null }),
          }),
        }),
      };
    });
    const result = await checkProjectQuota('user-1');
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(-1);
    expect(result.remaining).toBe(-1);
  });

  it('uses default limit of 2 when plan_limits not found', async () => {
    mockGetFeatureFlag.mockReturnValue(true);
    queryCall = 0;
    mockFrom.mockImplementation(() => {
      queryCall++;
      if (queryCall === 1) {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
          }),
        };
      }
      if (queryCall === 2) {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
    });
    const result = await checkProjectQuota('user-1');
    expect(result.limit).toBe(2);
    expect(result.allowed).toBe(true);
  });
});
