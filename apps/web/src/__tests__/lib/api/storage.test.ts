import {
  uploadToStorage,
  downloadFromStorage,
  deleteFromStorage,
  generateComponentStoragePath,
  validateFileSize,
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
} from '@/lib/api/storage';

// Mock Supabase server client
const mockUpload = jest.fn();
const mockDownload = jest.fn();
const mockRemove = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    storage: {
      from: mockFrom,
    },
  })),
}));

describe('lib/api/storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({
      upload: mockUpload,
      download: mockDownload,
      remove: mockRemove,
      getPublicUrl: mockGetPublicUrl,
    });
  });

  // ── uploadToStorage ────────────────────────────────────────────────────────

  describe('uploadToStorage', () => {
    it('uploads content and returns path + publicUrl', async () => {
      mockUpload.mockResolvedValue({ data: { path: 'proj/comp.tsx' }, error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://cdn.example.com/proj/comp.tsx' },
      });

      const result = await uploadToStorage('project-files', 'proj/comp.tsx', 'const x = 1;');

      expect(mockFrom).toHaveBeenCalledWith('project-files');
      expect(mockUpload).toHaveBeenCalledWith('proj/comp.tsx', 'const x = 1;', {
        contentType: 'text/plain',
        upsert: true,
      });
      expect(result.path).toBe('proj/comp.tsx');
      expect(result.publicUrl).toBe('https://cdn.example.com/proj/comp.tsx');
    });

    it('uses custom contentType when provided', async () => {
      mockUpload.mockResolvedValue({ data: { path: 'img.png' }, error: null });
      mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/img.png' } });

      await uploadToStorage('user-uploads', 'img.png', Buffer.from('data'), 'image/png');

      expect(mockUpload).toHaveBeenCalledWith('img.png', expect.anything(), {
        contentType: 'image/png',
        upsert: true,
      });
    });

    it('throws when upload returns an error', async () => {
      mockUpload.mockResolvedValue({ data: null, error: { message: 'Bucket not found' } });

      await expect(uploadToStorage('bad-bucket', 'file.txt', 'data')).rejects.toThrow(
        'Storage upload failed: Bucket not found'
      );
    });
  });

  // ── downloadFromStorage ────────────────────────────────────────────────────

  describe('downloadFromStorage', () => {
    it('returns text content by default', async () => {
      const blob = { text: jest.fn().mockResolvedValue('file content') };
      mockDownload.mockResolvedValue({ data: blob, error: null });

      const result = await downloadFromStorage('project-files', 'proj/comp.tsx');

      expect(result).toBe('file content');
      expect(blob.text).toHaveBeenCalled();
    });

    it('returns raw blob when asText=false', async () => {
      const blob = { text: jest.fn() };
      mockDownload.mockResolvedValue({ data: blob, error: null });

      const result = await downloadFromStorage('project-files', 'proj/comp.tsx', false);

      expect(result).toBe(blob);
      expect(blob.text).not.toHaveBeenCalled();
    });

    it('throws when download returns an error', async () => {
      mockDownload.mockResolvedValue({ data: null, error: { message: 'Object not found' } });

      await expect(downloadFromStorage('project-files', 'missing.tsx')).rejects.toThrow(
        'Storage download failed: Object not found'
      );
    });
  });

  // ── deleteFromStorage ──────────────────────────────────────────────────────

  describe('deleteFromStorage', () => {
    it('deletes file without throwing on success', async () => {
      mockRemove.mockResolvedValue({ error: null });

      await expect(deleteFromStorage('project-files', 'proj/comp.tsx')).resolves.toBeUndefined();

      expect(mockRemove).toHaveBeenCalledWith(['proj/comp.tsx']);
    });

    it('throws when delete returns an error', async () => {
      mockRemove.mockResolvedValue({ error: { message: 'Permission denied' } });

      await expect(deleteFromStorage('project-files', 'proj/comp.tsx')).rejects.toThrow(
        'Storage deletion failed: Permission denied'
      );
    });
  });

  // ── generateComponentStoragePath ──────────────────────────────────────────

  describe('generateComponentStoragePath', () => {
    it.each([
      ['react', 'proj-1/comp-1.tsx'],
      ['nextjs', 'proj-1/comp-1.tsx'],
      ['vue', 'proj-1/comp-1.vue'],
      ['angular', 'proj-1/comp-1.ts'],
      ['svelte', 'proj-1/comp-1.svelte'],
      ['html', 'proj-1/comp-1.html'],
      ['unknown', 'proj-1/comp-1.txt'],
    ])('generates correct path for %s framework', (framework, expectedPath) => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', framework)).toBe(expectedPath);
    });

    it.each([
      ['../evil', 'Invalid projectId: contains forbidden characters'],
      ['proj/evil', 'Invalid projectId: contains forbidden characters'],
      ['proj\\evil', 'Invalid projectId: contains forbidden characters'],
      ['proj\0evil', 'Invalid projectId: contains forbidden characters'],
      [
        'proj!id',
        'Invalid projectId: must contain only alphanumeric characters, hyphens, and underscores',
      ],
    ])('throws for invalid projectId: %s', (projectId, errorMessage) => {
      expect(() => generateComponentStoragePath(projectId, 'comp-1', 'react')).toThrow(
        errorMessage
      );
    });

    it.each([
      ['../evil', 'Invalid componentId: contains forbidden characters'],
      [
        'comp!id',
        'Invalid componentId: must contain only alphanumeric characters, hyphens, and underscores',
      ],
    ])('throws for invalid componentId: %s', (componentId, errorMessage) => {
      expect(() => generateComponentStoragePath('proj-1', componentId, 'react')).toThrow(
        errorMessage
      );
    });
  });

  // ── validateFileSize ───────────────────────────────────────────────────────

  describe('validateFileSize', () => {
    it.each([
      ['hello', 100, true],
      ['a'.repeat(101), 100, false],
      [Buffer.alloc(50), 100, true],
      [Buffer.alloc(101), 100, false],
      ['a'.repeat(100), 100, true],
    ])('returns %s for size check case', (content, maxSize, expectedResult) => {
      expect(validateFileSize(content, maxSize)).toBe(expectedResult);
    });
  });

  // ── STORAGE_BUCKETS ────────────────────────────────────────────────────────

  describe('STORAGE_BUCKETS', () => {
    it('exports expected bucket names', () => {
      expect(STORAGE_BUCKETS.PROJECT_FILES).toBe('project-files');
      expect(STORAGE_BUCKETS.AVATARS).toBe('avatars');
      expect(STORAGE_BUCKETS.THUMBNAILS).toBe('project-thumbnails');
      expect(STORAGE_BUCKETS.USER_UPLOADS).toBe('user-uploads');
    });
  });

  // ── STORAGE_LIMITS ─────────────────────────────────────────────────────────

  describe('STORAGE_LIMITS', () => {
    it('exports correct size limits in bytes', () => {
      expect(STORAGE_LIMITS.AVATAR).toBe(2 * 1024 * 1024);
      expect(STORAGE_LIMITS.THUMBNAIL).toBe(5 * 1024 * 1024);
      expect(STORAGE_LIMITS.CODE_FILE).toBe(10 * 1024 * 1024);
      expect(STORAGE_LIMITS.USER_UPLOAD).toBe(10 * 1024 * 1024);
    });
  });
});
