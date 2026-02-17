/**
 * AI Keys Store Tests
 * Tests for BYOK system Zustand state management
 */

import { act, renderHook } from '@testing-library/react';
import { useAIKeysStore } from '@/stores/ai-keys';
import { aiKeyManager } from '@/lib/ai-keys';
import { AIProvider } from '@/lib/encryption';

// Mock the AI key manager
jest.mock('@/lib/ai-keys');
const mockAIKeyManager = aiKeyManager as jest.Mocked<typeof aiKeyManager>;

describe('AI Keys Store', () => {
  const testApiKey = 'sk-test123456789';
  const testProvider: AIProvider = 'openai';
  const testEncryptionKey = 'test-encryption-key';
  const testKeyId = 'key_test_123';

  beforeEach(() => {
    // Reset the store state before each test
    useAIKeysStore.getState().reset();
    
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
      usage: { promptTokens: 10, completionTokens: 20 },
    });
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      expect(result.current.apiKeys).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.encryptionKey).toBe(null);
      expect(result.current.isInitialized).toBe(false);
    });

    it('should initialize with encryption key', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      
      expect(mockAIKeyManager.initialize).toHaveBeenCalledWith(testEncryptionKey);
      expect(result.current.encryptionKey).toBe(testEncryptionKey);
      expect(result.current.isInitialized).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      const error = new Error('Init failed');
      mockAIKeyManager.initialize.mockRejectedValue(error);
      
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      
      expect(result.current.error).toBe('Init failed');
      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe('addApiKey', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should add a new API key', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });
      
      expect(mockAIKeyManager.addApiKey).toHaveBeenCalledWith(testProvider, testApiKey, testEncryptionKey);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle add errors', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      const error = new Error('Add failed');
      mockAIKeyManager.addApiKey.mockRejectedValue(error);
      
      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });
      
      expect(result.current.error).toBe('Add failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should not add if not initialized', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      // Don't initialize
      
      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });
      
      expect(result.current.error).toBe('Store not initialized');
    });
  });

  describe('loadApiKeys', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should load API keys', async () => {
      const mockKeys = [{
        provider: testProvider,
        keyId: testKeyId,
        encryptedKey: 'encrypted_key',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: false,
      }];
      mockAIKeyManager.getApiKeys.mockResolvedValue(mockKeys);
      
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        await result.current.loadApiKeys();
      });
      
      expect(mockAIKeyManager.getApiKeys).toHaveBeenCalledWith(testEncryptionKey);
      expect(result.current.apiKeys).toEqual(mockKeys);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle load errors', async () => {
      const { result } = renderHook(() => useAIKeysStore());
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
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        // Add a key first
        await result.current.addApiKey(testProvider, testApiKey);
        await result.current.loadApiKeys();
      });
    });

    it('should update an API key', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        await result.current.updateApiKey(testKeyId, 'new-api-key');
      });
      
      expect(mockAIKeyManager.updateApiKey).toHaveBeenCalledWith(testKeyId, 'new-api-key', testEncryptionKey);
    });

    it('should handle update errors', async () => {
      const { result } = renderHook(() => useAIKeysStore());
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
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        await result.current.addApiKey(testProvider, testApiKey);
        await result.current.loadApiKeys();
      });
    });

    it('should delete an API key', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        await result.current.deleteApiKey(testKeyId);
      });
      
      expect(mockAIKeyManager.deleteApiKey).toHaveBeenCalledWith(testKeyId);
    });

    it('should handle delete errors', async () => {
      const { result } = renderHook(() => useAIKeysStore());
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
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        await result.current.addApiKey(testProvider, testApiKey);
        await result.current.loadApiKeys();
      });
    });

    it('should set default API key', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        await result.current.setDefaultApiKey(testKeyId);
      });
      
      expect(mockAIKeyManager.setDefaultApiKey).toHaveBeenCalledWith(testKeyId);
    });

    it('should handle set default errors', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      const error = new Error('Set default failed');
      mockAIKeyManager.setDefaultApiKey.mockRejectedValue(error);
      
      await act(async () => {
        await result.current.setDefaultApiKey(testKeyId);
      });
      
      expect(result.current.error).toBe('Set default failed');
    });
  });

  describe('getDefaultApiKey', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should get default API key', async () => {
      const mockDefaultKey = {
        provider: testProvider,
        keyId: testKeyId,
        encryptedKey: 'encrypted_key',
        createdAt: '2026-02-17T00:00:00.000Z',
        isDefault: true,
      };
      mockAIKeyManager.getDefaultApiKey.mockResolvedValue(mockDefaultKey);
      
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        const defaultKey = await result.current.getDefaultApiKey(testProvider);
        expect(defaultKey).toEqual(mockDefaultKey);
      });
      
      expect(mockAIKeyManager.getDefaultApiKey).toHaveBeenCalledWith(testProvider, testEncryptionKey);
    });

    it('should return null when no default key', async () => {
      mockAIKeyManager.getDefaultApiKey.mockResolvedValue(null);
      
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        const defaultKey = await result.current.getDefaultApiKey(testProvider);
        expect(defaultKey).toBeNull();
      });
    });
  });

  describe('generateComponent', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        await result.current.addApiKey(testProvider, testApiKey);
        await result.current.loadApiKeys();
      });
    });

    it('should generate component with user key', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      const request = {
        provider: testProvider,
        model: 'gpt-4',
        prompt: 'Create a button',
        options: {},
      };
      
      await act(async () => {
        const response = await result.current.generateComponent(request);
        expect(response).toEqual({
          content: 'test response',
          usage: { promptTokens: 10, completionTokens: 20 },
        });
      });
      
      expect(mockAIKeyManager.makeGenerationRequest).toHaveBeenCalledWith(request, testEncryptionKey);
    });

    it('should handle generation errors', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      const error = new Error('Generation failed');
      mockAIKeyManager.makeGenerationRequest.mockRejectedValue(error);
      const request = {
        provider: testProvider,
        model: 'gpt-4',
        prompt: 'Create a button',
        options: {},
      };
      
      await act(async () => {
        await expect(result.current.generateComponent(request)).rejects.toThrow('Generation failed');
      });
    });
  });

  describe('getUsageStats', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should get usage statistics', async () => {
      const mockStats = {
        totalKeys: 3,
        keysByProvider: { openai: 2, anthropic: 1, google: 0 },
        lastUsedTimes: { [testKeyId]: '2026-02-17T12:00:00.000Z' },
        expiredKeys: [],
      };
      mockAIKeyManager.getUsageStats.mockResolvedValue(mockStats);
      
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        const stats = await result.current.getUsageStats();
        expect(stats).toEqual(mockStats);
      });
      
      expect(mockAIKeyManager.getUsageStats).toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      // Set an error
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      
      // Clear the error
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      // Initialize and add data
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
        await result.current.addApiKey(testProvider, testApiKey);
      });
      
      // Reset
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.apiKeys).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.encryptionKey).toBe(null);
      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe('computed properties', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAIKeysStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
    });

    it('should compute hasApiKeys correctly', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      expect(result.current.hasApiKeys).toBe(false);
      
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
      
      expect(result.current.hasApiKeys).toBe(true);
    });

    it('should compute keysByProvider correctly', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      const mockKeys = [
        {
          provider: 'openai' as AIProvider,
          keyId: 'key1',
          encryptedKey: 'encrypted_key1',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
        {
          provider: 'openai' as AIProvider,
          keyId: 'key2',
          encryptedKey: 'encrypted_key2',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
        {
          provider: 'anthropic' as AIProvider,
          keyId: 'key3',
          encryptedKey: 'encrypted_key3',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ];
      mockAIKeyManager.getApiKeys.mockResolvedValue(mockKeys);
      
      await act(async () => {
        await result.current.loadApiKeys();
      });
      
      expect(result.current.keysByProvider).toEqual({
        openai: 2,
        anthropic: 1,
        google: 0,
      });
    });

    it('should compute defaultKeys correctly', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      const mockKeys = [
        {
          provider: 'openai' as AIProvider,
          keyId: 'key1',
          encryptedKey: 'encrypted_key1',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: true,
        },
        {
          provider: 'anthropic' as AIProvider,
          keyId: 'key2',
          encryptedKey: 'encrypted_key2',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ];
      mockAIKeyManager.getApiKeys.mockResolvedValue(mockKeys);
      
      await act(async () => {
        await result.current.loadApiKeys();
      });
      
      expect(result.current.defaultKeys).toEqual({
        openai: mockKeys[0],
        anthropic: null,
        google: null,
      });
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent operations gracefully', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
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
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error recovery', () => {
    it('should recover from errors and continue operations', async () => {
      const { result } = renderHook(() => useAIKeysStore());
      
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      
      // First operation fails
      mockAIKeyManager.addApiKey.mockRejectedValueOnce(new Error('First error'));
      
      await act(async () => {
        await expect(result.current.addApiKey(testProvider, testApiKey)).rejects.toThrow('First error');
      });
      
      expect(result.current.error).toBe('First error');
      
      // Clear error and try again
      act(() => {
        result.current.clearError();
      });
      
      mockAIKeyManager.addApiKey.mockResolvedValue(undefined);
      
      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });
      
      expect(result.current.error).toBe(null);
      expect(mockAIKeyManager.addApiKey).toHaveBeenCalledTimes(2);
    });
  });
});
