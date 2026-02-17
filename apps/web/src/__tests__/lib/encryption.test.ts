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
      }),
    },
  },
}));

import CryptoJS from 'crypto-js';

describe('Encryption Utilities', () => {
  const testApiKey = 'sk-test123456789';
  const testEncryptionKey = 'test-encryption-key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encryptApiKey', () => {
    it('should encrypt API key with AES-256', () => {
      const encrypted = encryptApiKey(testApiKey, testEncryptionKey);

      expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith(testApiKey, testEncryptionKey);
      expect(encrypted).toBe('encrypted_sk-test123456789_test-encryption-key');
    });

    it('should handle empty API key', () => {
      const encrypted = encryptApiKey('', testEncryptionKey);
      expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith('', testEncryptionKey);
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt encrypted API key', () => {
      const encrypted = 'encrypted_sk-test123456789_test-encryption-key';
      const decrypted = decryptApiKey(encrypted, testEncryptionKey);

      expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(encrypted, testEncryptionKey);
      expect(decrypted).toBe('sk-test123456789');
    });

    it('should handle decryption failure', () => {
      (CryptoJS.AES.decrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      expect(() => decryptApiKey('invalid_encrypted', testEncryptionKey)).toThrow();
    });
  });

  describe('validateApiKey', () => {
    it('should validate OpenAI API key format', () => {
      const validOpenAIKey = 'sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890';
      expect(validateApiKey('openai', validOpenAIKey)).toBe(true);
    });

    it('should reject invalid OpenAI API key', () => {
      const invalidKey = 'invalid-key';
      expect(validateApiKey('openai', invalidKey)).toBe(false);
    });

    it('should validate Anthropic API key format', () => {
      const validAnthropicKey = 'sk-ant-api0314159265358979323846264338327950288';
      expect(validateApiKey('anthropic', validAnthropicKey)).toBe(true);
    });

    it('should validate Google AI API key format', () => {
      const validGoogleKey = 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567890';
      expect(validateApiKey('google', validGoogleKey)).toBe(true);
    });

    it('should reject invalid provider', () => {
      expect(() => validateApiKey('invalid' as any, 'key')).toThrow();
    });
  });

  describe('hashApiKey', () => {
    it('should hash API key consistently', () => {
      const hash1 = hashApiKey(testApiKey);
      const hash2 = hashApiKey(testApiKey);

      expect(CryptoJS.SHA256).toHaveBeenCalledWith(testApiKey);
      expect(hash1).toBe(hash2);
      expect(hash1).toBe('hashed_sk-test123456789');
    });

    it('should generate different hashes for different keys', () => {
      const hash1 = hashApiKey('key1');
      const hash2 = hashApiKey('key2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateKeyId', () => {
    it('should generate unique key IDs', () => {
      const id1 = generateKeyId();
      const id2 = generateKeyId();

      expect(id1).toMatch(/^key_/);
      expect(id2).toMatch(/^key_/);
      expect(id1).not.toBe(id2);
    });

    it('should include timestamp in key ID', () => {
      const id = generateKeyId();
      const timestamp = Date.now().toString();

      expect(id).toContain(timestamp);
    });
  });

  describe('deriveEncryptionKey', () => {
    it('should derive encryption key from user key', () => {
      const derived = deriveEncryptionKey(testEncryptionKey);

      expect(CryptoJS.PBKDF2).toHaveBeenCalledWith(testEncryptionKey, 'uiforge-salt', {
        keySize: 256 / 8,
        iterations: 10000,
      });
      expect(derived).toBe('derived_test-encryption-key_uiforge-salt');
    });
  });

  describe('generateUserEncryptionKey', () => {
    it('should generate random encryption key', () => {
      const key = generateUserEncryptionKey();

      expect(CryptoJS.lib.WordArray.random).toHaveBeenCalledWith(256 / 8);
      expect(key).toBe('random_bytes');
    });
  });

  describe('isApiKeyExpired', () => {
    it('should identify non-expired keys', () => {
      const now = Date.now();
      const recentDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
      const encryptedKey = {
        provider: 'openai' as const,
        encryptedKey: 'encrypted_key',
        keyId: 'key_123',
        createdAt: recentDate,
      };
      expect(isApiKeyExpired(encryptedKey)).toBe(false);
    });

    it('should identify expired keys', () => {
      const now = Date.now();
      const oldDate = new Date(now - 100 * 24 * 60 * 60 * 1000).toISOString(); // 100 days ago
      const encryptedKey = {
        provider: 'openai' as const,
        encryptedKey: 'encrypted_key',
        keyId: 'key_123',
        createdAt: oldDate,
      };
      expect(isApiKeyExpired(encryptedKey)).toBe(true);
    });

    it('should handle edge cases', () => {
      const encryptedKey = {
        provider: 'openai' as const,
        encryptedKey: 'encrypted_key',
        keyId: 'key_123',
        createdAt: 'invalid-date',
      };
      expect(isApiKeyExpired(encryptedKey)).toBe(true);
    });
  });

  describe('AI Providers Configuration', () => {
    it('should have correct OpenAI configuration', () => {
      const openai = AI_PROVIDERS.openai;

      expect(openai.name).toBe('OpenAI');
      expect(openai.models).toContain('gpt-4');
      expect(openai.models).toContain('gpt-4-turbo');
      expect(openai.models).toContain('gpt-3.5-turbo');
      expect(openai.rateLimitPerMinute).toBe(3500);
      expect(openai.maxTokens).toBe(128000);
      expect(openai.requiresOrganization).toBe(true);
    });

    it('should have correct Anthropic configuration', () => {
      const anthropic = AI_PROVIDERS.anthropic;

      expect(anthropic.name).toBe('Anthropic');
      expect(anthropic.models).toContain('claude-3.5-sonnet');
      expect(anthropic.models).toContain('claude-3-haiku');
      expect(anthropic.models).toContain('claude-3-opus');
      expect(anthropic.rateLimitPerMinute).toBe(1000);
      expect(anthropic.maxTokens).toBe(200000);
      expect(anthropic.requiresOrganization).toBe(false);
    });

    it('should have correct Google AI configuration', () => {
      const google = AI_PROVIDERS.google;

      expect(google.name).toBe('Google AI');
      expect(google.models).toContain('gemini-1.5-pro');
      expect(google.models).toContain('gemini-1.5-flash');
      expect(google.rateLimitPerMinute).toBe(60);
      expect(google.maxTokens).toBe(2097152);
      expect(google.requiresOrganization).toBe(false);
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle empty encryption key', () => {
      expect(() => encryptApiKey(testApiKey, '')).not.toThrow();
      expect(() => decryptApiKey('encrypted', '')).not.toThrow();
    });

    it('should handle null/undefined values gracefully', () => {
      expect(() => validateApiKey('openai', null as any)).toBe(false);
      expect(() => validateApiKey('openai', undefined as any)).toBe(false);
      expect(() => hashApiKey(null as any)).toBe('');
      expect(() => hashApiKey(undefined as any)).toBe('');
    });

    it('should handle very long API keys', () => {
      const longKey = 'sk-' + 'a'.repeat(100);
      expect(() => encryptApiKey(longKey, testEncryptionKey)).not.toThrow();
    });
  });
});
