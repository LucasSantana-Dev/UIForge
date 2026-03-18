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
    it('generates correct path for react framework', () => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', 'react')).toBe('proj-1/comp-1.tsx');
    });

    it('generates correct path for nextjs framework', () => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', 'nextjs')).toBe('proj-1/comp-1.tsx');
    });

    it('generates correct path for vue framework', () => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', 'vue')).toBe('proj-1/comp-1.vue');
    });

    it('generates correct path for angular framework', () => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', 'angular')).toBe('proj-1/comp-1.ts');
    });

    it('generates correct path for svelte framework', () => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', 'svelte')).toBe(
        'proj-1/comp-1.svelte'
      );
    });

    it('generates correct path for html framework', () => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', 'html')).toBe('proj-1/comp-1.html');
    });

    it('falls back to .txt for unknown frameworks', () => {
      expect(generateComponentStoragePath('proj-1', 'comp-1', 'unknown')).toBe('proj-1/comp-1.txt');
    });

    it('throws on projectId with path traversal (..)', () => {
      expect(() => generateComponentStoragePath('../evil', 'comp-1', 'react')).toThrow(
        'Invalid projectId: contains forbidden characters'
      );
    });

    it('throws on projectId with forward slash', () => {
      expect(() => generateComponentStoragePath('proj/evil', 'comp-1', 'react')).toThrow(
        'Invalid projectId: contains forbidden characters'
      );
    });

    it('throws on projectId with backslash', () => {
      expect(() => generateComponentStoragePath('proj\\evil', 'comp-1', 'react')).toThrow(
        'Invalid projectId: contains forbidden characters'
      );
    });

    it('throws on projectId with null byte', () => {
      expect(() => generateComponentStoragePath('proj\0evil', 'comp-1', 'react')).toThrow(
        'Invalid projectId: contains forbidden characters'
      );
    });

    it('throws on projectId with special chars', () => {
      expect(() => generateComponentStoragePath('proj!id', 'comp-1', 'react')).toThrow(
        'Invalid projectId: must contain only alphanumeric characters, hyphens, and underscores'
      );
    });

    it('throws on componentId with path traversal (..)', () => {
      expect(() => generateComponentStoragePath('proj-1', '../evil', 'react')).toThrow(
        'Invalid componentId: contains forbidden characters'
      );
    });

    it('throws on componentId with special chars', () => {
      expect(() => generateComponentStoragePath('proj-1', 'comp!id', 'react')).toThrow(
        'Invalid componentId: must contain only alphanumeric characters, hyphens, and underscores'
      );
    });
  });

  // ── validateFileSize ───────────────────────────────────────────────────────

  describe('validateFileSize', () => {
    it('returns true when content is within limit (string)', () => {
      expect(validateFileSize('hello', 100)).toBe(true);
    });

    it('returns false when string content exceeds limit', () => {
      expect(validateFileSize('a'.repeat(101), 100)).toBe(false);
    });

    it('returns true when Buffer content is within limit', () => {
      expect(validateFileSize(Buffer.alloc(50), 100)).toBe(true);
    });

    it('returns false when Buffer content exceeds limit', () => {
      expect(validateFileSize(Buffer.alloc(101), 100)).toBe(false);
    });

    it('returns true exactly at the limit boundary', () => {
      expect(validateFileSize('a'.repeat(100), 100)).toBe(true);
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
