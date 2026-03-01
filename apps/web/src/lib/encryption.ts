import CryptoJS from 'crypto-js';

export interface EncryptedApiKey {
  provider: AIProvider;
  encryptedKey: string;
  keyId: string;
  createdAt: string;
  lastUsed?: string;
  isDefault?: boolean;
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'siza';

export interface AIProviderConfig {
  name: string;
  baseUrl: string;
  models: string[];
  maxTokens: number;
  rateLimitPerMinute: number;
  requiresOrganization?: boolean;
}

const KDF_ITERATIONS = 600000;

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
  siza: {
    name: 'Siza AI',
    baseUrl: '',
    models: [],
    maxTokens: 0,
    rateLimitPerMinute: 60,
  },
};

export function generateUserEncryptionKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function deriveEncryptionKey(userKey: string, salt: string = 'siza-salt'): string {
  return CryptoJS.PBKDF2(userKey, salt, {
    keySize: 256 / 32,
    iterations: KDF_ITERATIONS,
  }).toString();
}

export function encryptApiKey(apiKey: string, encryptionKey: string): string {
  if (apiKey === null || apiKey === undefined) throw new Error('API key is required');
  if (!apiKey) throw new Error('API key cannot be empty');
  const key = CryptoJS.PBKDF2(encryptionKey, 'siza-aes-salt', {
    keySize: 256 / 32,
    iterations: KDF_ITERATIONS,
  });
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(apiKey, key, { iv });
  return iv.toString() + ':' + encrypted.toString();
}

export function decryptApiKey(encryptedKey: string, encryptionKey: string): string {
  if (encryptedKey === null || encryptedKey === undefined)
    throw new Error('Encrypted key is required');
  try {
    if (encryptedKey.includes(':')) {
      const [ivHex, ciphertext] = encryptedKey.split(':');
      const key = CryptoJS.PBKDF2(encryptionKey, 'siza-aes-salt', {
        keySize: 256 / 32,
        iterations: KDF_ITERATIONS,
      });
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const bytes = CryptoJS.AES.decrypt(ciphertext, key, { iv });
      const result = bytes.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Failed to decrypt API key. Invalid encryption key.');
      return result;
    }
    const bytes = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error('Failed to decrypt API key. Invalid encryption key.');
    return result;
  } catch (e) {
    if (e instanceof Error && e.message.includes('decrypt')) throw e;
    throw new Error('Failed to decrypt API key. Invalid encryption key.');
  }
}

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

export function generateKeyId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `key_${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function hashApiKey(apiKey: string): string {
  if (apiKey === null || apiKey === undefined) throw new Error('API key is required for hashing');
  return CryptoJS.PBKDF2(apiKey, 'siza-key-hash', {
    keySize: 256 / 32,
    iterations: KDF_ITERATIONS,
  }).toString();
}

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

export function getApiKey(encryptedApiKey: EncryptedApiKey, encryptionKey: string): string {
  return decryptApiKey(encryptedApiKey.encryptedKey, encryptionKey);
}

export function isApiKeyExpired(
  encryptedApiKey: EncryptedApiKey & { expiresAt?: string }
): boolean {
  if (encryptedApiKey.expiresAt) {
    return new Date(encryptedApiKey.expiresAt) < new Date();
  }
  const createdAt = new Date(encryptedApiKey.createdAt);
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation > 90;
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.replace(/sk-[a-zA-Z0-9]+/g, 'sk-***');
  }
  return 'An unknown error occurred';
}

export function generateSessionKey(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
