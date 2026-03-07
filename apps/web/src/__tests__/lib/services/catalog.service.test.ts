import * as catalogService from '@/lib/services/catalog.service';
import { findCatalogEntryById } from '@/lib/repositories/catalog.repo';
import * as catalogRepo from '@/lib/repositories/catalog.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

jest.mock('@/lib/repositories/catalog.repo');
jest.mock('@/lib/repositories/base.repo', () => ({
  getClient: jest.fn(),
  paginationRange: jest.fn().mockReturnValue({ from: 0, to: 19 }),
  handleRepoError: jest.fn((err: unknown) => {
    throw err;
  }),
}));

const mockFind = findCatalogEntryById as jest.MockedFunction<typeof findCatalogEntryById>;
const mockRepoList = catalogRepo.listCatalogEntries as jest.MockedFunction<
  typeof catalogRepo.listCatalogEntries
>;

beforeEach(() => jest.clearAllMocks());

const mockEntry = {
  id: 'entry-1',
  name: 'my-service',
  display_name: 'My Service',
  type: 'service',
  lifecycle: 'production',
  owner_id: 'user-1',
  team: null,
  repository_url: null,
  documentation_url: null,
  tags: [] as string[],
  dependencies: [] as string[],
  project_id: null,
  parent_id: null,
  metadata: {},
  description: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('verifyCatalogOwnership', () => {
  it('returns entry when user is owner', async () => {
    mockFind.mockResolvedValueOnce(mockEntry as any);
    const result = await catalogService.verifyCatalogOwnership('entry-1', 'user-1');
    expect(result).toEqual(mockEntry);
  });

  it('throws NotFoundError when entry missing', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(catalogService.verifyCatalogOwnership('missing', 'user-1')).rejects.toThrow(
      NotFoundError
    );
  });

  it('throws ForbiddenError when not owner', async () => {
    mockFind.mockResolvedValueOnce({
      ...mockEntry,
      owner_id: 'other-user',
    } as any);
    await expect(catalogService.verifyCatalogOwnership('entry-1', 'user-1')).rejects.toThrow(
      ForbiddenError
    );
  });

  it('verifies entry exists before checking ownership', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(catalogService.verifyCatalogOwnership('entry-1', 'user-1')).rejects.toThrow(
      NotFoundError
    );
    expect(mockFind).toHaveBeenCalledWith('entry-1');
  });
});

describe('listCatalogEntries', () => {
  const mockResult = {
    data: [mockEntry],
    total: 15,
    page: 1,
    limit: 10,
    hasMore: true,
  };

  it('returns paginated results with defaults', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    const result = await catalogService.listCatalogEntries();
    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      pages: 2,
    });
  });

  it('passes filters to repository', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    await catalogService.listCatalogEntries({
      search: 'gateway',
      type: 'service',
      lifecycle: 'production',
      page: 2,
      limit: 5,
    });
    expect(mockRepoList).toHaveBeenCalledWith({
      search: 'gateway',
      type: 'service',
      lifecycle: 'production',
      tags: undefined,
      page: 2,
      limit: 5,
    });
  });

  it('returns at least 1 page when empty', async () => {
    mockRepoList.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
    } as any);
    const result = await catalogService.listCatalogEntries();
    expect(result.pagination.pages).toBe(1);
  });

  it('splits comma-separated tags', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    await catalogService.listCatalogEntries({
      tags: 'typescript,api,backend',
    });
    expect(mockRepoList).toHaveBeenCalledWith({
      search: undefined,
      type: undefined,
      lifecycle: undefined,
      tags: ['typescript', 'api', 'backend'],
      page: 1,
      limit: 10,
    });
  });

  it('calculates pagination correctly', async () => {
    mockRepoList.mockResolvedValueOnce({
      data: [mockEntry],
      total: 25,
      page: 3,
      limit: 10,
      hasMore: false,
    } as any);
    const result = await catalogService.listCatalogEntries({
      page: 3,
      limit: 10,
    });
    expect(result.pagination.pages).toBe(3);
  });
});
