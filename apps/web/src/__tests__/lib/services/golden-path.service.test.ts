import * as goldenPathService from '@/lib/services/golden-path.service';
import { findGoldenPathById } from '@/lib/repositories/golden-path.repo';
import * as goldenPathRepo from '@/lib/repositories/golden-path.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

jest.mock('@/lib/repositories/golden-path.repo');
jest.mock('@/lib/repositories/base.repo', () => ({
  getClient: jest.fn(),
  paginationRange: jest.fn().mockReturnValue({ from: 0, to: 19 }),
  handleRepoError: jest.fn((err: unknown) => {
    throw err;
  }),
}));

const mockFind = findGoldenPathById as jest.MockedFunction<typeof findGoldenPathById>;
const mockList = goldenPathRepo.listGoldenPaths as jest.MockedFunction<
  typeof goldenPathRepo.listGoldenPaths
>;

beforeEach(() => jest.clearAllMocks());

const mockPath = {
  id: 'gp-1',
  owner_id: 'user-1',
  name: 'forge-next-service',
  display_name: 'Next.js Service',
};

describe('verifyGoldenPathOwnership', () => {
  it('returns entry when user is owner', async () => {
    mockFind.mockResolvedValueOnce(mockPath as any);
    const result = await goldenPathService.verifyGoldenPathOwnership('gp-1', 'user-1');
    expect(result).toEqual(mockPath);
  });

  it('throws NotFoundError when missing', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(
      goldenPathService.verifyGoldenPathOwnership('x', 'user-1'),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when not owner', async () => {
    mockFind.mockResolvedValueOnce({ ...mockPath, owner_id: 'other' } as any);
    await expect(
      goldenPathService.verifyGoldenPathOwnership('gp-1', 'user-1'),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe('listGoldenPathTemplates', () => {
  it('returns paginated results', async () => {
    mockList.mockResolvedValueOnce({
      data: [mockPath],
      total: 5,
      page: 1,
      limit: 20,
      hasMore: false,
    } as any);
    const result = await goldenPathService.listGoldenPathTemplates();
    expect(result.data).toHaveLength(1);
    expect(result.pagination.pages).toBe(1);
  });

  it('returns at least 1 page when empty', async () => {
    mockList.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    } as any);
    const result = await goldenPathService.listGoldenPathTemplates();
    expect(result.pagination.pages).toBe(1);
  });
});
