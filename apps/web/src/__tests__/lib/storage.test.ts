import '@testing-library/jest-dom';
import {
  uploadFile,
  downloadFile,
  deleteFile,
  getPublicUrl,
  createSignedUrl,
  listFiles,
  moveFile,
  copyFile,
  uploadAvatar,
  uploadProjectThumbnail,
  uploadCodeFile,
  getAvatarUrl,
  getProjectThumbnailUrl,
} from '@/lib/supabase/storage';
import { mockSupabaseClient } from '../setup/supabase-mock';

// Mock the storage module
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('Supabase Storage', () => {
  const mockStorage = {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockSupabaseClient as any).storage = mockStorage;
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const bucket = 'avatars';
      const path = 'test/test.txt';

      const mockUpload = jest.fn().mockResolvedValue({
        data: { path },
        error: null,
      });

      mockStorage.from.mockReturnValue({
        upload: mockUpload,
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      });

      const result = await uploadFile(bucket, path, mockFile);

      expect(mockStorage.from).toHaveBeenCalledWith(bucket);
      expect(mockUpload).toHaveBeenCalledWith(path, mockFile, {
        cacheControl: '3600',
        contentType: 'text/plain',
        upsert: false,
      });
      expect(result).toEqual({ path });
    });

    it('should throw error on upload failure', async () => {
      const mockFile = new File(['test content'], 'test.txt');
      const mockError = { message: 'Upload failed' };

      const mockUpload = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      mockStorage.from.mockReturnValue({
        upload: mockUpload,
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      });

      await expect(uploadFile('avatars', 'path', mockFile)).rejects.toThrow(
        'Failed to upload file: Upload failed'
      );
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const bucket = 'avatars';
      const path = 'test/test.txt';
      const mockBlob = new Blob(['test content']);

      const mockDownload = jest.fn().mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      mockStorage.from.mockReturnValue({
        upload: jest.fn(),
        download: mockDownload,
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      });

      const result = await downloadFile(bucket, path);

      expect(mockStorage.from).toHaveBeenCalledWith(bucket);
      expect(mockDownload).toHaveBeenCalledWith(path);
      expect(result).toEqual(mockBlob);
    });

    it('should throw error on download failure', async () => {
      const mockError = { message: 'File not found' };

      const mockDownload = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      mockStorage.from.mockReturnValue({
        upload: jest.fn(),
        download: mockDownload,
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      });

      await expect(downloadFile('avatars', 'path')).rejects.toThrow(
        'Failed to download file: File not found'
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const bucket = 'avatars';
      const path = 'test/test.txt';

      const mockRemove = jest.fn().mockResolvedValue({
        data: [{ name: path }],
        error: null,
      });

      mockStorage.from.mockReturnValue({
        upload: jest.fn(),
        download: jest.fn(),
        remove: mockRemove,
        getPublicUrl: jest.fn(),
      });

      const result = await deleteFile(bucket, path);

      expect(mockStorage.from).toHaveBeenCalledWith(bucket);
      expect(mockRemove).toHaveBeenCalledWith([path]);
      expect(result).toEqual([{ name: path }]);
    });

    it('should throw error on delete failure', async () => {
      const mockError = { message: 'Delete failed' };

      const mockRemove = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      mockStorage.from.mockReturnValue({
        upload: jest.fn(),
        download: jest.fn(),
        remove: mockRemove,
        getPublicUrl: jest.fn(),
      });

      await expect(deleteFile('avatars', 'path')).rejects.toThrow(
        'Failed to delete file(s): Delete failed'
      );
    });

    it('should delete multiple files as array', async () => {
      const paths = ['file1.txt', 'file2.txt'];
      const mockRemove = jest.fn().mockResolvedValue({ data: [], error: null });
      mockStorage.from.mockReturnValue({
        upload: jest.fn(),
        download: jest.fn(),
        remove: mockRemove,
        getPublicUrl: jest.fn(),
      });
      await deleteFile('avatars', paths);
      expect(mockRemove).toHaveBeenCalledWith(paths);
    });
  });

  // Cast helper — storage mock has narrow type; cast lets us test extended storage methods
  function bucket(methods: Record<string, jest.Mock>) {
    return methods as ReturnType<typeof mockStorage.from>;
  }

  describe('getPublicUrl', () => {
    it('returns public URL for a file', () => {
      const publicUrl = 'https://example.com/avatars/user/avatar.png';
      mockStorage.from.mockReturnValue(
        bucket({ getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl } }) })
      );
      const result = getPublicUrl('avatars', 'user/avatar.png');
      expect(result).toBe(publicUrl);
      expect(mockStorage.from).toHaveBeenCalledWith('avatars');
    });
  });

  describe('createSignedUrl', () => {
    it('returns signed URL with default expiry', async () => {
      const signedUrl = 'https://example.com/signed/url?token=abc';
      const mockCreate = jest.fn().mockResolvedValue({ data: { signedUrl }, error: null });
      mockStorage.from.mockReturnValue(bucket({ createSignedUrl: mockCreate }));
      const result = await createSignedUrl('user-uploads', 'private/file.pdf');
      expect(result).toBe(signedUrl);
      expect(mockCreate).toHaveBeenCalledWith('private/file.pdf', 3600);
    });

    it('accepts custom expiry', async () => {
      const signedUrl = 'https://example.com/signed?token=xyz';
      const mockCreate = jest.fn().mockResolvedValue({ data: { signedUrl }, error: null });
      mockStorage.from.mockReturnValue(bucket({ createSignedUrl: mockCreate }));
      await createSignedUrl('user-uploads', 'file.pdf', 7200);
      expect(mockCreate).toHaveBeenCalledWith('file.pdf', 7200);
    });

    it('throws on error', async () => {
      const mockCreate = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Forbidden' } });
      mockStorage.from.mockReturnValue(bucket({ createSignedUrl: mockCreate }));
      await expect(createSignedUrl('user-uploads', 'file.pdf')).rejects.toThrow(
        'Failed to create signed URL: Forbidden'
      );
    });
  });

  describe('listFiles', () => {
    it('lists files with defaults', async () => {
      const files = [{ name: 'a.png' }, { name: 'b.png' }];
      const mockList = jest.fn().mockResolvedValue({ data: files, error: null });
      mockStorage.from.mockReturnValue(bucket({ list: mockList }));
      const result = await listFiles('project-thumbnails');
      expect(result).toEqual(files);
      expect(mockList).toHaveBeenCalledWith('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });
    });

    it('lists files with custom path and options', async () => {
      const mockList = jest.fn().mockResolvedValue({ data: [], error: null });
      mockStorage.from.mockReturnValue(bucket({ list: mockList }));
      await listFiles('project-files', 'user-1/project-1', {
        limit: 10,
        offset: 5,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      expect(mockList).toHaveBeenCalledWith('user-1/project-1', {
        limit: 10,
        offset: 5,
        sortBy: { column: 'created_at', order: 'desc' },
      });
    });

    it('throws on error', async () => {
      const mockList = jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      mockStorage.from.mockReturnValue(bucket({ list: mockList }));
      await expect(listFiles('avatars')).rejects.toThrow('Failed to list files: Not found');
    });
  });

  describe('moveFile', () => {
    it('moves a file successfully', async () => {
      const mockMove = jest.fn().mockResolvedValue({ data: { message: 'moved' }, error: null });
      mockStorage.from.mockReturnValue(bucket({ move: mockMove }));
      const result = await moveFile('project-files', 'old/path.txt', 'new/path.txt');
      expect(mockMove).toHaveBeenCalledWith('old/path.txt', 'new/path.txt');
      expect(result).toEqual({ message: 'moved' });
    });

    it('throws on error', async () => {
      const mockMove = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Move failed' } });
      mockStorage.from.mockReturnValue(bucket({ move: mockMove }));
      await expect(moveFile('project-files', 'a', 'b')).rejects.toThrow(
        'Failed to move file: Move failed'
      );
    });
  });

  describe('copyFile', () => {
    it('copies a file successfully', async () => {
      const mockCopy = jest.fn().mockResolvedValue({ data: { path: 'new/copy.txt' }, error: null });
      mockStorage.from.mockReturnValue(bucket({ copy: mockCopy }));
      const result = await copyFile('project-files', 'original.txt', 'copy.txt');
      expect(mockCopy).toHaveBeenCalledWith('original.txt', 'copy.txt');
      expect(result).toEqual({ path: 'new/copy.txt' });
    });

    it('throws on error', async () => {
      const mockCopy = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Copy failed' } });
      mockStorage.from.mockReturnValue(bucket({ copy: mockCopy }));
      await expect(copyFile('project-files', 'a', 'b')).rejects.toThrow(
        'Failed to copy file: Copy failed'
      );
    });
  });

  describe('uploadAvatar', () => {
    it('uploads avatar with correct path and upsert', async () => {
      const mockUpload = jest
        .fn()
        .mockResolvedValue({ data: { path: 'user-1/avatar.png' }, error: null });
      mockStorage.from.mockReturnValue(bucket({ upload: mockUpload }));
      const file = new File([''], 'photo.png', { type: 'image/png' });
      await uploadAvatar(file, 'user-1');
      expect(mockStorage.from).toHaveBeenCalledWith('avatars');
      expect(mockUpload).toHaveBeenCalledWith(
        'user-1/avatar.png',
        file,
        expect.objectContaining({ upsert: true })
      );
    });
  });

  describe('uploadProjectThumbnail', () => {
    it('uploads thumbnail with correct path', async () => {
      const mockUpload = jest
        .fn()
        .mockResolvedValue({ data: { path: 'u/p/thumbnail.jpg' }, error: null });
      mockStorage.from.mockReturnValue(bucket({ upload: mockUpload }));
      const file = new File([''], 'thumb.jpg', { type: 'image/jpeg' });
      await uploadProjectThumbnail(file, 'u', 'p');
      expect(mockStorage.from).toHaveBeenCalledWith('project-thumbnails');
      expect(mockUpload).toHaveBeenCalledWith(
        'u/p/thumbnail.jpg',
        file,
        expect.objectContaining({ upsert: true })
      );
    });
  });

  describe('uploadCodeFile', () => {
    it('uploads code content as blob with correct path', async () => {
      const mockUpload = jest
        .fn()
        .mockResolvedValue({ data: { path: 'u/p/c/component.tsx' }, error: null });
      mockStorage.from.mockReturnValue(bucket({ upload: mockUpload }));
      await uploadCodeFile('<div/>', 'u', 'p', 'c', 'component.tsx');
      expect(mockStorage.from).toHaveBeenCalledWith('project-files');
      expect(mockUpload).toHaveBeenCalledWith(
        'u/p/c/component.tsx',
        expect.any(Blob),
        expect.objectContaining({ contentType: 'text/plain', upsert: true })
      );
    });
  });

  describe('getAvatarUrl', () => {
    it('returns public URL with default extension', () => {
      mockStorage.from.mockReturnValue(
        bucket({
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://cdn.example.com/avatars/user-1/avatar.png' },
          }),
        })
      );
      const url = getAvatarUrl('user-1');
      expect(url).toContain('user-1/avatar.png');
    });

    it('uses custom extension', () => {
      mockStorage.from.mockReturnValue(
        bucket({
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://cdn.example.com/avatars/user-1/avatar.jpg' },
          }),
        })
      );
      const url = getAvatarUrl('user-1', 'jpg');
      expect(url).toContain('user-1/avatar.jpg');
    });
  });

  describe('getProjectThumbnailUrl', () => {
    it('returns public thumbnail URL', () => {
      mockStorage.from.mockReturnValue(
        bucket({
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://cdn.example.com/project-thumbnails/u/p/thumbnail.png' },
          }),
        })
      );
      const url = getProjectThumbnailUrl('u', 'p');
      expect(url).toContain('u/p/thumbnail.png');
    });
  });
});
