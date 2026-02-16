/**
 * Storage Utilities Unit Tests
 */

import {
  generateComponentStoragePath,
  validateFileSize,
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
} from '../storage';

describe('Storage Utilities', () => {
  describe('generateComponentStoragePath', () => {
    it('should generate correct path for React component', () => {
      const path = generateComponentStoragePath(
        'project-123',
        'component-456',
        'react'
      );
      expect(path).toBe('project-123/component-456.tsx');
    });

    it('should generate correct path for Vue component', () => {
      const path = generateComponentStoragePath(
        'project-123',
        'component-456',
        'vue'
      );
      expect(path).toBe('project-123/component-456.vue');
    });

    it('should generate correct path for Angular component', () => {
      const path = generateComponentStoragePath(
        'project-123',
        'component-456',
        'angular'
      );
      expect(path).toBe('project-123/component-456.ts');
    });

    it('should generate correct path for Svelte component', () => {
      const path = generateComponentStoragePath(
        'project-123',
        'component-456',
        'svelte'
      );
      expect(path).toBe('project-123/component-456.svelte');
    });

    it('should generate correct path for HTML', () => {
      const path = generateComponentStoragePath(
        'project-123',
        'component-456',
        'html'
      );
      expect(path).toBe('project-123/component-456.html');
    });

    it('should default to txt for unknown framework', () => {
      const path = generateComponentStoragePath(
        'project-123',
        'component-456',
        'unknown'
      );
      expect(path).toBe('project-123/component-456.txt');
    });
  });

  describe('validateFileSize', () => {
    it('should return true for content within limit', () => {
      const content = 'a'.repeat(100);
      const result = validateFileSize(content, 1024);
      expect(result).toBe(true);
    });

    it('should return false for content exceeding limit', () => {
      const content = 'a'.repeat(2000);
      const result = validateFileSize(content, 1024);
      expect(result).toBe(false);
    });

    it('should handle Buffer content', () => {
      const buffer = Buffer.from('test content');
      const result = validateFileSize(buffer, 100);
      expect(result).toBe(true);
    });

    it('should return false for Buffer exceeding limit', () => {
      const buffer = Buffer.alloc(2000);
      const result = validateFileSize(buffer, 1024);
      expect(result).toBe(false);
    });

    it('should handle exact size match', () => {
      const content = 'a'.repeat(1024);
      const result = validateFileSize(content, 1024);
      expect(result).toBe(true);
    });

    it('should handle empty content', () => {
      const result = validateFileSize('', 1024);
      expect(result).toBe(true);
    });
  });

  describe('STORAGE_BUCKETS', () => {
    it('should have correct bucket names', () => {
      expect(STORAGE_BUCKETS.PROJECT_FILES).toBe('project-files');
      expect(STORAGE_BUCKETS.AVATARS).toBe('avatars');
      expect(STORAGE_BUCKETS.THUMBNAILS).toBe('project-thumbnails');
      expect(STORAGE_BUCKETS.USER_UPLOADS).toBe('user-uploads');
    });
  });

  describe('STORAGE_LIMITS', () => {
    it('should have correct size limits', () => {
      expect(STORAGE_LIMITS.AVATAR).toBe(2 * 1024 * 1024); // 2MB
      expect(STORAGE_LIMITS.THUMBNAIL).toBe(5 * 1024 * 1024); // 5MB
      expect(STORAGE_LIMITS.CODE_FILE).toBe(10 * 1024 * 1024); // 10MB
      expect(STORAGE_LIMITS.USER_UPLOAD).toBe(10 * 1024 * 1024); // 10MB
    });
  });
});
