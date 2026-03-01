/**
 * AI Key Management Service
 * Handles BYOK system with client-side encryption and provider management
 */

import {
  AIProvider,
  AI_PROVIDERS,
  EncryptedApiKey,
  createEncryptedApiKey,
  getApiKey,
  validateApiKey,
  isApiKeyExpired,
} from './encryption';
import { storage } from './storage';

export interface AIKeyManager {
  addApiKey(provider: AIProvider, apiKey: string, encryptionKey: string): Promise<void>;
  getApiKeys(encryptionKey: string): Promise<DecryptedApiKey[]>;
  getDefaultApiKey(provider: AIProvider, encryptionKey: string): Promise<DecryptedApiKey | null>;
  updateApiKey(keyId: string, apiKey: string, encryptionKey: string): Promise<void>;
  deleteApiKey(keyId: string): Promise<void>;
  setDefaultApiKey(keyId: string): Promise<void>;
  validateKey(provider: AIProvider, apiKey: string): boolean;
  getUsageStats(): Promise<UsageStats>;
}

export interface DecryptedApiKey extends EncryptedApiKey {
  isDefault?: boolean;
}

export interface UsageStats {
  totalKeys: number;
  keysByProvider: Record<AIProvider, number>;
  lastUsedTimes: Record<string, string>;
  expiredKeys: string[];
}

export interface GenerationRequest {
  provider: AIProvider;
  model: string;
  prompt: string;
  options?: Record<string, any>;
}

export interface GenerationResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: AIProvider;
  model: string;
}

class AIKeyManagerImpl implements AIKeyManager {
  private encryptionKey: string | null = null;

  async initialize(encryptionKey: string): Promise<void> {
    this.encryptionKey = encryptionKey;
    await storage.setUserPreferences({ encryptionKey });
  }

  async addApiKey(provider: AIProvider, apiKey: string, encryptionKey: string): Promise<void> {
    if (apiKey === null || apiKey === undefined) throw new Error('API key is required');
    if (!encryptionKey) throw new Error('Encryption key is required');
    await storage.init();
    if (!validateApiKey(apiKey, provider)) throw new Error('Invalid API key format');
    const encryptedKeyObj = createEncryptedApiKey(provider, apiKey, encryptionKey);
    await storage.storeApiKey({ ...encryptedKeyObj, isDefault: false });
  }

  async getApiKeys(_encryptionKey: string): Promise<DecryptedApiKey[]> {
    const encryptedKeys = await storage.getApiKeys();
    return encryptedKeys.map((k) => ({ ...k }));
  }

  async getDefaultApiKey(
    provider: AIProvider,
    _encryptionKey: string
  ): Promise<DecryptedApiKey | null> {
    const encryptedKey = await storage.getDefaultApiKey(provider);
    if (!encryptedKey) return null;
    try {
      return { ...encryptedKey, isDefault: true };
    } catch (error) {
      console.error(`Failed to decrypt default key for ${provider}:`, error);
      return null;
    }
  }

  async updateApiKey(keyId: string, newApiKey: string, encryptionKey: string): Promise<void> {
    const existingKey = await storage.getApiKey(keyId);
    if (!existingKey) throw new Error('API key not found');
    if (!validateApiKey(newApiKey, existingKey.provider)) {
      throw new Error(`Invalid API key format for ${AI_PROVIDERS[existingKey.provider].name}`);
    }
    const updatedKey: EncryptedApiKey = {
      ...existingKey,
      encryptedKey: createEncryptedApiKey(existingKey.provider, newApiKey, encryptionKey)
        .encryptedKey,
      createdAt: existingKey.createdAt,
    };
    await storage.deleteApiKey(keyId);
    await storage.storeApiKey({ ...updatedKey, isDefault: existingKey.isDefault });
  }

  async deleteApiKey(keyId: string): Promise<void> {
    await storage.deleteApiKey(keyId);
  }

  async setDefaultApiKey(keyId: string): Promise<void> {
    const apiKey = await storage.getApiKey(keyId);
    if (!apiKey) throw new Error('API key not found');
    await storage.storeApiKey({ ...apiKey, isDefault: true });
  }

  validateKey(provider: AIProvider, apiKey: string): boolean {
    return validateApiKey(apiKey, provider);
  }

  async getUsageStats(): Promise<UsageStats> {
    const keys = await storage.getApiKeys();
    const keysByProvider: Record<AIProvider, number> = {
      openai: 0,
      anthropic: 0,
      google: 0,
      siza: 0,
    };
    const lastUsedTimes: Record<string, string> = {};
    const expiredKeys: string[] = [];
    for (const key of keys) {
      keysByProvider[key.provider]++;
      if (key.lastUsed) lastUsedTimes[key.keyId] = key.lastUsed;
      if (isApiKeyExpired(key)) expiredKeys.push(key.keyId);
    }
    return { totalKeys: keys.length, keysByProvider, lastUsedTimes, expiredKeys };
  }

  async makeGenerationRequest(
    request: GenerationRequest,
    encryptionKey: string
  ): Promise<GenerationResponse> {
    const apiKey = await this.getDefaultApiKey(request.provider, encryptionKey);
    if (!apiKey) throw new Error('No default API key found');
    await storage.updateApiKeyUsage(apiKey.keyId);
    return this.callAIProvider(request, getApiKey(apiKey, encryptionKey));
  }

  private async callAIProvider(
    request: GenerationRequest,
    apiKey: string
  ): Promise<GenerationResponse> {
    const { provider, model, prompt, options = {} } = request;
    switch (provider) {
      case 'openai':
        return this.callOpenAI(model, prompt, apiKey, options);
      case 'anthropic':
        return this.callAnthropic(model, prompt, apiKey, options);
      case 'google':
        return this.callGoogle(model, prompt, apiKey, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async callOpenAI(
    model: string,
    prompt: string,
    apiKey: string,
    options: any
  ): Promise<GenerationResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        ...options,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      provider: 'openai',
      model,
    };
  }

  private async callAnthropic(
    model: string,
    prompt: string,
    apiKey: string,
    options: any
  ): Promise<GenerationResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens || 2000,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        ...options,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      provider: 'anthropic',
      model,
    };
  }

  private async callGoogle(
    model: string,
    prompt: string,
    apiKey: string,
    options: any
  ): Promise<GenerationResponse> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 2000,
            ...options,
          },
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google AI error: ${error.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      provider: 'google',
      model,
    };
  }

  getAvailableModels(provider: AIProvider): string[] {
    return AI_PROVIDERS[provider].models;
  }

  getProviderConfig(provider: AIProvider) {
    return AI_PROVIDERS[provider];
  }
}

export const aiKeyManager = new AIKeyManagerImpl();
