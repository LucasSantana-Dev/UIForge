/**
 * Zustand store for AI key management and user preferences
 * Handles BYOK system state and UI interactions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AIProvider, AI_PROVIDERS } from '@/lib/encryption';
import { aiKeyManager, DecryptedApiKey, UsageStats } from '@/lib/ai-keys';

export interface AIKeyState {
  // User preferences
  encryptionKey?: string;
  defaultProvider?: AIProvider;
  geminiFallbackEnabled: boolean;
  usageTrackingEnabled: boolean;
  
  // API keys
  apiKeys: DecryptedApiKey[];
  loading: boolean;
  error?: string;
  
  // UI state
  showAddKeyDialog: boolean;
  selectedProvider?: AIProvider;
  editingKeyId?: string;
  
  // Usage stats
  usageStats?: UsageStats;
}

export interface AIKeyActions {
  // Initialization
  initialize: (encryptionKey: string) => Promise<void>;
  
  // API key management
  addApiKey: (provider: AIProvider, apiKey: string) => Promise<void>;
  updateApiKey: (keyId: string, apiKey: string) => Promise<void>;
  deleteApiKey: (keyId: string) => Promise<void>;
  setDefaultApiKey: (keyId: string) => Promise<void>;
  
  // UI actions
  setShowAddKeyDialog: (show: boolean) => void;
  setSelectedProvider: (provider: AIProvider) => void;
  setEditingKeyId: (keyId?: string) => void;
  
  // Preferences
  setDefaultProvider: (provider: AIProvider) => void;
  setGeminiFallbackEnabled: (enabled: boolean) => void;
  setUsageTrackingEnabled: (enabled: boolean) => void;
  
  // Data loading
  loadApiKeys: () => Promise<void>;
  loadUsageStats: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
  setError: (error: string) => void;
  
  // Reset
  reset: () => void;
}

export type AIKeyStore = AIKeyState & AIKeyActions;

export const useAIKeyStore = create<AIKeyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      encryptionKey: undefined,
      defaultProvider: undefined,
      geminiFallbackEnabled: true,
      usageTrackingEnabled: true,
      apiKeys: [],
      loading: false,
      error: undefined,
      showAddKeyDialog: false,
      selectedProvider: undefined,
      editingKeyId: undefined,
      usageStats: undefined,

      // Initialize the store with user's encryption key
      initialize: async (encryptionKey: string) => {
        set({ loading: true, error: undefined });
        
        try {
          await aiKeyManager.initialize(encryptionKey);
          set({ encryptionKey });
          await get().loadApiKeys();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to initialize AI key manager' });
        } finally {
          set({ loading: false });
        }
      },

      // Load API keys from storage
      loadApiKeys: async () => {
        const { encryptionKey } = get();
        if (!encryptionKey) return;

        set({ loading: true, error: undefined });
        
        try {
          const apiKeys = await aiKeyManager.getApiKeys(encryptionKey);
          set({ apiKeys });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load API keys' });
        } finally {
          set({ loading: false });
        }
      },

      // Add a new API key
      addApiKey: async (provider: AIProvider, apiKey: string) => {
        const { encryptionKey } = get();
        if (!encryptionKey) {
          set({ error: 'Encryption key not set' });
          return;
        }

        set({ loading: true, error: undefined });
        
        try {
          await aiKeyManager.addApiKey(provider, apiKey, encryptionKey);
          await get().loadApiKeys();
          set({ showAddKeyDialog: false, selectedProvider: undefined });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add API key' });
        } finally {
          set({ loading: false });
        }
      },

      // Update an existing API key
      updateApiKey: async (keyId: string, apiKey: string) => {
        const { encryptionKey } = get();
        if (!encryptionKey) {
          set({ error: 'Encryption key not set' });
          return;
        }

        set({ loading: true, error: undefined });
        
        try {
          await aiKeyManager.updateApiKey(keyId, apiKey, encryptionKey);
          await get().loadApiKeys();
          set({ editingKeyId: undefined });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update API key' });
        } finally {
          set({ loading: false });
        }
      },

      // Delete an API key
      deleteApiKey: async (keyId: string) => {
        set({ loading: true, error: undefined });
        
        try {
          await aiKeyManager.deleteApiKey(keyId);
          await get().loadApiKeys();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete API key' });
        } finally {
          set({ loading: false });
        }
      },

      // Set API key as default
      setDefaultApiKey: async (keyId: string) => {
        set({ loading: true, error: undefined });
        
        try {
          await aiKeyManager.setDefaultApiKey(keyId);
          await get().loadApiKeys();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to set default API key' });
        } finally {
          set({ loading: false });
        }
      },

      // Load usage statistics
      loadUsageStats: async () => {
        try {
          const stats = await aiKeyManager.getUsageStats();
          set({ usageStats: stats });
        } catch (error) {
          console.error('Failed to load usage stats:', error);
        }
      },

      // UI actions
      setShowAddKeyDialog: (show: boolean) => {
        set({ showAddKeyDialog: show });
        if (!show) {
          set({ selectedProvider: undefined, editingKeyId: undefined });
        }
      },

      setSelectedProvider: (provider: AIProvider) => {
        set({ selectedProvider: provider });
      },

      setEditingKeyId: (keyId?: string) => {
        set({ editingKeyId: keyId });
      },

      // Preferences
      setDefaultProvider: (provider: AIProvider) => {
        set({ defaultProvider: provider });
      },

      setGeminiFallbackEnabled: (enabled: boolean) => {
        set({ geminiFallbackEnabled: enabled });
      },

      setUsageTrackingEnabled: (enabled: boolean) => {
        set({ usageTrackingEnabled: enabled });
      },

      // Error handling
      clearError: () => {
        set({ error: undefined });
      },

      setError: (error: string) => {
        set({ error });
      },

      // Reset store
      reset: () => {
        set({
          encryptionKey: undefined,
          defaultProvider: undefined,
          geminiFallbackEnabled: true,
          usageTrackingEnabled: true,
          apiKeys: [],
          loading: false,
          error: undefined,
          showAddKeyDialog: false,
          selectedProvider: undefined,
          editingKeyId: undefined,
          usageStats: undefined,
        });
      },
    }),
    {
      name: 'ai-keys-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        encryptionKey: state.encryptionKey,
        defaultProvider: state.defaultProvider,
        geminiFallbackEnabled: state.geminiFallbackEnabled,
        usageTrackingEnabled: state.usageTrackingEnabled,
      }),
    }
  )
);

// Selectors for commonly used combinations
export const useAIKeys = () => useAIKeyStore((state) => state.apiKeys);
export const useDefaultProvider = () => useAIKeyStore((state) => state.defaultProvider);
export const useAIKeyLoading = () => useAIKeyStore((state) => state.loading);
export const useAIKeyError = () => useAIKeyStore((state) => state.error);
export const useAddKeyDialog = () => useAIKeyStore((state) => ({
  show: state.showAddKeyDialog,
  provider: state.selectedProvider,
  editingKeyId: state.editingKeyId,
}));

// Helper hooks
export const useApiKeyForProvider = (provider: AIProvider) => {
  const apiKeys = useAIKeys();
  return apiKeys.find(key => key.provider === provider && key.isDefault);
};

export const useHasApiKey = (provider?: AIProvider) => {
  const apiKeys = useAIKeys();
  if (provider) {
    return apiKeys.some(key => key.provider === provider);
  }
  return apiKeys.length > 0;
};

export const useProviderConfig = (provider: AIProvider) => {
  return AI_PROVIDERS[provider];
};

export const useAvailableProviders = () => {
  const apiKeys = useAIKeys();
  return Object.keys(AI_PROVIDERS) as AIProvider[];
};
