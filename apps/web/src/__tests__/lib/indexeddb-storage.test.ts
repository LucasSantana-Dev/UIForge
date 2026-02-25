/**
 * IndexedDB Storage Tests
 * Uses fake-indexeddb for real IndexedDB implementation in tests
 */

import 'fake-indexeddb/auto';
import { storage } from '@/lib/storage';
import { EncryptedApiKey, AIProvider } from '@/lib/encryption';

describe('IndexedDB Storage', () => {
  const testEncryptedKey: EncryptedApiKey = {
    provider: 'openai',
    encryptedKey: 'encrypted_test_key',
    keyId: 'key_test_123',
    createdAt: '2026-02-17T00:00:00.000Z',
    lastUsed: '2026-02-17T12:00:00.000Z',
    isDefault: true,
  };

  beforeEach(async () => {
    const db = (storage as any).db as IDBDatabase | null;
    if (db) db.close();
    (storage as any).db = null;
    await storage.init();
    await storage.clearAllData();
  });

  afterAll(() => {
    const db = (storage as any).db as IDBDatabase | null;
    if (db) db.close();
    (storage as any).db = null;
  });

  describe('init', () => {
    it('should initialize database successfully', async () => {
      expect((storage as any).db).not.toBeNull();
    });

    it('should create object stores on upgrade', async () => {
      const db = (storage as any).db as IDBDatabase;
      expect(db.objectStoreNames.contains('api_keys')).toBe(true);
      expect(db.objectStoreNames.contains('user_preferences')).toBe(true);
    });
  });

  describe('storeApiKey', () => {
    it('should store API key successfully', async () => {
      await storage.storeApiKey(testEncryptedKey);
      const result = await storage.getApiKey('key_test_123');
      expect(result).toEqual(testEncryptedKey);
    });

    it('should overwrite existing key with same keyId', async () => {
      await storage.storeApiKey(testEncryptedKey);
      const updated = { ...testEncryptedKey, encryptedKey: 'updated_key' };
      await storage.storeApiKey(updated);
      const result = await storage.getApiKey('key_test_123');
      expect(result?.encryptedKey).toBe('updated_key');
    });
  });

  describe('getApiKey', () => {
    it('should retrieve API key by ID', async () => {
      await storage.storeApiKey(testEncryptedKey);
      const result = await storage.getApiKey('key_test_123');
      expect(result).toEqual(testEncryptedKey);
    });

    it('should return null for non-existent key', async () => {
      const result = await storage.getApiKey('non_existent');
      expect(result).toBeNull();
    });
  });

  describe('getApiKeys', () => {
    it('should retrieve all API keys', async () => {
      const key2: EncryptedApiKey = {
        ...testEncryptedKey,
        keyId: 'key_test_456',
        provider: 'anthropic',
      };
      await storage.storeApiKey(testEncryptedKey);
      await storage.storeApiKey(key2);
      const result = await storage.getApiKeys();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no keys exist', async () => {
      const result = await storage.getApiKeys();
      expect(result).toEqual([]);
    });
  });

  describe('updateApiKeyUsage', () => {
    it('should update API key usage timestamp', async () => {
      await storage.storeApiKey(testEncryptedKey);
      await storage.updateApiKeyUsage('key_test_123');
      const result = await storage.getApiKey('key_test_123');
      expect(result?.lastUsed).toBeDefined();
      expect(new Date(result!.lastUsed!).getTime()).toBeGreaterThan(
        new Date(testEncryptedKey.lastUsed!).getTime()
      );
    });

    it('should reject for non-existent key', async () => {
      await expect(storage.updateApiKeyUsage('non_existent')).rejects.toThrow(
        'API key not found'
      );
    });
  });

  describe('deleteApiKey', () => {
    it('should delete API key by ID', async () => {
      await storage.storeApiKey(testEncryptedKey);
      await storage.deleteApiKey('key_test_123');
      const result = await storage.getApiKey('key_test_123');
      expect(result).toBeNull();
    });
  });

  describe('getDefaultApiKey', () => {
    it('should retrieve default API key for provider', async () => {
      await storage.storeApiKey(testEncryptedKey);
      const result = await storage.getDefaultApiKey('openai');
      expect(result).toEqual(testEncryptedKey);
    });

    it('should return null when no default key exists', async () => {
      const nonDefault = { ...testEncryptedKey, isDefault: false };
      await storage.storeApiKey(nonDefault);
      const result = await storage.getDefaultApiKey('openai');
      expect(result).toBeNull();
    });

    it('should return null for different provider', async () => {
      await storage.storeApiKey(testEncryptedKey);
      const result = await storage.getDefaultApiKey('anthropic');
      expect(result).toBeNull();
    });
  });

  describe('setUserPreferences', () => {
    it('should store user preferences', async () => {
      const preferences = {
        encryptionKey: 'test-key',
        defaultProvider: 'openai' as AIProvider,
        geminiFallbackEnabled: true,
        usageTrackingEnabled: false,
      };
      await storage.setUserPreferences(preferences);
      const result = await storage.getUserPreferences();
      expect(result).toEqual(preferences);
    });
  });

  describe('getUserPreferences', () => {
    it('should return default preferences when none exist', async () => {
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
      await storage.storeApiKey(testEncryptedKey);
      await storage.clearAllData();
      const keys = await storage.getApiKeys();
      expect(keys).toEqual([]);
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      await storage.storeApiKey(testEncryptedKey);
      await storage.storeApiKey({ ...testEncryptedKey, keyId: 'key_456' });
      const result = await storage.getStorageStats();
      expect(result.apiKeysCount).toBe(2);
      expect(result.totalSize).toMatch(/\d+\.?\d*\s*(B|KB|MB)/);
    });

    it('should return zero stats when no keys exist', async () => {
      const result = await storage.getStorageStats();
      expect(result).toEqual({ apiKeysCount: 0, totalSize: '0 B' });
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent writes', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        storage.storeApiKey({ ...testEncryptedKey, keyId: `key_${i}` })
      );
      await Promise.all(promises);
      const keys = await storage.getApiKeys();
      expect(keys).toHaveLength(5);
    });
  });
});
