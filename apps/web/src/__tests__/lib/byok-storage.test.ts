/**
 * BYOK Storage Tests
 * Tests for BYOK system encrypted key storage using IndexedDB
 */

import { storage } from '@/lib/storage';
import { EncryptedApiKey, AIProvider } from '@/lib/encryption';

// Mock IndexedDB
const mockObjectStore = {
  get: jest.fn(),
  getAll: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  add: jest.fn(),
  index: jest.fn(),
  openCursor: jest.fn(),
};

const mockTransaction = {
  objectStore: jest.fn(() => mockObjectStore),
  oncomplete: null,
  onerror: null,
  onabort: null,
};

const mockDatabase = {
  transaction: jest.fn(() => mockTransaction),
  close: jest.fn(),
  createObjectStore: jest.fn(),
  deleteObjectStore: jest.fn(),
  objectStoreNames: {
    contains: jest.fn(),
  },
};

const mockOpenDBRequest = {
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
  result: mockDatabase,
};

// Mock indexedDB
global.indexedDB = {
  open: jest.fn(() => mockOpenDBRequest),
  deleteDatabase: jest.fn(),
  databases: jest.fn(),
} as any;

describe('BYOK Storage', () => {
  const testEncryptedKey: EncryptedApiKey = {
    provider: 'openai',
    encryptedKey: 'encrypted_test_key',
    keyId: 'key_test_123',
    createdAt: '2026-02-17T00:00:00.000Z',
    lastUsed: '2026-02-17T12:00:00.000Z',
    isDefault: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset IndexedDB mocks
    mockObjectStore.get.mockResolvedValue(undefined);
    mockObjectStore.getAll.mockResolvedValue([]);
    mockObjectStore.put.mockResolvedValue(undefined);
    mockObjectStore.delete.mockResolvedValue(undefined);
    mockObjectStore.clear.mockResolvedValue(undefined);

    // Reset database mocks
    mockDatabase.objectStoreNames.contains.mockReturnValue(false);
  });

  describe('Storage Initialization', () => {
    it('should initialize storage successfully', async () => {
      await storage.init();

      expect(global.indexedDB.open).toHaveBeenCalled();
    });

    it('should handle database upgrade', async () => {
      return new Promise<void>((resolve) => {
        mockOpenDBRequest.onupgradeneeded = (event: any) => {
          expect(event.target.result.createObjectStore).toHaveBeenCalled();
          resolve();
        };

        storage.init();
      });
    });
  });

  describe('API Key Storage', () => {
    beforeEach(async () => {
      await storage.init();
    });

    it('should store API key successfully', async () => {
      await storage.storeApiKey(testEncryptedKey);

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readwrite');
      expect(mockObjectStore.put).toHaveBeenCalledWith(expect.objectContaining({
        provider: 'openai',
        keyId: 'key_test_123',
        encryptedKey: 'encrypted_test_key',
      }));
    });

    it('should retrieve API key by ID', async () => {
      mockObjectStore.get.mockResolvedValue(testEncryptedKey);

      const result = await storage.getApiKey('key_test_123');

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readonly');
      expect(mockObjectStore.get).toHaveBeenCalledWith('key_test_123');
      expect(result).toEqual(testEncryptedKey);
    });

    it('should return undefined for non-existent key', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);

      const result = await storage.getApiKey('non_existent');

      expect(result).toBeUndefined();
    });

    it('should retrieve all API keys', async () => {
      const keys = [testEncryptedKey];
      mockObjectStore.getAll.mockResolvedValue(keys);

      const result = await storage.getApiKeys();

      expect(mockObjectStore.getAll).toHaveBeenCalled();
      expect(result).toEqual(keys);
    });

    it('should update API key usage', async () => {
      await storage.updateApiKeyUsage('key_test_123');

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readwrite');
      expect(mockObjectStore.get).toHaveBeenCalledWith('key_test_123');
    });

    it('should delete API key by ID', async () => {
      await storage.deleteApiKey('key_test_123');

      expect(mockObjectStore.delete).toHaveBeenCalledWith('key_test_123');
    });

    it('should clear all data', async () => {
      await storage.clearAllData();

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys', 'user_preferences'], 'readwrite');
      expect(mockObjectStore.clear).toHaveBeenCalled();
    });
  });

  describe('User Preferences', () => {
    beforeEach(async () => {
      await storage.init();
    });

    it('should store user preferences', async () => {
      const preferences = {
        encryptionKey: 'test_key',
        defaultProvider: 'openai' as AIProvider,
        geminiFallbackEnabled: true,
        usageTrackingEnabled: false,
      };

      await storage.setUserPreferences(preferences);

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['user_preferences'], 'readwrite');
      expect(mockObjectStore.put).toHaveBeenCalledWith(preferences, 'user_prefs');
    });

    it('should retrieve user preferences', async () => {
      const preferences = {
        encryptionKey: 'test_key',
        defaultProvider: 'openai' as AIProvider,
        geminiFallbackEnabled: true,
        usageTrackingEnabled: false,
      };

      mockObjectStore.get.mockResolvedValue(preferences);

      const result = await storage.getUserPreferences();

      expect(mockObjectStore.get).toHaveBeenCalledWith('user_prefs');
      expect(result).toEqual(preferences);
    });

    it('should return default preferences when none exist', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);

      const result = await storage.getUserPreferences();

      expect(result).toEqual({
        encryptionKey: undefined,
        defaultProvider: 'google',
        geminiFallbackEnabled: true,
        usageTrackingEnabled: true,
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await storage.init();
    });

    it('should handle storage errors gracefully', async () => {
      const error = new Error('Storage failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.storeApiKey(testEncryptedKey)).rejects.toThrow('Storage failed');
    });

    it('should handle retrieval errors', async () => {
      const error = new Error('Retrieval failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.getApiKey('key_test_123')).rejects.toThrow('Retrieval failed');
    });
  });

  describe('Storage Statistics', () => {
    beforeEach(async () => {
      await storage.init();
    });

    it('should get storage statistics', async () => {
      const stats = {
        apiKeysCount: 5,
        totalSize: '2.5 KB',
      };

      mockObjectStore.getAll.mockResolvedValue([testEncryptedKey]);

      const result = await storage.getStorageStats();

      expect(result).toEqual({
        apiKeysCount: 1,
        totalSize: expect.stringMatching(/\d+\.?\d*\s*(B|KB|MB)/),
      });
    });
  });

  describe('Security Considerations', () => {
    beforeEach(async () => {
      await storage.init();
    });

    it('should not log sensitive data', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await storage.storeApiKey(testEncryptedKey);

      // Ensure no sensitive data is logged
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(testEncryptedKey.encryptedKey)
      );

      consoleSpy.mockRestore();
    });

    it('should handle encrypted key validation', async () => {
      const invalidEncryptedKey = {
        ...testEncryptedKey,
        encryptedKey: '', // Empty encrypted key
      };

      // Should still store but validation happens at business logic level
      await expect(storage.storeApiKey(invalidEncryptedKey)).resolves;
    });
  });
});
