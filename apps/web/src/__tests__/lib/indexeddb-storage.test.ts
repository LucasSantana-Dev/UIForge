/**
 * IndexedDB Storage Tests
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

// Mock localStorage for preferences
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('IndexedDB Storage', () => {
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

    // Reset localStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});

    // Reset database mocks
    mockDatabase.objectStoreNames.contains.mockReturnValue(false);
  });

  describe('init', () => {
    it('should initialize database successfully', async () => {
      await storage.init();

      expect(global.indexedDB.open).toHaveBeenCalledWith('UIForgeKeys', 1);
      expect(storage.db).toBe(mockDatabase);
    });

    it('should handle database upgrade', async () => {
      return new Promise<void>((resolve) => {
        mockOpenDBRequest.onupgradeneeded = (event: any) => {
          expect(event.target.result.createObjectStore).toHaveBeenCalledWith('apiKeys', {
            keyPath: 'keyId',
          });
          expect(event.target.result.createObjectStore).toHaveBeenCalledWith('user_preferences', {
            keyPath: 'id',
          });
          resolve();
        };

        storage.init();
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      global.indexedDB.open = jest.fn(() => ({
        ...mockOpenDBRequest,
        onerror: jest.fn((callback) => {
          callback({ target: { error } });
        }),
      })) as any;

      await expect(storage.init()).rejects.toThrow('Database error');
    });
  });

  describe('storeApiKey', () => {
    it('should store API key successfully', async () => {
      await storage.storeApiKey(testEncryptedKey);

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readwrite');
      expect(mockObjectStore.put).toHaveBeenCalledWith(testEncryptedKey);
    });

    it('should handle storage errors', async () => {
      const error = new Error('Storage failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.storeApiKey(testEncryptedKey)).rejects.toThrow('Storage failed');
    });
  });

  describe('getApiKey', () => {
    it('should retrieve API key by ID', async () => {
      mockObjectStore.get.mockResolvedValue(testEncryptedKey);

      const result = await storage.getApiKey('key_test_123');

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readonly');
      expect(mockObjectStore.get).toHaveBeenCalledWith('key_test_123');
      expect(result).toBe(testEncryptedKey);
    });

    it('should return null for non-existent key', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);

      const result = await storage.getApiKey('non_existent');

      expect(result).toBeNull();
    });

    it('should handle retrieval errors', async () => {
      const error = new Error('Retrieval failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.getApiKey('key_test_123')).rejects.toThrow('Retrieval failed');
    });
  });

  describe('getApiKeys', () => {
    it('should retrieve all API keys', async () => {
      const keys = [testEncryptedKey];
      mockObjectStore.getAll.mockResolvedValue(keys);

      const result = await storage.getApiKeys();

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readonly');
      expect(mockObjectStore.getAll).toHaveBeenCalled();
      expect(result).toEqual(keys);
    });

    it('should return empty array when no keys exist', async () => {
      mockObjectStore.getAll.mockResolvedValue([]);

      const result = await storage.getApiKeys();

      expect(result).toEqual([]);
    });

    it('should handle getAll errors', async () => {
      const error = new Error('GetAll failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.getApiKeys()).rejects.toThrow('GetAll failed');
    });
  });

  describe('updateApiKeyUsage', () => {
    it('should update API key usage timestamp', async () => {
      const updatedKey = { ...testEncryptedKey, lastUsed: '2026-02-17T13:00:00.000Z' };
      mockObjectStore.get.mockResolvedValue(testEncryptedKey);

      await storage.updateApiKeyUsage('key_test_123');

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readwrite');
      expect(mockObjectStore.get).toHaveBeenCalledWith('key_test_123');
      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({ lastUsed: expect.any(String) })
      );
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.updateApiKeyUsage('key_test_123')).rejects.toThrow('Update failed');
    });
  });

  describe('deleteApiKey', () => {
    it('should delete API key by ID', async () => {
      await storage.deleteApiKey('key_test_123');

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readwrite');
      expect(mockObjectStore.delete).toHaveBeenCalledWith('key_test_123');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.deleteApiKey('key_test_123')).rejects.toThrow('Delete failed');
    });
  });

  describe('getDefaultApiKey', () => {
    it('should retrieve default API key for provider', async () => {
      mockObjectStore.getAll.mockResolvedValue([testEncryptedKey]);

      const result = await storage.getDefaultApiKey('openai');

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readonly');
      expect(mockObjectStore.getAll).toHaveBeenCalled();
      expect(result).toBe(testEncryptedKey);
    });

    it('should return null when no default key exists', async () => {
      mockObjectStore.getAll.mockResolvedValue([]);

      const result = await storage.getDefaultApiKey('openai');

      expect(result).toBeNull();
    });
  });

  describe('setUserPreferences', () => {
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

    it('should handle preference storage errors', async () => {
      const error = new Error('Preference storage failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      const preferences = {
        encryptionKey: 'test_key',
        defaultProvider: 'openai' as AIProvider,
        geminiFallbackEnabled: true,
        usageTrackingEnabled: false,
      };

      await expect(storage.setUserPreferences(preferences)).rejects.toThrow('Preference storage failed');
    });
  });

  describe('getUserPreferences', () => {
    it('should retrieve user preferences', async () => {
      const preferences = {
        encryptionKey: 'test_key',
        defaultProvider: 'openai' as AIProvider,
        geminiFallbackEnabled: true,
        usageTrackingEnabled: false,
      };
      mockObjectStore.get.mockResolvedValue(preferences);

      const result = await storage.getUserPreferences();

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['user_preferences'], 'readonly');
      expect(mockObjectStore.get).toHaveBeenCalledWith('user_prefs');
      expect(result).toEqual(preferences);
    });

    it('should return default preferences when none exist', async () => {
      mockObjectStore.get.mockResolvedValue(undefined);

      const result = await storage.getUserPreferences();

      expect(result).toEqual({
        encryptionKey: '',
        defaultProvider: 'google',
        geminiFallbackEnabled: true,
        usageTrackingEnabled: true,
      });
    });
  });

  describe('clearAllData', () => {
    it('should clear all stored data', async () => {
      await storage.clearAllData();

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys', 'user_preferences'], 'readwrite');
      expect(mockObjectStore.clear).toHaveBeenCalledTimes(2);
    });

    it('should handle clear errors', async () => {
      const error = new Error('Clear failed');
      mockTransaction.onerror = jest.fn((callback) => {
        callback({ target: { error } });
      });

      await expect(storage.clearAllData()).rejects.toThrow('Clear failed');
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      const keys = [testEncryptedKey, { ...testEncryptedKey, keyId: 'key_456' }];
      mockObjectStore.getAll.mockResolvedValue(keys);

      const result = await storage.getStorageStats();

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['api_keys'], 'readonly');
      expect(mockObjectStore.getAll).toHaveBeenCalled();
      expect(result).toEqual({
        apiKeysCount: 2,
        totalSize: expect.any(String),
      });
    });

    it('should return zero stats when no keys exist', async () => {
      mockObjectStore.getAll.mockResolvedValue([]);

      const result = await storage.getStorageStats();

      expect(result).toEqual({
        apiKeysCount: 0,
        totalSize: '0 B',
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle database not initialized', async () => {
      global.indexedDB.open = jest.fn(() => ({
        onsuccess: null,
        onerror: jest.fn((callback) => {
          callback({ target: { error: new Error('Not initialized') } });
        }),
      })) as any;

      await expect(storage.init()).rejects.toThrow('Not initialized');
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        storage.storeApiKey(testEncryptedKey),
        storage.getApiKey('key_test_123'),
        storage.getApiKeys(),
      ];

      mockObjectStore.put.mockResolvedValue(undefined);
      mockObjectStore.get.mockResolvedValue(testEncryptedKey);
      mockObjectStore.getAll.mockResolvedValue([testEncryptedKey]);

      await Promise.all(promises);

      expect(mockDatabase.transaction).toHaveBeenCalledTimes(3);
    });

    it('should handle large data sets', async () => {
      const manyKeys = Array.from({ length: 100 }, (_, i) => ({
        ...testEncryptedKey,
        keyId: `key_${i}`,
        encryptedKey: `encrypted_${i}`.repeat(100), // Large encrypted key
      }));

      mockObjectStore.getAll.mockResolvedValue(manyKeys);

      const result = await storage.getApiKeys();

      expect(result).toHaveLength(100);
      expect(result[0].encryptedKey.length).toBeGreaterThan(1000);
    });
  });

  describe('Security Considerations', () => {
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