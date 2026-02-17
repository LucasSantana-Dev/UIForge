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
  hashApiKey,
  isApiKeyExpired
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

  /**
   * Initialize the key manager with user's encryption key
   */
  async initialize(encryptionKey: string): Promise<void> {
    this.encryptionKey = encryptionKey;
    
    // Store encryption key in user preferences
    await storage.setUserPreferences({ encryptionKey });
  }

  /**
   * Add a new API key
   */
  async addApiKey(provider: AIProvider, apiKey: string, encryptionKey: string): Promise<void> {
    if (!validateApiKey(apiKey, provider)) {
      throw new Error(`Invalid API key format for ${AI_PROVIDERS[provider].name}`);
    }

    // Check if key already exists
    const existingKeys = await storage.getApiKeys();
    const keyHash = hashApiKey(apiKey);
    
    for (const existingKey of existingKeys) {
      const decryptedKey = getApiKey(existingKey, encryptionKey);
      if (hashApiKey(decryptedKey) === keyHash) {
        throw new Error('This API key is already stored');
      }
    }

    // Create and store encrypted key
    const encryptedKey = createEncryptedApiKey(provider, apiKey, encryptionKey);
    
    // Set as default if it's the first key for this provider
    const providerKeys = existingKeys.filter(k => k.provider === provider);
    const isDefault = providerKeys.length === 0;
    
    await storage.storeApiKey(encryptedKey, isDefault);
  }

  /**
   * Get all API keys (decrypted)
   */
  async getApiKeys(encryptionKey: string): Promise<DecryptedApiKey[]> {
    const encryptedKeys = await storage.getApiKeys();
    const decryptedKeys: DecryptedApiKey[] = [];

    for (const encryptedKey of encryptedKeys) {
      try {
        const apiKey = getApiKey(encryptedKey, encryptionKey);
        const isDefault = await this.isDefaultKey(encryptedKey.keyId);
        
        decryptedKeys.push({
          ...encryptedKey,
          isDefault,
        });
      } catch (error) {
        console.warn(`Failed to decrypt key ${encryptedKey.keyId}:`, error);
        // Skip invalid keys
      }
    }

    return decryptedKeys;
  }

  /**
   * Get default API key for a provider
   */
  async getDefaultApiKey(provider: AIProvider, encryptionKey: string): Promise<DecryptedApiKey | null> {
    const encryptedKey = await storage.getDefaultApiKey(provider);
    
    if (!encryptedKey) {
      return null;
    }

    try {
      const apiKey = getApiKey(encryptedKey, encryptionKey);
      return {
        ...encryptedKey,
        isDefault: true,
      };
    } catch (error) {
      console.error(`Failed to decrypt default key for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Update an existing API key
   */
  async updateApiKey(keyId: string, newApiKey: string, encryptionKey: string): Promise<void> {
    const existingKey = await storage.getApiKey(keyId);
    
    if (!existingKey) {
      throw new Error('API key not found');
    }

    if (!validateApiKey(newApiKey, existingKey.provider)) {
      throw new Error(`Invalid API key format for ${AI_PROVIDERS[existingKey.provider].name}`);
    }

    // Create new encrypted key with same metadata
    const updatedKey: EncryptedApiKey = {
      ...existingKey,
      encryptedKey: createEncryptedApiKey(existingKey.provider, newApiKey, encryptionKey).encryptedKey,
      createdAt: existingKey.createdAt, // Keep original creation time
    };

    // Delete old key and store new one
    await storage.deleteApiKey(keyId);
    await storage.storeApiKey(updatedKey, existingKey.isDefault);
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(keyId: string): Promise<void> {
    await storage.deleteApiKey(keyId);
  }

  /**
   * Set an API key as default for its provider
   */
  async setDefaultApiKey(keyId: string): Promise<void> {
    const apiKey = await storage.getApiKey(keyId);
    
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Store as default
    await storage.storeApiKey(apiKey, true);
  }

  /**
   * Validate API key format
   */
  validateKey(provider: AIProvider, apiKey: string): boolean {
    return validateApiKey(apiKey, provider);
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    const keys = await storage.getApiKeys();
    const keysByProvider: Record<AIProvider, number> = {
      openai: 0,
      anthropic: 0,
      google: 0,
    };
    
    const lastUsedTimes: Record<string, string> = {};
    const expiredKeys: string[] = [];

    for (const key of keys) {
      keysByProvider[key.provider]++;
      
      if (key.lastUsed) {
        lastUsedTimes[key.keyId] = key.lastUsed;
      }
      
      if (isApiKeyExpired(key)) {
        expiredKeys.push(key.keyId);
      }
    }

    return {
      totalKeys: keys.length,
      keysByProvider,
      lastUsedTimes,
      expiredKeys,
    };
  }

  /**
   * Make a generation request using the appropriate API key
   */
  async makeGenerationRequest(
    request: GenerationRequest,
    encryptionKey: string
  ): Promise<GenerationResponse> {
    const apiKey = await this.getDefaultApiKey(request.provider, encryptionKey);
    
    if (!apiKey) {
      throw new Error(`No default API key found for ${AI_PROVIDERS[request.provider].name}`);
    }

    // Update usage
    await storage.updateApiKeyUsage(apiKey.keyId);

    // Make the actual API call
    return this.callAIProvider(request, getApiKey(apiKey, encryptionKey));
  }

  /**
   * Call the appropriate AI provider API
   */
  private async callAIProvider(request: GenerationRequest, apiKey: string): Promise<GenerationResponse> {
    const { provider, model, prompt, options = {} } = request;
    const config = AI_PROVIDERS[provider];

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

  /**
   * Call OpenAI API
   */
  private async callOpenAI(model: string, prompt: string, apiKey: string, options: any): Promise<GenerationResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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

  /**
   * Call Anthropic API
   */
  private async callAnthropic(model: string, prompt: string, apiKey: string, options: any): Promise<GenerationResponse> {
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

  /**
   * Call Google AI API
   */
  private async callGoogle(model: string, prompt: string, apiKey: string, options: any): Promise<GenerationResponse> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2000,
          ...options,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`);
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

  /**
   * Check if a key is the default for its provider
   */
  private async isDefaultKey(keyId: string): Promise<boolean> {
    const encryptedKey = await storage.getApiKey(keyId);
    if (!encryptedKey) return false;

    const defaultKey = await storage.getDefaultApiKey(encryptedKey.provider);
    return defaultKey?.keyId === keyId;
  }

  /**
   * Get available models for a provider
   */
  getAvailableModels(provider: AIProvider): string[] {
    return AI_PROVIDERS[provider].models;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: AIProvider) {
    return AI_PROVIDERS[provider];
  }
}

// Export singleton instance
export const aiKeyManager = new AIKeyManagerImpl();
