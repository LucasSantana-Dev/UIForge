/**
 * IndexedDB storage for encrypted API keys and user preferences
 * Secure client-side storage for BYOK system
 */

import { EncryptedApiKey, AIProvider } from './encryption';

const DB_NAME = 'uiforge_storage';
const DB_VERSION = 1;
const STORE_NAME = 'api_keys';
const USER_STORE_NAME = 'user_preferences';

interface ApiKeyRecord {
  id: string;
  provider: AIProvider;
  encryptedKey: string;
  keyId: string;
  createdAt: string;
  lastUsed?: string;
  isDefault?: boolean;
}

interface UserPreferences {
  encryptionKey?: string;
  defaultProvider?: AIProvider;
  geminiFallbackEnabled: boolean;
  usageTrackingEnabled: boolean;
  lastLoginAt?: string;
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create API keys store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const apiKeyStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          apiKeyStore.createIndex('provider', 'provider', { unique: false });
          apiKeyStore.createIndex('keyId', 'keyId', { unique: true });
          apiKeyStore.createIndex('isDefault', 'isDefault', { unique: false });
        }

        // Create user preferences store
        if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
          db.createObjectStore(USER_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Store encrypted API key
   */
  async storeApiKey(apiKey: EncryptedApiKey, isDefault: boolean = false): Promise<void> {
    if (!this.db) await this.init();

    const record: ApiKeyRecord = {
      id: `api_key_${apiKey.keyId}`,
      provider: apiKey.provider,
      encryptedKey: apiKey.encryptedKey,
      keyId: apiKey.keyId,
      createdAt: apiKey.createdAt,
      lastUsed: apiKey.lastUsed,
      isDefault,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // If this is the default key, unset other defaults for the same provider
      if (isDefault) {
        const index = store.index('provider');
        const getRequest = index.openCursor(IDBKeyRange.bound(apiKey.provider, apiKey.provider));
        
        getRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const updateRecord = { ...cursor.value, isDefault: false };
            const updateRequest = cursor.update(updateRecord);
            updateRequest.onsuccess = () => cursor.continue();
          }
        };
      }

      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store API key'));
    });
  }

  /**
   * Get all stored API keys
   */
  async getApiKeys(): Promise<EncryptedApiKey[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result as ApiKeyRecord[];
        const apiKeys = records.map(record => ({
          provider: record.provider,
          encryptedKey: record.encryptedKey,
          keyId: record.keyId,
          createdAt: record.createdAt,
          lastUsed: record.lastUsed,
        }));
        resolve(apiKeys);
      };

      request.onerror = () => reject(new Error('Failed to retrieve API keys'));
    });
  }

  /**
   * Get API key by key ID
   */
  async getApiKey(keyId: string): Promise<EncryptedApiKey | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('keyId');
      const request = index.get(keyId);

      request.onsuccess = () => {
        const record = request.result as ApiKeyRecord | undefined;
        if (record) {
          resolve({
            provider: record.provider,
            encryptedKey: record.encryptedKey,
            keyId: record.keyId,
            createdAt: record.createdAt,
            lastUsed: record.lastUsed,
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to retrieve API key'));
    });
  }

  /**
   * Get default API key for a provider
   */
  async getDefaultApiKey(provider: AIProvider): Promise<EncryptedApiKey | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('provider');
      const request = index.openCursor(IDBKeyRange.bound(provider, provider));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && cursor.value.isDefault) {
          const record = cursor.value as ApiKeyRecord;
          resolve({
            provider: record.provider,
            encryptedKey: record.encryptedKey,
            keyId: record.keyId,
            createdAt: record.createdAt,
            lastUsed: record.lastUsed,
          });
        } else if (cursor) {
          cursor.continue();
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to retrieve default API key'));
    });
  }

  /**
   * Update API key usage
   */
  async updateApiKeyUsage(keyId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('keyId');
      const getRequest = index.get(keyId);

      getRequest.onsuccess = (event) => {
        const record = (event.target as IDBRequest).result as ApiKeyRecord | undefined;
        if (record) {
          const updateRecord = {
            ...record,
            lastUsed: new Date().toISOString(),
          };
          const updateRequest = store.put(updateRecord);
          
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(new Error('Failed to update API key usage'));
        } else {
          reject(new Error('API key not found'));
        }
      };

      getRequest.onerror = () => reject(new Error('Failed to find API key'));
    });
  }

  /**
   * Delete API key
   */
  async deleteApiKey(keyId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('keyId');
      const getRequest = index.get(keyId);

      getRequest.onsuccess = (event) => {
        const record = (event.target as IDBRequest).result as ApiKeyRecord | undefined;
        if (record) {
          const deleteRequest = store.delete(record.id);
          
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(new Error('Failed to delete API key'));
        } else {
          reject(new Error('API key not found'));
        }
      };

      getRequest.onerror = () => reject(new Error('Failed to find API key'));
    });
  }

  /**
   * Store user preferences
   */
  async setUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([USER_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(USER_STORE_NAME);
      
      const record = {
        id: 'user_preferences',
        ...preferences,
      };

      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store user preferences'));
    });
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([USER_STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_STORE_NAME);
      const request = store.get('user_preferences');

      request.onsuccess = () => {
        const record = request.result as UserPreferences | undefined;
        resolve({
          geminiFallbackEnabled: true,
          usageTrackingEnabled: true,
          ...record,
        });
      };

      request.onerror = () => reject(new Error('Failed to retrieve user preferences'));
    });
  }

  /**
   * Clear all stored data (for logout)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME, USER_STORE_NAME], 'readwrite');
      
      let completed = 0;
      const total = 2;

      transaction.objectStore(STORE_NAME).clear().onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };

      transaction.objectStore(USER_STORE_NAME).clear().onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };

      transaction.onerror = () => reject(new Error('Failed to clear data'));
    });
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{ apiKeysCount: number; totalSize: string }> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result as ApiKeyRecord[];
        const apiKeysCount = records.length;
        
        // Estimate size (rough calculation)
        const totalSize = new Blob([JSON.stringify(records)]).size;
        const formattedSize = totalSize < 1024 
          ? `${totalSize} B`
          : totalSize < 1024 * 1024
          ? `${(totalSize / 1024).toFixed(2)} KB`
          : `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;

        resolve({ apiKeysCount, totalSize: formattedSize });
      };

      request.onerror = () => reject(new Error('Failed to get storage stats'));
    });
  }
}

// Export singleton instance
export const storage = new IndexedDBStorage();
