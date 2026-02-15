import '@testing-library/jest-dom';
import { uploadFile, downloadFile, deleteFile } from '@/lib/supabase/storage';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  });
});
