/**
 * AI Keys Store Tests
 * Tests for BYOK system Zustand state management
 */

import { act, renderHook } from '@testing-library/react';
import { useAIKeyStore } from '@/stores/ai-keys';
import { aiKeyManager } from '@/lib/ai-keys';
import { AIProvider } from '@/lib/encryption';
import { TEST_CONFIG } from '../../../test-config';

// Mock the AI key manager
jest.mock('@/lib/ai-keys');
const mockAIKeyManager = aiKeyManager as jest.Mocked<typeof aiKeyManager>;

describe('AI Keys Store', () => {
  const testApiKey = TEST_CONFIG.API_KEYS.OPENAI;
  const testProvider: AIProvider = 'openai';
  const testEncryptionKey = TEST_CONFIG.ENCRYPTION.TEST_KEY;
  const testKeyId = 'key_test_123';

  beforeEach(() => {
    // Reset the store state before each test
    const store = useAIKeyStore.getState();
    if (store.reset) {
      store.reset();
    }

    jest.clearAllMocks();

    // Reset AI key manager mocks
    mockAIKeyManager.initialize.mockResolvedValue(undefined);
    mockAIKeyManager.addApiKey.mockResolvedValue(undefined);
    mockAIKeyManager.getApiKeys.mockResolvedValue([]);
    mockAIKeyManager.getDefaultApiKey.mockResolvedValue(null);
    mockAIKeyManager.updateApiKey.mockResolvedValue(undefined);
    mockAIKeyManager.deleteApiKey.mockResolvedValue(undefined);
    mockAIKeyManager.setDefaultApiKey.mockResolvedValue(undefined);
    mockAIKeyManager.getUsageStats.mockResolvedValue({
      totalKeys: 0,
      keysByProvider: { openai: 0, anthropic: 0, google: 0 },
      lastUsedTimes: {},
      expiredKeys: [],
    });
    mockAIKeyManager.makeGenerationRequest.mockResolvedValue({
      content: 'test response',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      provider: 'openai',
      model: 'gpt-4',
    });
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAIKeyStore());

      expect(result.current.apiKeys).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
      expect(result.current.encryptionKey).toBeUndefined();
    });

    it('should initialize with encryption key', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });

      expect(mockAIKeyManager.initialize).toHaveBeenCalledWith(testEncryptionKey);
      expect(result.current.encryptionKey).toBe(testEncryptionKey);
    });

    it('should handle initialization errors', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      const error = new Error('Init failed');
      mockAIKeyManager.initialize.mockRejectedValue(error);

      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });

      expect(result.current.error).toBe('Init failed');
    });
  });

  describe('addApiKey', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should add a new API key', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });

      expect(mockAIKeyManager.addApiKey).toHaveBeenCalledWith(testProvider, testApiKey, testEncryptionKey);
      expect(result.current.loading).toBe(false);
    });

    it('should handle add errors', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      const error = new Error('Add failed');
      mockAIKeyManager.addApiKey.mockRejectedValue(error);

      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });

      expect(result.current.error).toBe('Add failed');
      expect(result.current.loading).toBe(false);
    });

    it('should not add if not initialized', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      // Don't initialize

      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });

      expect(result.current.error).toBe('Store not initialized');
    });
  });

  describe('loadApiKeys', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should load API keys', async () => {
      const mockKeys = [{
        provider: testProvider,
        keyId: testKeyId,
        encryptedKey: 'encrypted_key',
        keyName: 'Test Key',
        createdAt: '2026-02-17T12:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: false,
      }];
      mockAIKeyManager.getApiKeys.mockResolvedValue(mockKeys);

      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.loadApiKeys();
      });

      expect(mockAIKeyManager.getApiKeys).toHaveBeenCalledWith(testEncryptionKey);
      expect(result.current.apiKeys).toEqual(mockKeys);
      expect(result.current.loading).toBe(false);
    });

    it('should handle load errors', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      const error = new Error('Load failed');
      mockAIKeyManager.getApiKeys.mockRejectedValue(error);

      await act(async () => {
        await result.current.loadApiKeys();
      });

      expect(result.current.error).toBe('Load failed');
    });
  });

  describe('updateApiKey', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        // Add a key first
        await result.current.addApiKey(testProvider, testApiKey);
        await result.current.loadApiKeys();
      });
    });

    it('should update an API key', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.updateApiKey(testKeyId, 'new-api-key');
      });

      expect(mockAIKeyManager.updateApiKey).toHaveBeenCalledWith(testKeyId, 'new-api-key', testEncryptionKey);
    });

    it('should handle update errors', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      const error = new Error('Update failed');
      mockAIKeyManager.updateApiKey.mockRejectedValue(error);

      await act(async () => {
        await result.current.updateApiKey(testKeyId, 'new-api-key');
      });

      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('deleteApiKey', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        await result.current.addApiKey(testProvider, testApiKey);
        await result.current.loadApiKeys();
      });
    });

    it('should delete an API key', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.deleteApiKey(testKeyId);
      });

      expect(mockAIKeyManager.deleteApiKey).toHaveBeenCalledWith(testKeyId);
    });

    it('should handle delete errors', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      const error = new Error('Delete failed');
      mockAIKeyManager.deleteApiKey.mockRejectedValue(error);

      await act(async () => {
        await result.current.deleteApiKey(testKeyId);
      });

      expect(result.current.error).toBe('Delete failed');
    });
  });

  describe('setDefaultApiKey', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        await result.current.addApiKey(testProvider, testApiKey);
        await result.current.loadApiKeys();
      });
    });

    it('should set default API key', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.setDefaultApiKey(testKeyId);
      });

      expect(mockAIKeyManager.setDefaultApiKey).toHaveBeenCalledWith(testKeyId);
    });

    it('should handle set default errors', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      const error = new Error('Set default failed');
      mockAIKeyManager.setDefaultApiKey.mockRejectedValue(error);

      await act(async () => {
        await result.current.setDefaultApiKey(testKeyId);
      });

      expect(result.current.error).toBe('Set default failed');
    });
  });

  describe('UI state management', () => {
    it('should show/hide add key dialog', () => {
      const { result } = renderHook(() => useAIKeyStore());

      expect(result.current.showAddKeyDialog).toBe(false);

      act(() => {
        result.current.setShowAddKeyDialog(true);
      });

      expect(result.current.showAddKeyDialog).toBe(true);

      act(() => {
        result.current.setShowAddKeyDialog(false);
      });

      expect(result.current.showAddKeyDialog).toBe(false);
    });

    it('should set selected provider', () => {
      const { result } = renderHook(() => useAIKeyStore());

      act(() => {
        result.current.setSelectedProvider('anthropic');
      });

      expect(result.current.selectedProvider).toBe('anthropic');
    });

    it('should set editing key ID', () => {
      const { result } = renderHook(() => useAIKeyStore());

      act(() => {
        result.current.setEditingKeyId('test-key-id');
      });

      expect(result.current.editingKeyId).toBe('test-key-id');

      act(() => {
        result.current.setEditingKeyId(undefined);
      });

      expect(result.current.editingKeyId).toBeUndefined();
    });
  });

  describe('preferences', () => {
    it('should set default provider', () => {
      const { result } = renderHook(() => useAIKeyStore());

      act(() => {
        result.current.setDefaultProvider('anthropic');
      });

      expect(result.current.defaultProvider).toBe('anthropic');
    });

    it('should toggle Gemini fallback', () => {
      const { result } = renderHook(() => useAIKeyStore());

      expect(result.current.geminiFallbackEnabled).toBe(false);

      act(() => {
        result.current.setGeminiFallbackEnabled(true);
      });

      expect(result.current.geminiFallbackEnabled).toBe(true);
    });

    it('should toggle usage tracking', () => {
      const { result } = renderHook(() => useAIKeyStore());

      expect(result.current.usageTrackingEnabled).toBe(true);

      act(() => {
        result.current.setUsageTrackingEnabled(false);
      });

      expect(result.current.usageTrackingEnabled).toBe(false);
    });
  });

  describe('computed properties', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should compute hasApiKeys correctly', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      expect(result.current.apiKeys.length).toBe(0);

      // Add a key
      mockAIKeyManager.getApiKeys.mockResolvedValue([{
        provider: testProvider,
        keyId: testKeyId,
        encryptedKey: 'encrypted_key',
        createdAt: '2026-02-17T00:00:00.000Z',
        isDefault: false,
      }]);

      await act(async () => {
        await result.current.loadApiKeys();
      });

      expect(result.current.apiKeys.length).toBe(1);
    });

    it('should compute keysByProvider correctly', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      const mockKeys = [
        {
          provider: 'openai' as AIProvider,
          keyId: 'key1',
          encryptedKey: 'encrypted_key1',
          keyName: 'OpenAI Key 1',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
        {
          provider: 'openai' as AIProvider,
          keyId: 'key2',
          encryptedKey: 'encrypted_key2',
          keyName: 'OpenAI Key 2',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
        {
          provider: 'anthropic' as AIProvider,
          keyId: 'key3',
          encryptedKey: 'encrypted_key3',
          keyName: 'Anthropic Key',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ];
      mockAIKeyManager.getApiKeys.mockResolvedValue(mockKeys);

      await act(async () => {
        await result.current.loadApiKeys();
      });

      // Compute keys by provider
      const openaiKeys = result.current.apiKeys.filter(key => key.provider === 'openai');
      const anthropicKeys = result.current.apiKeys.filter(key => key.provider === 'anthropic');

      expect(openaiKeys).toHaveLength(2);
      expect(anthropicKeys).toHaveLength(1);
    });
  });

  describe('error recovery', () => {
    it('should recover from errors and continue operations', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });

      // First operation fails
      mockAIKeyManager.addApiKey.mockRejectedValueOnce(new Error('First error'));

      await act(async () => {
        await expect(result.current.addApiKey(testProvider, testApiKey)).rejects.toThrow('First error');
      });

      // Second operation succeeds
      mockAIKeyManager.addApiKey.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });

      expect(result.current.error).toBeUndefined();
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent operations gracefully', async () => {
      const { result } = renderHook(() => useAIKeyStore());

      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });

      // Start multiple operations concurrently
      await act(async () => {
        const promises = [
          result.current.addApiKey('openai', 'key1'),
          result.current.addApiKey('anthropic', 'key2'),
          result.current.addApiKey('google', 'key3'),
        ];
        await Promise.all(promises);
      });

      expect(mockAIKeyManager.addApiKey).toHaveBeenCalledTimes(3);
      expect(result.current.loading).toBe(false);
    });
  });
});
