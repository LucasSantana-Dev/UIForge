import {
  verifyProjectOwnership,
  listProjects,
} from '@/lib/services/project.service';
import {
  findProjectById,
  listProjects as repoListProjects,
} from '@/lib/repositories/project.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

jest.mock('@/lib/repositories/project.repo');

const mockFindProject = findProjectById as jest.MockedFunction<
  typeof findProjectById
>;
const mockListProjects = repoListProjects as jest.MockedFunction<
  typeof repoListProjects
>;

beforeEach(() => jest.clearAllMocks());

describe('verifyProjectOwnership', () => {
  it('returns project when user is owner', async () => {
    const project = {
      id: 'proj-1',
      user_id: 'user-1',
      name: 'My Project',
      description: null,
      framework: 'react',
      component_library: null,
      is_public: false,
      is_template: false,
      thumbnail_url: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    mockFindProject.mockResolvedValueOnce(project);
    const result = await verifyProjectOwnership('proj-1', 'user-1');
    expect(result).toEqual(project);
  });

  it('throws NotFoundError when project missing', async () => {
    mockFindProject.mockResolvedValueOnce(null);
    await expect(
      verifyProjectOwnership('missing', 'user-1')
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when user is not owner', async () => {
    mockFindProject.mockResolvedValueOnce({
      id: 'proj-1',
      user_id: 'other-user',
      name: 'Not Mine',
      description: null,
      framework: 'react',
      component_library: null,
      is_public: false,
      is_template: false,
      thumbnail_url: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    });
    await expect(
      verifyProjectOwnership('proj-1', 'user-1')
    ).rejects.toThrow(ForbiddenError);
  });
});

describe('listProjects', () => {
  const mockResult = {
    data: [{ id: 'p1' }, { id: 'p2' }],
    total: 25,
    page: 1,
    limit: 10,
    hasMore: true,
  };

  it('returns paginated results with defaults', async () => {
    mockListProjects.mockResolvedValueOnce(mockResult as any);
    const result = await listProjects('user-1');
    expect(result.data).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      pages: 3,
    });
    expect(mockListProjects).toHaveBeenCalledWith({
      userId: 'user-1',
      search: undefined,
      framework: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('passes search and framework filters', async () => {
    mockListProjects.mockResolvedValueOnce({
      ...mockResult,
      total: 5,
    } as any);
    await listProjects('user-1', {
      search: 'dashboard',
      framework: 'vue',
      page: 2,
      limit: 5,
    });
    expect(mockListProjects).toHaveBeenCalledWith({
      userId: 'user-1',
      search: 'dashboard',
      framework: 'vue',
      page: 2,
      limit: 5,
    });
  });

  it('computes pages correctly (rounds up)', async () => {
    mockListProjects.mockResolvedValueOnce({
      data: [],
      total: 11,
      page: 1,
      limit: 5,
      hasMore: true,
    } as any);
    const result = await listProjects('user-1', { limit: 5 });
    expect(result.pagination.pages).toBe(3);
  });

  it('returns at least 1 page when empty', async () => {
    mockListProjects.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
    } as any);
    const result = await listProjects('user-1');
    expect(result.pagination.pages).toBe(1);
  });
});
