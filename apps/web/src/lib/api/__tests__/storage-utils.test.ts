import {
  generateComponentStoragePath,
  validateFileSize,
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
} from '@/lib/api/storage';

describe('Storage Utilities', () => {
  describe('generateComponentStoragePath', () => {
    it('generates correct path for React framework', () => {
      const path = generateComponentStoragePath('proj-1', 'comp-1', 'react');
      expect(path).toBe('proj-1/comp-1.tsx');
    });

    it('generates correct path for Vue framework', () => {
      const path = generateComponentStoragePath('proj-1', 'comp-1', 'vue');
      expect(path).toBe('proj-1/comp-1.vue');
    });

    it('generates correct path for Angular framework', () => {
      const path = generateComponentStoragePath('proj-1', 'comp-1', 'angular');
      expect(path).toBe('proj-1/comp-1.ts');
    });

    it('generates correct path for Svelte framework', () => {
      const path = generateComponentStoragePath('proj-1', 'comp-1', 'svelte');
      expect(path).toBe('proj-1/comp-1.svelte');
    });

    it('generates correct path for HTML framework', () => {
      const path = generateComponentStoragePath('proj-1', 'comp-1', 'html');
      expect(path).toBe('proj-1/comp-1.html');
    });

    it('uses txt extension for unknown framework', () => {
      const path = generateComponentStoragePath('proj-1', 'comp-1', 'unknown');
      expect(path).toBe('proj-1/comp-1.txt');
    });

    it('rejects projectId with path traversal', () => {
      expect(() => generateComponentStoragePath('../etc', 'comp-1', 'react')).toThrow(
        'Invalid projectId'
      );
    });

    it('rejects componentId with path traversal', () => {
      expect(() => generateComponentStoragePath('proj-1', '../../passwd', 'react')).toThrow(
        'Invalid componentId'
      );
    });

    it('rejects projectId with forward slash', () => {
      expect(() => generateComponentStoragePath('proj/1', 'comp-1', 'react')).toThrow(
        'Invalid projectId'
      );
    });

    it('rejects projectId with backslash', () => {
      expect(() => generateComponentStoragePath('proj\\1', 'comp-1', 'react')).toThrow(
        'Invalid projectId'
      );
    });

    it('rejects projectId with null byte', () => {
      expect(() => generateComponentStoragePath('proj\x001', 'comp-1', 'react')).toThrow(
        'Invalid projectId'
      );
    });

    it('rejects projectId with special characters', () => {
      expect(() => generateComponentStoragePath('proj@1', 'comp-1', 'react')).toThrow(
        'Invalid projectId'
      );
    });

    it('accepts valid alphanumeric with hyphens and underscores', () => {
      const path = generateComponentStoragePath('my-project_123', 'my-component_456', 'react');
      expect(path).toBe('my-project_123/my-component_456.tsx');
    });
  });

  describe('validateFileSize', () => {
    it('returns true for content within limit', () => {
      expect(validateFileSize('small', 1024)).toBe(true);
    });

    it('returns false for content exceeding limit', () => {
      const large = 'x'.repeat(1025);
      expect(validateFileSize(large, 1024)).toBe(false);
    });

    it('returns true for content exactly at limit', () => {
      const exact = 'x'.repeat(100);
      expect(validateFileSize(exact, 100)).toBe(true);
    });

    it('handles Buffer input', () => {
      const buf = Buffer.from('test data');
      expect(validateFileSize(buf, 100)).toBe(true);
      expect(validateFileSize(buf, 5)).toBe(false);
    });

    it('accounts for multi-byte UTF-8 characters', () => {
      const emoji = '\u{1F600}';
      expect(validateFileSize(emoji, 3)).toBe(false);
      expect(validateFileSize(emoji, 4)).toBe(true);
    });
  });

  describe('STORAGE_BUCKETS', () => {
    it('has all expected bucket names', () => {
      expect(STORAGE_BUCKETS.PROJECT_FILES).toBe('project-files');
      expect(STORAGE_BUCKETS.AVATARS).toBe('avatars');
      expect(STORAGE_BUCKETS.THUMBNAILS).toBe('project-thumbnails');
      expect(STORAGE_BUCKETS.USER_UPLOADS).toBe('user-uploads');
    });
  });

  describe('STORAGE_LIMITS', () => {
    it('has correct size limits', () => {
      expect(STORAGE_LIMITS.AVATAR).toBe(2 * 1024 * 1024);
      expect(STORAGE_LIMITS.THUMBNAIL).toBe(5 * 1024 * 1024);
      expect(STORAGE_LIMITS.CODE_FILE).toBe(10 * 1024 * 1024);
      expect(STORAGE_LIMITS.USER_UPLOAD).toBe(10 * 1024 * 1024);
    });
  });
});
