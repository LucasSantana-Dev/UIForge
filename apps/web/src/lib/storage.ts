/**
 * IndexedDB storage for encrypted API keys and user preferences
 * Secure client-side storage for BYOK system
 */

import { EncryptedApiKey, AIProvider } from './encryption';

const DB_NAME = 'SizaKeys';
const DB_VERSION = 1;
const STORE_NAME = 'api_keys';
const USER_STORE_NAME = 'user_preferences';

interface UserPreferences {
  encryptionKey?: string;
  defaultProvider?: AIProvider;
  geminiFallbackEnabled: boolean;
  usageTrackingEnabled: boolean;
}

class IndexedDBStorage {
  db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error || new Error('Failed to open IndexedDB'));
      };
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'keyId' });
        }
        if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
          db.createObjectStore(USER_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async storeApiKey(apiKey: EncryptedApiKey): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(apiKey);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store API key'));
    });
  }

  async getApiKeys(): Promise<EncryptedApiKey[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as EncryptedApiKey[]);
      request.onerror = () => reject(new Error('Failed to retrieve API keys'));
    });
  }

  async getApiKey(keyId: string): Promise<EncryptedApiKey | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(keyId);
      request.onsuccess = () => resolve((request.result as EncryptedApiKey) ?? null);
      request.onerror = () => reject(new Error('Failed to retrieve API key'));
    });
  }

  async getDefaultApiKey(provider: AIProvider): Promise<EncryptedApiKey | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const keys = request.result as EncryptedApiKey[];
        const found = keys.find((k) => k.provider === provider && k.isDefault) ?? null;
        resolve(found);
      };
      request.onerror = () => reject(new Error('Failed to retrieve default API key'));
    });
  }

  async updateApiKeyUsage(keyId: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(keyId);
      getRequest.onsuccess = () => {
        const record = getRequest.result as EncryptedApiKey | undefined;
        if (record) {
          const updated = { ...record, lastUsed: new Date().toISOString() };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Failed to update API key usage'));
        } else {
          reject(new Error('API key not found'));
        }
      };
      getRequest.onerror = () => reject(new Error('Failed to find API key'));
    });
  }

  async deleteApiKey(keyId: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(keyId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete API key'));
    });
  }

  async setUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([USER_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(USER_STORE_NAME);
      const request = store.put(preferences, 'user_prefs');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store user preferences'));
    });
  }

  async getUserPreferences(): Promise<UserPreferences> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([USER_STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_STORE_NAME);
      const request = store.get('user_prefs');
      request.onsuccess = () => {
        const record = request.result as UserPreferences | undefined;
        if (record) {
          resolve(record);
        } else {
          resolve({
            encryptionKey: '',
            defaultProvider: 'google',
            geminiFallbackEnabled: true,
            usageTrackingEnabled: true,
          });
        }
      };
      request.onerror = () => reject(new Error('Failed to retrieve user preferences'));
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME, USER_STORE_NAME], 'readwrite');
      let completed = 0;
      const onSuccess = () => {
        if (++completed === 2) resolve();
      };
      transaction.objectStore(STORE_NAME).clear().onsuccess = onSuccess;
      transaction.objectStore(USER_STORE_NAME).clear().onsuccess = onSuccess;
      transaction.onerror = () => reject(new Error('Failed to clear data'));
    });
  }

  async getStorageStats(): Promise<{ apiKeysCount: number; totalSize: string }> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result as EncryptedApiKey[];
        const apiKeysCount = records.length;
        if (apiKeysCount === 0) {
          resolve({ apiKeysCount: 0, totalSize: '0 B' });
          return;
        }
        const bytes = new Blob([JSON.stringify(records)]).size;
        const formattedSize =
          bytes < 1024
            ? `${bytes} B`
            : bytes < 1024 * 1024
              ? `${(bytes / 1024).toFixed(2)} KB`
              : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        resolve({ apiKeysCount, totalSize: formattedSize });
      };
      request.onerror = () => reject(new Error('Failed to get storage stats'));
    });
  }
}

export const storage = new IndexedDBStorage();
