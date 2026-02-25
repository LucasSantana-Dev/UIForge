// Polyfill structuredClone for jsdom environment
if (typeof structuredClone === 'undefined') {
  (global as any).structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));
}

import 'fake-indexeddb/auto';
import { storage } from '@/lib/storage';
import { EncryptedApiKey, AIProvider } from '@/lib/encryption';

describe('IndexedDB Storage', () => {
  const testKey: EncryptedApiKey = {
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

  it('should initialize and create stores', async () => {
    const db = (storage as any).db as IDBDatabase;
    expect(db.objectStoreNames.contains('api_keys')).toBe(true);
    expect(db.objectStoreNames.contains('user_preferences')).toBe(true);
  });

  it('should store and retrieve API key', async () => {
    await storage.storeApiKey(testKey);
    const result = await storage.getApiKey('key_test_123');
    expect(result).toEqual(testKey);
  });

  it('should overwrite key with same keyId', async () => {
    await storage.storeApiKey(testKey);
    await storage.storeApiKey({ ...testKey, encryptedKey: 'updated' });
    const result = await storage.getApiKey('key_test_123');
    expect(result?.encryptedKey).toBe('updated');
  });

  it('should return null for non-existent key', async () => {
    expect(await storage.getApiKey('nope')).toBeNull();
  });

  it('should retrieve all keys', async () => {
    await storage.storeApiKey(testKey);
    await storage.storeApiKey({ ...testKey, keyId: 'key_456', provider: 'anthropic' });
    expect(await storage.getApiKeys()).toHaveLength(2);
  });

  it('should return empty array when no keys', async () => {
    expect(await storage.getApiKeys()).toEqual([]);
  });

  it('should update usage timestamp', async () => {
    await storage.storeApiKey(testKey);
    await storage.updateApiKeyUsage('key_test_123');
    const result = await storage.getApiKey('key_test_123');
    expect(new Date(result!.lastUsed!).getTime()).toBeGreaterThan(
      new Date(testKey.lastUsed!).getTime()
    );
  });

  it('should reject update for non-existent key', async () => {
    await expect(storage.updateApiKeyUsage('nope')).rejects.toThrow('API key not found');
  });

  it('should delete key', async () => {
    await storage.storeApiKey(testKey);
    await storage.deleteApiKey('key_test_123');
    expect(await storage.getApiKey('key_test_123')).toBeNull();
  });

  it('should find default key for provider', async () => {
    await storage.storeApiKey(testKey);
    expect(await storage.getDefaultApiKey('openai')).toEqual(testKey);
  });

  it('should return null when no default key', async () => {
    await storage.storeApiKey({ ...testKey, isDefault: false });
    expect(await storage.getDefaultApiKey('openai')).toBeNull();
  });

  it('should return null for wrong provider', async () => {
    await storage.storeApiKey(testKey);
    expect(await storage.getDefaultApiKey('anthropic')).toBeNull();
  });

  it('should store and retrieve user preferences', async () => {
    const prefs = {
      encryptionKey: 'test',
      defaultProvider: 'openai' as AIProvider,
      geminiFallbackEnabled: true,
      usageTrackingEnabled: false,
    };
    await storage.setUserPreferences(prefs);
    expect(await storage.getUserPreferences()).toEqual(prefs);
  });

  it('should return default preferences when none set', async () => {
    expect(await storage.getUserPreferences()).toEqual({
      encryptionKey: '',
      defaultProvider: 'google',
      geminiFallbackEnabled: true,
      usageTrackingEnabled: true,
    });
  });

  it('should clear all data', async () => {
    await storage.storeApiKey(testKey);
    await storage.clearAllData();
    expect(await storage.getApiKeys()).toEqual([]);
  });

  it('should return storage stats', async () => {
    await storage.storeApiKey(testKey);
    await storage.storeApiKey({ ...testKey, keyId: 'key_2' });
    const stats = await storage.getStorageStats();
    expect(stats.apiKeysCount).toBe(2);
    expect(stats.totalSize).toMatch(/\d/);
  });

  it('should return zero stats when empty', async () => {
    expect(await storage.getStorageStats()).toEqual({ apiKeysCount: 0, totalSize: '0 B' });
  });

  it('should handle concurrent writes', async () => {
    await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        storage.storeApiKey({ ...testKey, keyId: `k_${i}` })
      )
    );
    expect(await storage.getApiKeys()).toHaveLength(5);
  });
});
