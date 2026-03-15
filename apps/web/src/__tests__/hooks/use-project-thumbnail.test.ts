import { renderHook, act } from '@testing-library/react';
import { useProjectThumbnail } from '@/hooks/use-project-thumbnail';

const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockRemove = jest.fn();
const mockFrom = jest.fn(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
  remove: mockRemove,
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: mockFrom,
    },
  }),
}));

const makeFile = (name = 'thumb.png') => new File(['data'], name, { type: 'image/png' });

beforeEach(() => {
  jest.clearAllMocks();
  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockReturnValue({
    data: { publicUrl: 'https://cdn.example.com/project-thumbnails/proj-1/thumb.png' },
  });
  mockRemove.mockResolvedValue({ error: null });
});

describe('useProjectThumbnail', () => {
  describe('initial state', () => {
    it('starts with uploading=false and error=null', () => {
      const { result } = renderHook(() => useProjectThumbnail());
      expect(result.current.uploading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('uploadThumbnail', () => {
    it('uploads file and returns public URL', async () => {
      const { result } = renderHook(() => useProjectThumbnail());
      let url: string | null = null;

      await act(async () => {
        url = await result.current.uploadThumbnail('proj-1', makeFile('thumb.png'));
      });

      expect(mockFrom).toHaveBeenCalledWith('project-thumbnails');
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('proj-1/'),
        expect.any(File),
        { cacheControl: '3600', upsert: false }
      );
      expect(url).toBe('https://cdn.example.com/project-thumbnails/proj-1/thumb.png');
      expect(result.current.uploading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets uploading=true during upload', async () => {
      let resolveFn!: () => void;
      mockUpload.mockReturnValue(
        new Promise<{ error: null }>((resolve) => {
          resolveFn = () => resolve({ error: null });
        })
      );

      const { result } = renderHook(() => useProjectThumbnail());

      act(() => {
        void result.current.uploadThumbnail('proj-1', makeFile());
      });

      expect(result.current.uploading).toBe(true);

      await act(async () => {
        resolveFn();
      });

      expect(result.current.uploading).toBe(false);
    });

    it('returns null and sets error on upload failure', async () => {
      mockUpload.mockResolvedValue({ error: new Error('Upload failed') });

      const { result } = renderHook(() => useProjectThumbnail());
      let url: string | null = 'initial';

      await act(async () => {
        url = await result.current.uploadThumbnail('proj-1', makeFile());
      });

      expect(url).toBeNull();
      expect(result.current.error).toBe('Upload failed');
      expect(result.current.uploading).toBe(false);
    });
  });

  describe('deleteThumbnail', () => {
    it('deletes thumbnail and returns true', async () => {
      const { result } = renderHook(() => useProjectThumbnail());
      let success: boolean = false;

      await act(async () => {
        success = await result.current.deleteThumbnail(
          'https://cdn.example.com/project-thumbnails/proj-1/thumb.png'
        );
      });

      expect(mockFrom).toHaveBeenCalledWith('project-thumbnails');
      expect(mockRemove).toHaveBeenCalledWith(['proj-1/thumb.png']);
      expect(success).toBe(true);
    });

    it('returns false for invalid URL', async () => {
      const { result } = renderHook(() => useProjectThumbnail());
      let success: boolean = true;

      await act(async () => {
        success = await result.current.deleteThumbnail('not-a-url');
      });

      expect(success).toBe(false);
    });

    it('returns false when URL has no bucket prefix', async () => {
      const { result } = renderHook(() => useProjectThumbnail());
      let success: boolean = true;

      await act(async () => {
        success = await result.current.deleteThumbnail(
          'https://cdn.example.com/other-bucket/file.png'
        );
      });

      expect(success).toBe(false);
    });

    it('returns false and sets error on delete failure', async () => {
      mockRemove.mockResolvedValue({ error: new Error('Delete failed') });

      const { result } = renderHook(() => useProjectThumbnail());
      let success: boolean = true;

      await act(async () => {
        success = await result.current.deleteThumbnail(
          'https://cdn.example.com/project-thumbnails/proj-1/thumb.png'
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Delete failed');
    });
  });
});
