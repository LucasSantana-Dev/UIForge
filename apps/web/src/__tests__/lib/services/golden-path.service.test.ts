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
const mockRepoList = goldenPathRepo.listGoldenPaths as jest.MockedFunction<
  typeof goldenPathRepo.listGoldenPaths
>;

beforeEach(() => jest.clearAllMocks());

const mockTemplate = {
  id: 'gp-1',
  name: 'forge-next-service',
  display_name: 'Next.js Service',
  description: 'Production-ready Next.js service',
  type: 'service',
  lifecycle: 'ga',
  framework: 'next.js',
  language: 'typescript',
  owner_id: 'user-1',
  tags: ['next.js', 'supabase'] as string[],
  parameters: [] as any[],
  steps: [] as any[],
  repository_url: null,
  documentation_url: null,
  icon: null,
  metadata: {},
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('verifyGoldenPathOwnership', () => {
  it('returns template when user is owner', async () => {
    mockFind.mockResolvedValueOnce(mockTemplate);
    const result = await goldenPathService.verifyGoldenPathOwnership('gp-1', 'user-1');
    expect(result).toEqual(mockTemplate);
  });

  it('throws NotFoundError when template missing', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(goldenPathService.verifyGoldenPathOwnership('missing', 'user-1')).rejects.toThrow(
      NotFoundError
    );
  });

  it('throws ForbiddenError when not owner', async () => {
    mockFind.mockResolvedValueOnce({
      ...mockTemplate,
      owner_id: 'other-user',
    });
    await expect(goldenPathService.verifyGoldenPathOwnership('gp-1', 'user-1')).rejects.toThrow(
      ForbiddenError
    );
  });
});

describe('getGoldenPathDetail', () => {
  it('returns template by id', async () => {
    mockFind.mockResolvedValueOnce(mockTemplate);
    const result = await goldenPathService.getGoldenPathDetail('gp-1');
    expect(result).toEqual(mockTemplate);
  });

  it('throws NotFoundError when missing', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(goldenPathService.getGoldenPathDetail('missing')).rejects.toThrow(NotFoundError);
  });
});

describe('listGoldenPathTemplates', () => {
  const mockResult = {
    data: [mockTemplate],
    total: 15,
    page: 1,
    limit: 20,
    hasMore: false,
  };

  it('returns paginated results with defaults', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    const result = await goldenPathService.listGoldenPathTemplates();
    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 15,
      pages: 1,
    });
  });

  it('passes filters to repository', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    await goldenPathService.listGoldenPathTemplates({
      search: 'next',
      type: 'service',
      framework: 'next.js',
      page: 2,
      limit: 5,
    });
    expect(mockRepoList).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'next',
        type: 'service',
        framework: 'next.js',
        page: 2,
        limit: 5,
      })
    );
  });

  it('splits comma-separated tags', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    await goldenPathService.listGoldenPathTemplates({
      tags: 'next.js,supabase,tailwind',
    });
    expect(mockRepoList).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ['next.js', 'supabase', 'tailwind'],
      })
    );
  });

  it('returns at least 1 page when empty', async () => {
    mockRepoList.mockResolvedValueOnce({
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
