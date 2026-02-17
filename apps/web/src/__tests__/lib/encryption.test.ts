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

// Mock crypto-js for testing
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn((text: string, key: string) => ({
      toString: () => `encrypted_${text}_${key}`,
    })),
    decrypt: jest.fn((encrypted: string, key: string) => ({
      toString: jest.fn(() => {
        if (encrypted.startsWith('encrypted_')) {
          const parts = encrypted.split('_');
          return parts[1]; // Return original text
        }
        return 'decrypted_text';
      }),
    })),
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
}));

import CryptoJS from 'crypto-js';

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
      }).toThrow();
    });
  });

  describe('API Key Validation', () => {
    it('should validate OpenAI API keys', () => {
      const validKey = 'sk-1234567890abcdef1234567890abcdef12345678';
      const invalidKey = 'invalid-key';

      expect(validateApiKey(validKey, 'openai' as AIProvider)).toBe(true);
      expect(validateApiKey(invalidKey, 'openai' as AIProvider)).toBe(false);
    });

    it('should validate Anthropic API keys', () => {
      const validKey = 'sk-ant-api03-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const invalidKey = 'invalid-key';

      expect(validateApiKey(validKey, 'anthropic' as AIProvider)).toBe(true);
      expect(validateApiKey(invalidKey, 'anthropic' as AIProvider)).toBe(false);
    });

    it('should validate Google AI API keys', () => {
      const validKey = 'AIzaSy-1234567890abcdef-1234567890abcdef';
      const invalidKey = 'invalid-key';

      expect(validateApiKey(validKey, 'google' as AIProvider)).toBe(true);
      expect(validateApiKey(invalidKey, 'google' as AIProvider)).toBe(false);
    });

    it('should reject empty API keys', () => {
      expect(validateApiKey('', 'openai' as AIProvider)).toBe(false);
      expect(validateApiKey('', 'anthropic' as AIProvider)).toBe(false);
      expect(validateApiKey('', 'google' as AIProvider)).toBe(false);
    });
  });

  describe('API Key Hashing', () => {
    it('should hash API keys consistently', () => {
      const apiKey = TEST_CONFIG.API_KEYS.OPENAI;

      const hash1 = hashApiKey(apiKey);
      const hash2 = hashApiKey(apiKey);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(apiKey); // Should be different from original
    });

    it('should generate different hashes for different keys', () => {
      const key1 = 'sk-test-key-123456789';
      const key2 = 'sk-different-key-987654321';

      const hash1 = hashApiKey(key1);
      const hash2 = hashApiKey(key2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Key ID Generation', () => {
    it('should generate unique key IDs', () => {
      const id1 = generateKeyId();
      const id2 = generateKeyId();

      expect(id1).toMatch(/^key_/);
      expect(id2).toMatch(/^key_/);
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with consistent format', () => {
      const id = generateKeyId();

      expect(id).toMatch(/^key_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    });
  });

  describe('Encryption Key Derivation', () => {
    it('should derive encryption keys from passwords', () => {
      const password = TEST_CONFIG.USER.PASSWORD;
      const salt = 'random-salt-456';

      const derivedKey = deriveEncryptionKey(password, salt);

      expect(derivedKey).toBe(`derived_${password}_${salt}`);
    });

    it('should generate user encryption keys', () => {
      const userKey = generateUserEncryptionKey();

      expect(userKey).toBeDefined();
      expect(typeof userKey).toBe('string');
      expect(userKey.length).toBeGreaterThan(0);
    });
  });

  describe('API Provider Configuration', () => {
    it('should contain all supported providers', () => {
      expect(AI_PROVIDERS.openai).toBeDefined();
      expect(AI_PROVIDERS.anthropic).toBeDefined();
      expect(AI_PROVIDERS.google).toBeDefined();
    });

    it('should have correct provider configurations', () => {
      const openAIConfig = AI_PROVIDERS.openai;
      const anthropicConfig = AI_PROVIDERS.anthropic;
      const googleConfig = AI_PROVIDERS.google;

      expect(openAIConfig).toBeDefined();
      expect(anthropicConfig).toBeDefined();
      expect(googleConfig).toBeDefined();

      expect(openAIConfig.name).toBe('OpenAI');
      expect(anthropicConfig.name).toBe('Anthropic');
      expect(googleConfig.name).toBe('Google AI');
    });
  });

  describe('API Key Expiration', () => {
    it('should detect expired keys', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const expiredKey = {
        id: 'key-1',
        provider: 'openai' as AIProvider,
        keyName: 'Test Key',
        encryptedKey: 'encrypted-key',
        isActive: true,
        createdAt: pastDate.toISOString(),
        expiresAt: pastDate.toISOString(),
        keyId: 'key-id-1',
      };

      expect(isApiKeyExpired(expiredKey)).toBe(true);
    });

    it('should detect non-expired keys', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const validKey = {
        id: 'key-1',
        provider: 'openai' as AIProvider,
        keyName: 'Test Key',
        encryptedKey: 'encrypted-key',
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: futureDate.toISOString(),
        keyId: 'key-id-1',
      };

      expect(isApiKeyExpired(validKey)).toBe(false);
    });

    it('should handle keys without expiration', () => {
      const keyWithoutExpiration = {
        id: 'key-1',
        provider: 'openai' as AIProvider,
        keyName: 'Test Key',
        encryptedKey: 'encrypted-key',
        isActive: true,
        createdAt: new Date().toISOString(),
        keyId: 'key-id-1',
      };

      expect(isApiKeyExpired(keyWithoutExpiration)).toBe(false);
    });
  });

  describe('Security Best Practices', () => {
    it('should not store plain text API keys', () => {
      const apiKey = TEST_CONFIG.API_KEYS.OPENAI;
      const masterKey = 'master-key-secret';

      const encrypted = encryptApiKey(apiKey, masterKey);

      expect(encrypted).not.toBe(apiKey);
      expect(encrypted).not.toContain(apiKey);
    });

    it('should use different encryption for different providers', () => {
      const openAIKey = TEST_CONFIG.API_KEYS.OPENAI;
      const anthropicKey = TEST_CONFIG.API_KEYS.ANTHROPIC;
      const masterKey = 'master-key-secret';

      const encryptedOpenAI = encryptApiKey(openAIKey, masterKey);
      const encryptedAnthropic = encryptApiKey(anthropicKey, masterKey);

      expect(encryptedOpenAI).not.toBe(encryptedAnthropic);
    });

    it('should handle edge cases gracefully', () => {
      expect(() => {
        encryptApiKey(null as any, 'key');
      }).toThrow();

      expect(() => {
        decryptApiKey(null as any, 'key');
      }).toThrow();

      expect(() => {
        hashApiKey(null as any);
      }).toThrow();
    });
  });
});
