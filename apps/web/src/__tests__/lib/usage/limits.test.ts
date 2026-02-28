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

import { checkGenerationQuota } from '@/lib/usage/limits';
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
    expect(result).toEqual({ allowed: true, current: 0, limit: 10, remaining: 10 });
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
