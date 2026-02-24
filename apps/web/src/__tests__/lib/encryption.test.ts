/**
 * Encryption Utilities Tests
 * Tests for AES-256 encryption, key validation, and BYOK security functions
 */

import {
  encryptApiKey,
  decryptApiKey,
  validateApiKey,
  hashApiKey,
  generateKeyId,
  deriveEncryptionKey,
  generateUserEncryptionKey,
  AI_PROVIDERS,
  isApiKeyExpired,
} from '@/lib/encryption';
import { AIProvider } from '@/lib/encryption';
import { TEST_CONFIG } from '../../../test-config';

// Mock crypto-js for testing with improved key validation
jest.mock('crypto-js', () => {
  const keyStorage = new Map<string, string>();

  return {
    AES: {
      encrypt: jest.fn((text: string, key: string) => {
        const encrypted = `encrypted_${text}_${key}`;
        keyStorage.set(encrypted, key);
        return { toString: () => encrypted };
      }),
      decrypt: jest.fn((encrypted: string, key: string) => ({
        toString: jest.fn((_enc: any) => {
          // Check if the key matches the one used for encryption
          const originalKey = keyStorage.get(encrypted);
          if (originalKey && originalKey !== key) {
            // Wrong key - return empty string to trigger error
            return '';
          }
          if (encrypted.startsWith('encrypted_')) {
            // Extract the original text from the encrypted string
            const parts = encrypted.substring('encrypted_'.length).split('_');
            // Remove the last part which is the key
            parts.pop();
            return parts.join('_');
          }
          return '';
        }),
      })),
    },
    enc: {
      Utf8: 'utf8',
    },
    PBKDF2: jest.fn((password: string, salt: string) => ({
      toString: () => `derived_${password}_${salt}`,
    })),
    SHA256: jest.fn((text: string) => ({
      toString: () => `hashed_${text}`,
    })),
    lib: {
      WordArray: {
        random: jest.fn(() => ({
          toString: jest.fn(() => 'random_bytes'),
        })),
      },
    },
  };
});

describe('Encryption Utilities', () => {
  describe('API Key Encryption/Decryption', () => {
    it('should encrypt and decrypt API keys correctly', () => {
      const apiKey = TEST_CONFIG.API_KEYS.OPENAI;
      const masterKey = 'master-key-secret';

      const encrypted = encryptApiKey(apiKey, masterKey);
      const decrypted = decryptApiKey(encrypted, masterKey);

      expect(decrypted).toBe(apiKey);
    });

    it('should fail decryption with wrong key', () => {
      const apiKey = TEST_CONFIG.API_KEYS.OPENAI;
      const masterKey = 'master-key-secret';
      const wrongKey = 'wrong-key';

      const encrypted = encryptApiKey(apiKey, masterKey);

      expect(() => {
        decryptApiKey(encrypted, wrongKey);
      }).toThrow();
    });

    it('should handle empty API keys', () => {
      const apiKey = '';
      const masterKey = 'master-key-secret';

      expect(() => {
        encryptApiKey(apiKey, masterKey);
      }).toThrow('API key cannot be empty');
    });

    it('should handle null API keys', () => {
      const masterKey = 'master-key-secret';

      expect(() => {
        encryptApiKey(null as any, masterKey);
      }).toThrow('API key is required');
    });
  });

  describe('Key Derivation', () => {
    it('should derive encryption key from user key', () => {
      const userKey = 'user-passphrase-123';
      const derivedKey = deriveEncryptionKey(userKey);

      expect(derivedKey).toBeTruthy();
      expect(typeof derivedKey).toBe('string');
    });

    it('should produce different keys for different inputs', () => {
      const key1 = deriveEncryptionKey('password1');
      const key2 = deriveEncryptionKey('password2');

      expect(key1).not.toBe(key2);
    });

    it('should use custom salt when provided', () => {
      const userKey = 'user-key';
      const salt1 = 'salt1';
      const salt2 = 'salt2';

      const derived1 = deriveEncryptionKey(userKey, salt1);
      const derived2 = deriveEncryptionKey(userKey, salt2);

      expect(derived1).not.toBe(derived2);
    });
  });

  describe('User Encryption Key Generation', () => {
    it('should generate random encryption key', () => {
      const key = generateUserEncryptionKey();

      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should generate different keys on multiple calls', () => {
      const key1 = generateUserEncryptionKey();
      const key2 = generateUserEncryptionKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('API Key Validation', () => {
    it('should validate OpenAI API keys', () => {
      expect(validateApiKey('sk-1234567890abcdefghij', 'openai')).toBe(true);
      expect(validateApiKey('invalid-key', 'openai')).toBe(false);
      expect(validateApiKey('sk-123', 'openai')).toBe(false); // too short
    });

    it('should validate Anthropic API keys', () => {
      expect(validateApiKey('sk-ant-1234567890abcdefghij', 'anthropic')).toBe(true);
      expect(validateApiKey('sk-1234567890abcdefghij', 'anthropic')).toBe(false);
      expect(validateApiKey('sk-ant-123', 'anthropic')).toBe(false); // too short
    });

    it('should validate Google API keys', () => {
      expect(validateApiKey('AIzaSyD1234567890abcdefghij', 'google')).toBe(true);
      expect(validateApiKey('short-key', 'google')).toBe(false);
      expect(validateApiKey('key with spaces', 'google')).toBe(false);
    });

    it('should trim whitespace from keys', () => {
      expect(validateApiKey(' sk-1234567890abcdefghij ', 'openai')).toBe(true);
    });
  });

  describe('Key ID Generation', () => {
    it('should generate unique key IDs', () => {
      const id1 = generateKeyId();
      const id2 = generateKeyId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('API Key Hashing', () => {
    it('should hash API keys', () => {
      const apiKey = TEST_CONFIG.API_KEYS.OPENAI;
      const hash = hashApiKey(apiKey);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashApiKey('key1');
      const hash2 = hashApiKey('key2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('AI Provider Configuration', () => {
    it('should have configurations for all providers', () => {
      expect(AI_PROVIDERS.openai).toBeDefined();
      expect(AI_PROVIDERS.anthropic).toBeDefined();
      expect(AI_PROVIDERS.google).toBeDefined();
    });

    it('should have required fields in each config', () => {
      Object.values(AI_PROVIDERS).forEach((config) => {
        expect(config.name).toBeTruthy();
        expect(config.baseUrl).toBeTruthy();
        expect(config.models).toBeInstanceOf(Array);
        expect(config.maxTokens).toBeGreaterThan(0);
        expect(config.rateLimitPerMinute).toBeGreaterThan(0);
      });
    });

    it('should have valid model lists', () => {
      Object.values(AI_PROVIDERS).forEach((config) => {
        expect(config.models.length).toBeGreaterThan(0);
        config.models.forEach((model) => {
          expect(typeof model).toBe('string');
          expect(model.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('API Key Expiration', () => {
    it('should detect expired keys', () => {
      const pastDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days ago
      const encryptedKey: any = {
        provider: 'openai' as AIProvider,
        encryptedKey: 'encrypted_test',
        keyId: 'key-123',
        createdAt: pastDate.toISOString(),
      };
      expect(isApiKeyExpired(encryptedKey)).toBe(true);
    });

    it('should detect non-expired keys', () => {
      const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const encryptedKey: any = {
        provider: 'openai' as AIProvider,
        encryptedKey: 'encrypted_test',
        keyId: 'key-123',
        createdAt: recentDate.toISOString(),
      };
      expect(isApiKeyExpired(encryptedKey)).toBe(false);
    });

    it('should handle keys with explicit expiration date', () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const encryptedKey: any = {
        provider: 'openai' as AIProvider,
        encryptedKey: 'encrypted_test',
        keyId: 'key-123',
        createdAt: new Date().toISOString(),
        expiresAt: futureDate.toISOString(),
      };
      expect(isApiKeyExpired(encryptedKey)).toBe(false);
    });

    it('should detect expired keys with explicit expiration date', () => {
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const encryptedKey: any = {
        provider: 'openai' as AIProvider,
        encryptedKey: 'encrypted_test',
        keyId: 'key-123',
        createdAt: new Date().toISOString(),
        expiresAt: pastDate.toISOString(),
      };
      expect(isApiKeyExpired(encryptedKey)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined encrypted key', () => {
      expect(() => {
        decryptApiKey(undefined as any, 'key');
      }).toThrow('Encrypted key is required');
    });

    it('should handle null encrypted key', () => {
      expect(() => {
        decryptApiKey(null as any, 'key');
      }).toThrow('Encrypted key is required');
    });

    it('should handle special characters in API keys', () => {
      const specialKey = 'sk-test_key!@#$%^&*()';
      const masterKey = 'master-key';

      const encrypted = encryptApiKey(specialKey, masterKey);
      const decrypted = decryptApiKey(encrypted, masterKey);

      expect(decrypted).toBe(specialKey);
    });
  });
});
