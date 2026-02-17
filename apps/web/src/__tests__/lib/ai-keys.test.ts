/**
 * AI Keys Service Tests
 * Tests for BYOK system key management service
 */

import { aiKeyManager } from '@/lib/ai-keys';
import { storage } from '@/lib/storage';
import { encryptApiKey, decryptApiKey, validateApiKey as validateKeyFormat, AIProvider } from '@/lib/encryption';
import { EncryptedApiKey } from '@/lib/encryption';

// Mock storage
jest.mock('@/lib/storage');
jest.mock('@/lib/encryption');

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockEncryptApiKey = encryptApiKey as jest.MockedFunction<typeof encryptApiKey>;
const mockDecryptApiKey = decryptApiKey as jest.MockedFunction<typeof decryptApiKey>;
const mockValidateKeyFormat = validateKeyFormat as jest.MockedFunction<typeof validateKeyFormat>;

describe('AI Keys Service', () => {
  const testApiKey = 'sk-test123456789';
  const testProvider: AIProvider = 'openai';
  const testEncryptionKey = 'test-encryption-key';
  const testEncryptedKey: EncryptedApiKey = {
    provider: testProvider,
    encryptedKey: 'encrypted_test_key',
    keyId: 'key_test_123',
    createdAt: '2026-02-17T00:00:00.000Z',
    lastUsed: '2026-02-17T12:00:00.000Z',
    isDefault: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset storage mocks
    mockStorage.init.mockResolvedValue(undefined);
    mockStorage.storeApiKey.mockResolvedValue(undefined);
    mockStorage.getApiKey.mockResolvedValue(testEncryptedKey);
    mockStorage.getApiKeys.mockResolvedValue([testEncryptedKey]);
    mockStorage.updateApiKeyUsage.mockResolvedValue(undefined);
    mockStorage.deleteApiKey.mockResolvedValue(undefined);
    mockStorage.clearAllData.mockResolvedValue(undefined);
    mockStorage.getUserPreferences.mockResolvedValue({
      encryptionKey: testEncryptionKey,
      defaultProvider: 'google',
      geminiFallbackEnabled: true,
      usageTrackingEnabled: true,
    });
    mockStorage.setUserPreferences.mockResolvedValue(undefined);
    mockStorage.getStorageStats.mockResolvedValue({
      apiKeysCount: 1,
      totalSize: '2.5 KB',
    });

    // Reset encryption mocks
    mockEncryptApiKey.mockReturnValue('encrypted_test_key');
    mockDecryptApiKey.mockReturnValue(testApiKey);
    mockValidateKeyFormat.mockReturnValue(true);
  });

  describe('addApiKey', () => {
    it('should add a new API key successfully', async () => {
      const result = await addApiKey(testProvider, testApiKey, testEncryptionKey);

      expect(mockValidateKeyFormat).toHaveBeenCalledWith(testProvider, testApiKey);
      expect(mockEncryptApiKey).toHaveBeenCalledWith(testApiKey, testEncryptionKey);
      expect(mockStorage.storeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: testProvider,
          encryptedKey: 'encrypted_test_key',
          keyId: expect.stringMatching(/^key_/),
        }),
        false
      );
      expect(result).toEqual(testEncryptedKey);
    });

    it('should set as default when specified', async () => {
      await addApiKey(testProvider, testApiKey, testEncryptionKey, true);

      expect(mockStorage.storeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          isDefault: true,
        }),
        true
      );
    });

    it('should handle invalid API key format', async () => {
      mockValidateKeyFormat.mockReturnValue(false);

      await expect(addApiKey(testProvider, 'invalid-key', testEncryptionKey)).rejects.toThrow('Invalid API key format');
    });

    it('should handle storage errors', async () => {
      const error = new Error('Storage failed');
      mockStorage.storeApiKey.mockRejectedValue(error);

      await expect(addApiKey(testProvider, testApiKey, testEncryptionKey)).rejects.toThrow('Storage failed');
    });
  });

  describe('getApiKey', () => {
    it('should retrieve and decrypt API key', async () => {
      const result = await getApiKey('key_test_123');

      expect(mockStorage.getApiKey).toHaveBeenCalledWith('key_test_123');
      expect(mockDecryptApiKey).toHaveBeenCalledWith('encrypted_test_key', testEncryptionKey);
      expect(result).toEqual(testApiKey);
    });

    it('should return null for non-existent key', async () => {
      mockStorage.getApiKey.mockResolvedValue(null);

      const result = await getApiKey('non_existent');

      expect(result).toBeNull();
    });

    it('should handle decryption errors', async () => {
      mockDecryptApiKey.mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      await expect(getApiKey('key_test_123')).rejects.toThrow('Decryption failed');
    });
  });

  describe('getAllApiKeys', () => {
    it('should retrieve and decrypt all API keys', async () => {
      const encryptedKeys = [testEncryptedKey];
      mockStorage.getApiKeys.mockResolvedValue(encryptedKeys);

      const result = await getAllApiKeys(testEncryptionKey);

      expect(mockStorage.getApiKeys).toHaveBeenCalled();
      expect(mockDecryptApiKey).toHaveBeenCalledWith('encrypted_test_key', testEncryptionKey);
      expect(result).toEqual([testApiKey]);
    });

    it('should return empty array when no keys exist', async () => {
      mockStorage.getApiKeys.mockResolvedValue([]);

      const result = await getAllApiKeys(testEncryptionKey);

      expect(result).toEqual([]);
    });
  });

  describe('updateApiKey', () => {
    it('should update API key metadata', async () => {
      const updates = { lastUsed: '2026-02-17T13:00:00.000Z' };

      await updateApiKey('key_test_123', updates);

      expect(mockStorage.getApiKey).toHaveBeenCalledWith('key_test_123');
      expect(mockStorage.storeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          ...testEncryptedKey,
          ...updates,
        })
      );
    });

    it('should handle non-existent key', async () => {
      mockStorage.getApiKey.mockResolvedValue(null);

      await expect(updateApiKey('non_existent', {})).rejects.toThrow('API key not found');
    });
  });

  describe('deleteApiKey', () => {
    it('should delete API key', async () => {
      await deleteApiKey('key_test_123');

      expect(mockStorage.deleteApiKey).toHaveBeenCalledWith('key_test_123');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Delete failed');
      mockStorage.deleteApiKey.mockRejectedValue(error);

      await expect(deleteApiKey('key_test_123')).rejects.toThrow('Delete failed');
    });
  });

  describe('setDefaultApiKey', () => {
    it('should set API key as default for provider', async () => {
      await setDefaultApiKey(testProvider, 'key_test_123');

      expect(mockStorage.getApiKeys).toHaveBeenCalled();
      expect(mockStorage.storeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          isDefault: true,
        })
      );
    });

    it('should handle non-existent key', async () => {
      mockStorage.getApiKeys.mockResolvedValue([]);

      await expect(setDefaultApiKey(testProvider, 'non_existent')).rejects.toThrow('API key not found');
    });
  });

  describe('getDefaultApiKey', () => {
    it('should get default API key for provider', async () => {
      mockStorage.getApiKeys.mockResolvedValue([testEncryptedKey]);

      const result = await getDefaultApiKey(testProvider, testEncryptionKey);

      expect(mockStorage.getApiKeys).toHaveBeenCalled();
      expect(mockDecryptApiKey).toHaveBeenCalledWith('encrypted_test_key', testEncryptionKey);
      expect(result).toEqual(testApiKey);
    });

    it('should return null when no default key exists', async () => {
      const nonDefaultKey = { ...testEncryptedKey, isDefault: false };
      mockStorage.getApiKeys.mockResolvedValue([nonDefaultKey]);

      const result = await getDefaultApiKey(testProvider, testEncryptionKey);

      expect(result).toBeNull();
    });

    it('should return null when no keys exist for provider', async () => {
      mockStorage.getApiKeys.mockResolvedValue([]);

      const result = await getDefaultApiKey(testProvider, testEncryptionKey);

      expect(result).toBeNull();
    });
  });

  describe('validateApiKey', () => {
    it('should validate API key format', async () => {
      const result = await validateApiKey(testProvider, testApiKey);

      expect(mockValidateKeyFormat).toHaveBeenCalledWith(testProvider, testApiKey);
      expect(result).toBe(true);
    });

    it('should return false for invalid format', async () => {
      mockValidateKeyFormat.mockReturnValue(false);

      const result = await validateApiKey(testProvider, 'invalid-key');

      expect(result).toBe(false);
    });
  });

  describe('generateComponentWithUserKey', () => {
    const mockGenerationOptions = {
      framework: 'react',
      description: 'Create a button component',
      aiProvider: 'openai',
      useUserKey: true,
    };

    it('should generate component with user key', async () => {
      // Mock successful generation
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 'export default function Button() { return <button>Click me</button>; }',
          provider: 'openai',
          model: 'gpt-4',
          tokensUsed: 150,
        }),
      });

      const result = await generateComponentWithUserKey(mockGenerationOptions);

      expect(result).toEqual({
        code: 'export default function Button() { return <button>Click me</button>; }',
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 150,
      });
    });

    it('should use default key when user key not available', async () => {
      const optionsWithoutUserKey = { ...mockGenerationOptions, useUserKey: false };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 'export default function Button() { return <button>Click me</button>; }',
          provider: 'google',
          model: 'gemini-1.5-flash',
          tokensUsed: 100,
        }),
      });

      const result = await generateComponentWithUserKey(optionsWithoutUserKey);

      expect(result.provider).toBe('google');
      expect(result.model).toBe('gemini-1.5-flash');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(generateComponentWithUserKey(mockGenerationOptions)).rejects.toThrow('API Error');
    });
  });

  describe('getApiKeyUsageStats', () => {
    it('should return usage statistics', async () => {
      mockStorage.getStorageStats.mockResolvedValue({
        apiKeysCount: 3,
        totalSize: '5.2 KB',
      });

      const result = await getApiKeyUsageStats();

      expect(result).toEqual({
        totalKeys: 3,
        totalSize: '5.2 KB',
        providers: expect.any(Object),
      });
    });

    it('should handle empty storage', async () => {
      mockStorage.getStorageStats.mockResolvedValue({
        apiKeysCount: 0,
        totalSize: '0 B',
      });

      const result = await getApiKeyUsageStats();

      expect(result).toEqual({
        totalKeys: 0,
        totalSize: '0 B',
        providers: {},
      });
    });
  });

  describe('clearAllApiKeys', () => {
    it('should clear all API keys', async () => {
      await clearAllApiKeys();

      expect(mockStorage.clearAllData).toHaveBeenCalled();
    });

    it('should handle clear errors', async () => {
      const error = new Error('Clear failed');
      mockStorage.clearAllData.mockRejectedValue(error);

      await expect(clearAllApiKeys()).rejects.toThrow('Clear failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty encryption key', async () => {
      await expect(addApiKey(testProvider, testApiKey, '')).rejects.toThrow('Encryption key is required');
    });

    it('should handle null/undefined values', async () => {
      await expect(addApiKey(testProvider, null as any, testEncryptionKey)).rejects.toThrow('API key is required');
      await expect(addApiKey(testProvider, testApiKey, null as any)).rejects.toThrow('Encryption key is required');
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        addApiKey('openai', 'key1', testEncryptionKey),
        addApiKey('anthropic', 'key2', testEncryptionKey),
        getAllApiKeys(testEncryptionKey),
      ];

      mockStorage.storeApiKey.mockResolvedValue(undefined);
      mockStorage.getApiKeys.mockResolvedValue([]);

      await Promise.all(promises);

      expect(mockStorage.storeApiKey).toHaveBeenCalledTimes(2);
      expect(mockStorage.getApiKeys).toHaveBeenCalledTimes(1);
    });

    it('should validate provider types', async () => {
      const validProviders: AIProvider[] = ['openai', 'anthropic', 'google'];

      for (const provider of validProviders) {
        mockValidateKeyFormat.mockReturnValue(true);
        await expect(addApiKey(provider, testApiKey, testEncryptionKey)).resolves;
      }
    });
  });

  describe('Security Considerations', () => {
    it('should not log sensitive data', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await addApiKey(testProvider, testApiKey, testEncryptionKey);

      // Ensure no sensitive data is logged
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(testApiKey)
      );

      consoleSpy.mockRestore();
    });

    it('should handle encryption failures', async () => {
      mockEncryptApiKey.mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      await expect(addApiKey(testProvider, testApiKey, testEncryptionKey)).rejects.toThrow('Encryption failed');
    });

    it('should handle decryption failures', async () => {
      mockDecryptApiKey.mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      await expect(getApiKey('key_test_123')).rejects.toThrow('Decryption failed');
    });
  });

  describe('Integration with Storage', () => {
    it('should initialize storage when needed', async () => {
      mockStorage.init.mockClear();
      mockStorage.init.mockResolvedValue(undefined);

      await addApiKey(testProvider, testApiKey, testEncryptionKey);

      expect(mockStorage.init).toHaveBeenCalledTimes(1);
    });

    it('should update user preferences when setting default', async () => {
      await setDefaultApiKey(testProvider, 'key_test_123');

      expect(mockStorage.setUserPreferences).toHaveBeenCalledWith({
        defaultProvider: testProvider,
      });
    });

    it('should read user preferences for default provider', async () => {
      const preferences = {
        encryptionKey: testEncryptionKey,
        defaultProvider: testProvider,
        geminiFallbackEnabled: true,
        usageTrackingEnabled: true,
      };
      mockStorage.getUserPreferences.mockResolvedValue(preferences);

      await getDefaultApiKey(testProvider, testEncryptionKey);

      expect(mockStorage.getUserPreferences).toHaveBeenCalled();
    });
  });
});
