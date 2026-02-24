import { fetchFlags, clearFlagCache } from '@/lib/features/client';
import { DEFAULT_FEATURE_FLAGS } from '@/lib/features/flags';

const CACHE_KEY = 'siza:feature-flags';

const mockDbFlags = [
  { name: 'ENABLE_STRIPE_BILLING', enabled: true, enabled_for_users: [] },
  { name: 'ENABLE_ANALYTICS', enabled: true, enabled_for_users: ['user-123'] },
];

describe('Feature Flags Client', () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage = {};
    jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: string) => mockLocalStorage[key] ?? null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete mockLocalStorage[key];
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchFlags', () => {
    it('should return cached flags when fresh', async () => {
      const cached = { flags: { ENABLE_STRIPE_BILLING: true }, timestamp: Date.now() };
      mockLocalStorage[CACHE_KEY] = JSON.stringify(cached);

      const flags = await fetchFlags();
      expect(flags.ENABLE_STRIPE_BILLING).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache is expired', async () => {
      const expired = { flags: {}, timestamp: Date.now() - 60_000 };
      mockLocalStorage[CACHE_KEY] = JSON.stringify(expired);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockDbFlags }),
      });

      const flags = await fetchFlags();
      expect(global.fetch).toHaveBeenCalledWith('/api/features/resolve');
      expect(flags.ENABLE_STRIPE_BILLING).toBe(true);
    });

    it('should include userId in API request when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockDbFlags }),
      });

      await fetchFlags('user-123');
      expect(global.fetch).toHaveBeenCalledWith('/api/features/resolve?userId=user-123');
    });

    it('should fall back to defaults on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const flags = await fetchFlags();
      expect(flags).toEqual(DEFAULT_FEATURE_FLAGS);
    });

    it('should fall back to defaults on non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

      const flags = await fetchFlags();
      expect(flags).toEqual(DEFAULT_FEATURE_FLAGS);
    });

    it('should write fetched flags to cache', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockDbFlags }),
      });

      await fetchFlags();
      expect(mockLocalStorage[CACHE_KEY]).toBeDefined();
      const cached = JSON.parse(mockLocalStorage[CACHE_KEY]);
      expect(cached.flags.ENABLE_STRIPE_BILLING).toBe(true);
    });

    it('should resolve user-specific flags', async () => {
      const userFlags = [
        { name: 'ENABLE_BETA_FEATURES', enabled: false, enabled_for_users: ['user-123'] },
      ];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: userFlags }),
      });

      const flags = await fetchFlags('user-123');
      expect(flags.ENABLE_BETA_FEATURES).toBe(true);
    });
  });

  describe('clearFlagCache', () => {
    it('should remove cache from localStorage', () => {
      mockLocalStorage[CACHE_KEY] = 'some-data';
      clearFlagCache();
      expect(mockLocalStorage[CACHE_KEY]).toBeUndefined();
    });
  });
});
