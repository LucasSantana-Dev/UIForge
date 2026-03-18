import {
  uploadToStorage,
  downloadFromStorage,
  deleteFromStorage,
  generateComponentStoragePath,
  validateFileSize,
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
} from '@/lib/api/storage';

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

  describe('uploadToStorage', () => {
    it('uploads with default plain-text contentType', async () => {
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

  describe('downloadFromStorage', () => {
    it.each([
      [true, 'file content'],
      [false, null],
    ])('returns expected shape for asText=%s', async (asText, expectedText) => {
      const blob = { text: jest.fn().mockResolvedValue('file content') };
      mockDownload.mockResolvedValue({ data: blob, error: null });

      const result = await downloadFromStorage('project-files', 'proj/comp.tsx', asText);

      if (asText) {
        expect(result).toBe(expectedText);
      } else {
        expect(result).toBe(blob);
      }

      expect(blob.text).toHaveBeenCalledTimes(asText ? 1 : 0);
    });

    it('throws when download returns an error', async () => {
      mockDownload.mockResolvedValue({ data: null, error: { message: 'Object not found' } });

      await expect(downloadFromStorage('project-files', 'missing.tsx')).rejects.toThrow(
        'Storage download failed: Object not found'
      );
    });
  });

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
      ['../evil', 'comp-1', /contains forbidden characters/],
      ['proj/evil', 'comp-1', /contains forbidden characters/],
      ['proj\\evil', 'comp-1', /contains forbidden characters/],
      ['proj\0evil', 'comp-1', /contains forbidden characters/],
      ['proj!id', 'comp-1', /must contain only alphanumeric characters/],
      ['proj-1', '../evil', /contains forbidden characters/],
      ['proj-1', 'comp!id', /must contain only alphanumeric characters/],
    ])('throws for invalid ids: %s / %s', (projectId, componentId, expectedError) => {
      expect(() => generateComponentStoragePath(projectId, componentId, 'react')).toThrow(
        expectedError
      );
    });
  });

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

  describe('exported constants', () => {
    it('matches storage bucket names and limits', () => {
      expect(STORAGE_BUCKETS).toEqual({
        PROJECT_FILES: 'project-files',
        AVATARS: 'avatars',
        THUMBNAILS: 'project-thumbnails',
        USER_UPLOADS: 'user-uploads',
      });

      expect(STORAGE_LIMITS).toEqual({
        AVATAR: 2 * 1024 * 1024,
        THUMBNAIL: 5 * 1024 * 1024,
        CODE_FILE: 10 * 1024 * 1024,
        USER_UPLOAD: 10 * 1024 * 1024,
      });
    });
  });
});
