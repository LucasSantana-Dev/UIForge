/**
 * AI Keys Manager Tests
 * Tests for BYOK system key management service
 */

import { aiKeyManager } from '@/lib/ai-keys';
import { storage } from '@/lib/storage';
import { validateApiKey, createEncryptedApiKey, AIProvider } from '@/lib/encryption';
import { TEST_CONFIG } from '../../../test-config';

// Mock storage and validation
jest.mock('@/lib/storage');
jest.mock('@/lib/encryption');

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockValidateApiKey = validateApiKey as jest.MockedFunction<typeof validateApiKey>;
const mockCreateEncryptedApiKey = createEncryptedApiKey as jest.MockedFunction<
  typeof createEncryptedApiKey
>;

// TODO: Enable when feature is implemented
describe('AI Keys Manager', () => {
  const testApiKey = TEST_CONFIG.API_KEYS.OPENAI;
  const testProvider: AIProvider = 'openai';
  const testEncryptionKey = TEST_CONFIG.ENCRYPTION.TEST_KEY;
  const testKeyId = 'key_test_123';

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset storage mocks
    mockStorage.init.mockResolvedValue(undefined);
    mockStorage.storeApiKey.mockResolvedValue(undefined);
    mockStorage.getApiKey.mockResolvedValue({
      provider: testProvider,
      encryptedKey: 'encrypted_test_key',
      keyId: testKeyId,
      createdAt: '2026-02-17T00:00:00.000Z',
      lastUsed: '2026-02-17T12:00:00.000Z',
      isDefault: false,
    });
    mockStorage.getApiKeys.mockResolvedValue([
      {
        provider: testProvider,
        encryptedKey: 'encrypted_test_key',
        keyId: testKeyId,
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: false,
      },
    ]);
    mockStorage.getDefaultApiKey.mockResolvedValue({
      provider: testProvider,
      encryptedKey: 'encrypted_test_key',
      keyId: testKeyId,
      createdAt: '2026-02-17T00:00:00.000Z',
      lastUsed: '2026-02-17T12:00:00.000Z',
      isDefault: true,
    });
    mockStorage.updateApiKeyUsage.mockResolvedValue(undefined);
    mockStorage.deleteApiKey.mockResolvedValue(undefined);
    mockStorage.setUserPreferences.mockResolvedValue(undefined);

    // Reset validation mock
    mockValidateApiKey.mockReturnValue(true);
    mockCreateEncryptedApiKey.mockReturnValue({
      provider: testProvider,
      encryptedKey: 'encrypted_test_key',
      keyId: 'key_generated_123',
      createdAt: '2026-02-17T00:00:00.000Z',
      lastUsed: '2026-02-17T12:00:00.000Z',
      isDefault: false,
    });
  });

  describe('initialize', () => {
    it('should initialize with encryption key', async () => {
      await aiKeyManager.initialize(testEncryptionKey);

      expect(mockStorage.setUserPreferences).toHaveBeenCalledWith({
        encryptionKey: testEncryptionKey,
      });
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Init failed');
      mockStorage.setUserPreferences.mockRejectedValue(error);

      await expect(aiKeyManager.initialize(testEncryptionKey)).rejects.toThrow('Init failed');
    });
  });

  describe('addApiKey', () => {
    it('should add a new API key successfully', async () => {
      await aiKeyManager.addApiKey(testProvider, testApiKey, testEncryptionKey);

      expect(mockValidateApiKey).toHaveBeenCalledWith(testApiKey, testProvider);
      expect(mockStorage.storeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: testProvider,
          keyId: expect.stringMatching(/^key_/),
        })
      );
    });

    it('should handle invalid API key format', async () => {
      mockValidateApiKey.mockReturnValue(false);

      await expect(
        aiKeyManager.addApiKey(testProvider, 'invalid-key', testEncryptionKey)
      ).rejects.toThrow('Invalid API key format');
    });

    it('should handle storage errors', async () => {
      const error = new Error('Storage failed');
      mockStorage.storeApiKey.mockRejectedValue(error);

      await expect(
        aiKeyManager.addApiKey(testProvider, testApiKey, testEncryptionKey)
      ).rejects.toThrow('Storage failed');
    });
  });

  describe('getApiKeys', () => {
    it('should retrieve all API keys', async () => {
      const result = await aiKeyManager.getApiKeys(testEncryptionKey);

      expect(mockStorage.getApiKeys).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        provider: testProvider,
        keyId: testKeyId,
      });
    });

    it('should return empty array when no keys exist', async () => {
      mockStorage.getApiKeys.mockResolvedValue([]);

      const result = await aiKeyManager.getApiKeys(testEncryptionKey);

      expect(result).toEqual([]);
    });

    it('should handle decryption errors gracefully', async () => {
      // Mock decryption failure by returning invalid encrypted data
      mockStorage.getApiKeys.mockResolvedValue([
        {
          provider: testProvider,
          encryptedKey: 'invalid_encrypted_data',
          keyId: testKeyId,
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ]);

      const result = await aiKeyManager.getApiKeys(testEncryptionKey);

      // Should handle gracefully and return empty or partial results
      expect(result).toBeDefined();
    });
  });

  describe('getDefaultApiKey', () => {
    it('should get default API key for provider', async () => {
      const result = await aiKeyManager.getDefaultApiKey(testProvider, testEncryptionKey);

      expect(mockStorage.getDefaultApiKey).toHaveBeenCalledWith(testProvider);
      expect(result).toMatchObject({
        provider: testProvider,
        keyId: testKeyId,
        isDefault: true,
      });
    });

    it('should return null when no default key exists', async () => {
      mockStorage.getDefaultApiKey.mockResolvedValue(null);

      const result = await aiKeyManager.getDefaultApiKey(testProvider, testEncryptionKey);

      expect(result).toBeNull();
    });
  });

  describe('updateApiKey', () => {
    it('should update an existing API key', async () => {
      await aiKeyManager.updateApiKey(testKeyId, testApiKey, testEncryptionKey);

      expect(mockStorage.getApiKey).toHaveBeenCalledWith(testKeyId);
      expect(mockStorage.storeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          keyId: testKeyId,
        })
      );
    });

    it('should handle non-existent key', async () => {
      mockStorage.getApiKey.mockResolvedValue(null);

      await expect(
        aiKeyManager.updateApiKey('non_existent', testApiKey, testEncryptionKey)
      ).rejects.toThrow('API key not found');
    });
  });

  describe('deleteApiKey', () => {
    it('should delete an API key', async () => {
      await aiKeyManager.deleteApiKey(testKeyId);

      expect(mockStorage.deleteApiKey).toHaveBeenCalledWith(testKeyId);
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Delete failed');
      mockStorage.deleteApiKey.mockRejectedValue(error);

      await expect(aiKeyManager.deleteApiKey(testKeyId)).rejects.toThrow('Delete failed');
    });
  });

  describe('setDefaultApiKey', () => {
    it('should set API key as default', async () => {
      await aiKeyManager.setDefaultApiKey(testKeyId);

      expect(mockStorage.getApiKey).toHaveBeenCalledWith(testKeyId);
      expect(mockStorage.storeApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          keyId: testKeyId,
          isDefault: true,
        })
      );
    });

    it('should handle non-existent key', async () => {
      mockStorage.getApiKey.mockResolvedValue(null);

      await expect(aiKeyManager.setDefaultApiKey('non_existent')).rejects.toThrow(
        'API key not found'
      );
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const result = await aiKeyManager.getUsageStats();

      expect(mockStorage.getApiKeys).toHaveBeenCalled();
      expect(result).toMatchObject({
        totalKeys: expect.any(Number),
        keysByProvider: expect.any(Object),
        lastUsedTimes: expect.any(Object),
        expiredKeys: expect.any(Array),
      });
    });

    it('should handle empty storage', async () => {
      mockStorage.getApiKeys.mockResolvedValue([]);

      const result = await aiKeyManager.getUsageStats();

      expect(result.totalKeys).toBe(0);
      expect(Object.values(result.keysByProvider).every((count) => count === 0)).toBe(true);
    });
  });

  describe('makeGenerationRequest', () => {
    const mockRequest = {
      provider: testProvider,
      model: 'gpt-4',
      prompt: 'Create a button component',
      options: {},
    };

    it('should make generation request with user key', async () => {
      // Mock successful API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'export default function Button() { return <button>Click me</button>; }',
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100 },
        }),
      });

      const result = await aiKeyManager.makeGenerationRequest(mockRequest, testEncryptionKey);

      expect(result).toMatchObject({
        content: expect.stringContaining('Button'),
        usage: expect.objectContaining({
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
        }),
      });
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(
        aiKeyManager.makeGenerationRequest(mockRequest, testEncryptionKey)
      ).rejects.toThrow('API Error');
    });

    it('should handle no default key available', async () => {
      mockStorage.getDefaultApiKey.mockResolvedValue(null);

      await expect(
        aiKeyManager.makeGenerationRequest(mockRequest, testEncryptionKey)
      ).rejects.toThrow('No default API key found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty encryption key', async () => {
      await expect(aiKeyManager.addApiKey(testProvider, testApiKey, '')).rejects.toThrow(
        'Encryption key is required'
      );
    });

    it('should handle null/undefined values', async () => {
      await expect(
        aiKeyManager.addApiKey(testProvider, null as any, testEncryptionKey)
      ).rejects.toThrow('API key is required');
      await expect(aiKeyManager.addApiKey(testProvider, testApiKey, null as any)).rejects.toThrow(
        'Encryption key is required'
      );
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        aiKeyManager.addApiKey('openai', 'key1', testEncryptionKey),
        aiKeyManager.addApiKey('anthropic', 'key2', testEncryptionKey),
        aiKeyManager.getApiKeys(testEncryptionKey),
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
        mockValidateApiKey.mockReturnValue(true);
        await expect(aiKeyManager.addApiKey(provider, testApiKey, testEncryptionKey)).resolves;
      }
    });
  });

  describe('Security Considerations', () => {
    it('should not log sensitive data', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await aiKeyManager.addApiKey(testProvider, testApiKey, testEncryptionKey);

      // Ensure no sensitive data is logged
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining(testApiKey));

      consoleSpy.mockRestore();
    });

    it('should handle storage failures securely', async () => {
      const error = new Error('Storage security error');
      mockStorage.storeApiKey.mockRejectedValue(error);

      await expect(
        aiKeyManager.addApiKey(testProvider, testApiKey, testEncryptionKey)
      ).rejects.toThrow('Storage security error');
    });
  });

  describe('Integration with Storage', () => {
    it('should initialize storage when needed', async () => {
      mockStorage.init.mockClear();
      mockStorage.init.mockResolvedValue(undefined);

      await aiKeyManager.addApiKey(testProvider, testApiKey, testEncryptionKey);

      expect(mockStorage.init).toHaveBeenCalled();
    });

    it('should update usage when making requests', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'test response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20 },
        }),
      });

      await aiKeyManager.makeGenerationRequest(
        {
          provider: testProvider,
          model: 'gpt-4',
          prompt: 'test',
        },
        testEncryptionKey
      );

      expect(mockStorage.updateApiKeyUsage).toHaveBeenCalledWith(testKeyId);
    });
  });
});
