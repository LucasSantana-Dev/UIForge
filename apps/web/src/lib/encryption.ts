/**
 * Client-side encryption utilities for BYOK (Bring Your Own Key) system
 * Uses AES-256 encryption for secure API key storage
 */

import CryptoJS from 'crypto-js';

export interface EncryptedApiKey {
  provider: AIProvider;
  encryptedKey: string;
  keyId: string;
  createdAt: string;
  lastUsed?: string;
  isDefault?: boolean;
}

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIProviderConfig {
  name: string;
  baseUrl: string;
  models: string[];
  maxTokens: number;
  rateLimitPerMinute: number;
  requiresOrganization?: boolean;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    maxTokens: 128000,
    rateLimitPerMinute: 3500,
    requiresOrganization: true,
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    maxTokens: 200000,
    rateLimitPerMinute: 1000,
  },
  google: {
    name: 'Google AI',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'],
    maxTokens: 2097152,
    rateLimitPerMinute: 60,
  },
};

/**
 * Generate a unique encryption key for the user
 */
export function generateUserEncryptionKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive encryption key from user's master key
 */
export function deriveEncryptionKey(userKey: string, salt: string = 'uiforge-salt'): string {
  return CryptoJS.PBKDF2(userKey, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
}

/**
 * Encrypt API key with user's encryption key
 */
export function encryptApiKey(apiKey: string, encryptionKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, encryptionKey).toString();
}

/**
 * Decrypt API key with user's encryption key
 */
export function decryptApiKey(encryptedKey: string, encryptionKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    throw new Error('Failed to decrypt API key. Invalid encryption key.');
  }
}

/**
 * Validate API key format for specific provider
 */
export function validateApiKey(apiKey: string, provider: AIProvider): boolean {
  const trimmedKey = apiKey.trim();

  switch (provider) {
    case 'openai':
      return trimmedKey.startsWith('sk-') && trimmedKey.length >= 20;
    case 'anthropic':
      return trimmedKey.startsWith('sk-ant-') && trimmedKey.length >= 20;
    case 'google':
      return trimmedKey.length >= 20 && !trimmedKey.includes(' ');
    default:
      return false;
  }
}

/**
 * Generate a unique key ID
 */
export function generateKeyId(): string {
  return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hash API key for server-side validation (without storing the actual key)
 */
export function hashApiKey(apiKey: string): string {
  return CryptoJS.SHA256(apiKey).toString();
}

/**
 * Create encrypted API key object
 */
export function createEncryptedApiKey(
  provider: AIProvider,
  apiKey: string,
  encryptionKey: string
): EncryptedApiKey {
  if (!validateApiKey(apiKey, provider)) {
    throw new Error(`Invalid API key format for ${AI_PROVIDERS[provider].name}`);
  }

  return {
    provider,
    encryptedKey: encryptApiKey(apiKey, encryptionKey),
    keyId: generateKeyId(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Decrypt and return API key
 */
export function getApiKey(
  encryptedApiKey: EncryptedApiKey,
  encryptionKey: string
): string {
  return decryptApiKey(encryptedApiKey.encryptedKey, encryptionKey);
}

/**
 * Check if API key is expired or needs refresh
 */
export function isApiKeyExpired(encryptedApiKey: EncryptedApiKey): boolean {
  const createdAt = new Date(encryptedApiKey.createdAt);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  // API keys older than 90 days should be refreshed
  return daysSinceCreation > 90;
}

/**
 * Sanitize error messages to avoid exposing sensitive information
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Remove any potential API keys from error messages
    return error.message.replace(/sk-[a-zA-Z0-9]+/g, 'sk-***');
  }
  return 'An unknown error occurred';
}

/**
 * Generate a secure random string for session keys
 */
export function generateSessionKey(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
