import {
  verifyProjectAccess,
  verifyComponentAccess,
  getComponentCode,
  storeComponentCode,
  deleteComponentCode,
} from '@/lib/services/component.service';
import { findComponentWithProject } from '@/lib/repositories/component.repo';
import {
  uploadToStorage,
  downloadFromStorage,
  deleteFromStorage,
  generateComponentStoragePath,
  STORAGE_BUCKETS,
} from '@/lib/api/storage';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

jest.mock('@/lib/repositories/component.repo');
jest.mock('@/lib/repositories/project.repo', () => ({
  findProjectById: jest.fn(),
}));
jest.mock('@/lib/api/storage');

const mockFindComponent = findComponentWithProject as jest.MockedFunction<
  typeof findComponentWithProject
>;
const mockDownload = downloadFromStorage as jest.MockedFunction<
  typeof downloadFromStorage
>;
const mockUpload = uploadToStorage as jest.MockedFunction<
  typeof uploadToStorage
>;
const mockDelete = deleteFromStorage as jest.MockedFunction<
  typeof deleteFromStorage
>;
const mockGenPath = generateComponentStoragePath as jest.MockedFunction<
  typeof generateComponentStoragePath
>;

beforeEach(() => jest.clearAllMocks());

async function getMockFindProject() {
  const { findProjectById } = await import(
    '@/lib/repositories/project.repo'
  );
  return findProjectById as jest.MockedFunction<typeof findProjectById>;
}

describe('verifyProjectAccess', () => {
  it('returns project when user is owner', async () => {
    const mockFind = await getMockFindProject();
    mockFind.mockResolvedValueOnce({
      id: 'proj-1',
      user_id: 'user-1',
      is_public: false,
    } as any);
    const result = await verifyProjectAccess('proj-1', 'user-1');
    expect(result.id).toBe('proj-1');
  });

  it('throws NotFoundError when project missing', async () => {
    const mockFind = await getMockFindProject();
    mockFind.mockResolvedValueOnce(null);
    await expect(
      verifyProjectAccess('missing', 'user-1')
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when ownership required and not owner', async () => {
    const mockFind = await getMockFindProject();
    mockFind.mockResolvedValueOnce({
      id: 'proj-1',
      user_id: 'other',
      is_public: true,
    } as any);
    await expect(
      verifyProjectAccess('proj-1', 'user-1', true)
    ).rejects.toThrow(ForbiddenError);
  });

  it('allows non-owner access to public project', async () => {
    const mockFind = await getMockFindProject();
    mockFind.mockResolvedValueOnce({
      id: 'proj-1',
      user_id: 'other',
      is_public: true,
    } as any);
    const result = await verifyProjectAccess('proj-1', 'user-1', false);
    expect(result.id).toBe('proj-1');
  });

  it('throws ForbiddenError for non-owner on private project', async () => {
    const mockFind = await getMockFindProject();
    mockFind.mockResolvedValueOnce({
      id: 'proj-1',
      user_id: 'other',
      is_public: false,
    } as any);
    await expect(
      verifyProjectAccess('proj-1', 'user-1', false)
    ).rejects.toThrow(ForbiddenError);
  });
});

describe('verifyComponentAccess', () => {
  it('returns component when user owns project', async () => {
    mockFindComponent.mockResolvedValueOnce({
      id: 'comp-1',
      project_id: 'proj-1',
      name: 'Button',
      component_type: 'ui',
      framework: 'react',
      code_storage_path: null,
      description: null,
      projects: { user_id: 'user-1', is_public: false, framework: 'react' },
    });
    const result = await verifyComponentAccess('comp-1', 'user-1');
    expect(result.id).toBe('comp-1');
  });

  it('throws NotFoundError when component missing', async () => {
    mockFindComponent.mockResolvedValueOnce(null);
    await expect(
      verifyComponentAccess('missing', 'user-1')
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when ownership required and not owner', async () => {
    mockFindComponent.mockResolvedValueOnce({
      id: 'comp-1',
      project_id: 'proj-1',
      name: 'Button',
      component_type: 'ui',
      framework: 'react',
      code_storage_path: null,
      description: null,
      projects: { user_id: 'other', is_public: false, framework: 'react' },
    });
    await expect(
      verifyComponentAccess('comp-1', 'user-1', true)
    ).rejects.toThrow(ForbiddenError);
  });
});

describe('getComponentCode', () => {
  it('returns empty string when no storage path', async () => {
    const code = await getComponentCode(null);
    expect(code).toBe('');
  });

  it('downloads code from storage', async () => {
    mockDownload.mockResolvedValueOnce('const x = 1;');
    const code = await getComponentCode('path/to/code.tsx');
    expect(code).toBe('const x = 1;');
    expect(mockDownload).toHaveBeenCalledWith(
      STORAGE_BUCKETS.PROJECT_FILES,
      'path/to/code.tsx',
      true
    );
  });

  it('returns empty string on download error', async () => {
    mockDownload.mockRejectedValueOnce(new Error('Network error'));
    const code = await getComponentCode('path/to/code.tsx');
    expect(code).toBe('');
  });
});

describe('storeComponentCode', () => {
  it('uploads code and returns storage path', async () => {
    mockGenPath.mockReturnValueOnce('projects/p1/components/c1/code.tsx');
    mockUpload.mockResolvedValueOnce({ path: 'projects/p1/components/c1/code.tsx' });
    const path = await storeComponentCode(
      'p1',
      'c1',
      'react',
      'export default function Button() {}'
    );
    expect(path).toBe('projects/p1/components/c1/code.tsx');
    expect(mockUpload).toHaveBeenCalledWith(
      STORAGE_BUCKETS.PROJECT_FILES,
      'projects/p1/components/c1/code.tsx',
      'export default function Button() {}',
      'text/plain'
    );
  });

  it('uses existing path when provided', async () => {
    mockUpload.mockResolvedValueOnce({ path: 'projects/p1/components/c1/code.tsx' });
    const path = await storeComponentCode(
      'p1',
      'c1',
      'react',
      'code',
      'existing/path.tsx'
    );
    expect(path).toBe('existing/path.tsx');
    expect(mockGenPath).not.toHaveBeenCalled();
  });
});

describe('deleteComponentCode', () => {
  it('does nothing when no storage path', async () => {
    await deleteComponentCode(null);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('deletes from storage', async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    await deleteComponentCode('path/to/code.tsx');
    expect(mockDelete).toHaveBeenCalledWith(
      STORAGE_BUCKETS.PROJECT_FILES,
      'path/to/code.tsx'
    );
  });

  it('swallows deletion errors gracefully', async () => {
    mockDelete.mockRejectedValueOnce(new Error('Storage unavailable'));
    await expect(
      deleteComponentCode('path/to/code.tsx')
    ).resolves.toBeUndefined();
  });
});
