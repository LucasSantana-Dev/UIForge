import { act, renderHook } from '@testing-library/react';
import { useAIKeyStore } from '@/stores/ai-keys';
import { aiKeyManager } from '@/lib/ai-keys';
import { AIProvider } from '@/lib/encryption';
import { TEST_CONFIG } from '../../../test-config';

jest.mock('@/lib/ai-keys');
const mockManager = aiKeyManager as jest.Mocked<typeof aiKeyManager>;

describe('AI Keys Store', () => {
  const key = TEST_CONFIG.API_KEYS.OPENAI;
  const provider: AIProvider = 'openai';
  const encKey = TEST_CONFIG.ENCRYPTION.TEST_KEY;

  beforeEach(() => {
    useAIKeyStore.getState().reset();
    jest.clearAllMocks();
    mockManager.initialize.mockResolvedValue(undefined);
    mockManager.addApiKey.mockResolvedValue(undefined);
    mockManager.getApiKeys.mockResolvedValue([]);
    mockManager.deleteApiKey.mockResolvedValue(undefined);
    mockManager.setDefaultApiKey.mockResolvedValue(undefined);
    mockManager.getUsageStats.mockResolvedValue({
      totalKeys: 0,
      keysByProvider: { openai: 0, anthropic: 0, google: 0 },
      lastUsedTimes: {},
      expiredKeys: [],
    });
  });

  it('should have default state', () => {
    const { result } = renderHook(() => useAIKeyStore());
    expect(result.current.apiKeys).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should initialize with encryption key', async () => {
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.initialize(encKey); });
    expect(mockManager.initialize).toHaveBeenCalledWith(encKey);
    expect(result.current.encryptionKey).toBe(encKey);
  });

  it('should handle init error', async () => {
    mockManager.initialize.mockRejectedValue(new Error('Init failed'));
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.initialize(encKey); });
    expect(result.current.error).toBe('Init failed');
  });

  it('should add API key', async () => {
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.initialize(encKey); });
    await act(async () => { await result.current.addApiKey(provider, key); });
    expect(mockManager.addApiKey).toHaveBeenCalledWith(provider, key, encKey);
  });

  it('should set error when adding without init', async () => {
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.addApiKey(provider, key); });
    expect(result.current.error).toBe('Encryption key not set');
  });

  it('should load API keys on init', async () => {
    const mockKeys = [{ provider, keyId: 'k1', encryptedKey: 'e', createdAt: '2026-01-01', isDefault: false }];
    mockManager.getApiKeys.mockResolvedValue(mockKeys);
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.initialize(encKey); });
    expect(result.current.apiKeys).toEqual(mockKeys);
  });

  it('should delete API key', async () => {
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.initialize(encKey); });
    await act(async () => { await result.current.deleteApiKey('k1'); });
    expect(mockManager.deleteApiKey).toHaveBeenCalledWith('k1');
  });

  it('should set default API key', async () => {
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.initialize(encKey); });
    await act(async () => { await result.current.setDefaultApiKey('k1'); });
    expect(mockManager.setDefaultApiKey).toHaveBeenCalledWith('k1');
  });

  it('should manage dialog state', () => {
    const { result } = renderHook(() => useAIKeyStore());
    expect(result.current.showAddKeyDialog).toBe(false);
    act(() => { result.current.setShowAddKeyDialog(true); });
    expect(result.current.showAddKeyDialog).toBe(true);
  });

  it('should set provider and editing key', () => {
    const { result } = renderHook(() => useAIKeyStore());
    act(() => { result.current.setSelectedProvider('anthropic'); });
    expect(result.current.selectedProvider).toBe('anthropic');
    act(() => { result.current.setEditingKeyId('k1'); });
    expect(result.current.editingKeyId).toBe('k1');
  });

  it('should manage preferences', () => {
    const { result } = renderHook(() => useAIKeyStore());
    act(() => { result.current.setDefaultProvider('anthropic'); });
    expect(result.current.defaultProvider).toBe('anthropic');
    expect(result.current.geminiFallbackEnabled).toBe(true);
    act(() => { result.current.setGeminiFallbackEnabled(false); });
    expect(result.current.geminiFallbackEnabled).toBe(false);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useAIKeyStore());
    act(() => { result.current.setError('err'); });
    expect(result.current.error).toBe('err');
    act(() => { result.current.clearError(); });
    expect(result.current.error).toBeUndefined();
  });

  it('should reset state', async () => {
    const { result } = renderHook(() => useAIKeyStore());
    await act(async () => { await result.current.initialize(encKey); });
    act(() => { result.current.reset(); });
    expect(result.current.encryptionKey).toBeUndefined();
    expect(result.current.apiKeys).toEqual([]);
  });
});
