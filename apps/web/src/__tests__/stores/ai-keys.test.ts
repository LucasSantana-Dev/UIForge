/**
 * AI Keys Store Tests
 * Tests for BYOK system Zustand state management
 */

import { act, renderHook } from '@testing-library/react';
import { useAIKeyStore } from '@/stores/ai-keys';
import { aiKeyManager } from '@/lib/ai-keys';
import { AIProvider } from '@/lib/encryption';
import { TEST_CONFIG } from '../../../test-config';

jest.mock('@/lib/ai-keys');
const mockAIKeyManager = aiKeyManager as jest.Mocked<typeof aiKeyManager>;

describe('AI Keys Store', () => {
  const testApiKey = TEST_CONFIG.API_KEYS.OPENAI;
  const testProvider: AIProvider = 'openai';
  const testEncryptionKey = TEST_CONFIG.ENCRYPTION.TEST_KEY;
  const testKeyId = 'key_test_123';

  beforeEach(() => {
    useAIKeyStore.getState().reset();
    jest.clearAllMocks();

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
      mockAIKeyManager.initialize.mockRejectedValue(new Error('Init failed'));
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      expect(result.current.error).toBe('Init failed');
    });
  });

  describe('addApiKey', () => {
    it('should add a new API key', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });
      expect(mockAIKeyManager.addApiKey).toHaveBeenCalledWith(
        testProvider,
        testApiKey,
        testEncryptionKey
      );
      expect(result.current.loading).toBe(false);
    });

    it('should handle add errors', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      mockAIKeyManager.addApiKey.mockRejectedValue(new Error('Add failed'));
      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });
      expect(result.current.error).toBe('Add failed');
      expect(result.current.loading).toBe(false);
    });

    it('should set error if not initialized', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.addApiKey(testProvider, testApiKey);
      });
      expect(result.current.error).toBe('Encryption key not set');
    });
  });

  describe('loadApiKeys', () => {
    it('should load API keys', async () => {
      const mockKeys = [
        {
          provider: testProvider,
          keyId: testKeyId,
          encryptedKey: 'encrypted_key',
          createdAt: '2026-02-17T12:00:00.000Z',
          lastUsed: '2026-02-17T12:00:00.000Z',
          isDefault: false,
        },
      ];
      mockAIKeyManager.getApiKeys.mockResolvedValue(mockKeys);

      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      expect(result.current.apiKeys).toEqual(mockKeys);
      expect(result.current.loading).toBe(false);
    });

    it('should handle load errors', async () => {
      mockAIKeyManager.getApiKeys.mockRejectedValue(new Error('Load failed'));
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      expect(result.current.error).toBe('Load failed');
    });
  });

  describe('deleteApiKey', () => {
    it('should delete an API key', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      await act(async () => {
        await result.current.deleteApiKey(testKeyId);
      });
      expect(mockAIKeyManager.deleteApiKey).toHaveBeenCalledWith(testKeyId);
    });

    it('should handle delete errors', async () => {
      mockAIKeyManager.deleteApiKey.mockRejectedValue(new Error('Delete failed'));
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      await act(async () => {
        await result.current.deleteApiKey(testKeyId);
      });
      expect(result.current.error).toBe('Delete failed');
    });
  });

  describe('setDefaultApiKey', () => {
    it('should set default API key', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      await act(async () => {
        await result.current.setDefaultApiKey(testKeyId);
      });
      expect(mockAIKeyManager.setDefaultApiKey).toHaveBeenCalledWith(testKeyId);
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
      expect(result.current.geminiFallbackEnabled).toBe(true);
      act(() => {
        result.current.setGeminiFallbackEnabled(false);
      });
      expect(result.current.geminiFallbackEnabled).toBe(false);
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

  describe('error handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useAIKeyStore());
      act(() => {
        result.current.setError('test error');
      });
      expect(result.current.error).toBe('test error');
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', async () => {
      const { result } = renderHook(() => useAIKeyStore());
      await act(async () => {
        await result.current.initialize(testEncryptionKey);
      });
      act(() => {
        result.current.setShowAddKeyDialog(true);
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.encryptionKey).toBeUndefined();
      expect(result.current.apiKeys).toEqual([]);
      expect(result.current.showAddKeyDialog).toBe(false);
      expect(result.current.error).toBeUndefined();
    });
  });
});
