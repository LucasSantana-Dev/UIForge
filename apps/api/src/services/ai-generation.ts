/**
 * AI Generation Service with BYOK Support
 * Handles component generation with multiple AI providers and fallback
 */

import { 
  generateComponent as generateWithOpenAI,
  streamComponentGeneration as streamWithOpenAI
} from './openai';
import { 
  generateComponent as generateWithAnthropic,
  streamComponentGeneration as streamWithAnthropic
} from './anthropic';
import { 
  generateComponent as generateWithGemini,
  streamComponentGeneration as streamWithGemini
} from './gemini';
import { logger } from '../utils/logger';
import type { GenerateComponentOptions, ComponentGenerationResult } from '../types/ai';

/**
 * Generate component with AI provider selection and fallback
 */
export async function generateComponent(
  options: GenerateComponentOptions
): Promise<ComponentGenerationResult> {
  const { aiProvider = 'auto', useUserKey = false, userApiKey, ...generationOptions } = options;
  
  // Determine provider strategy
  const providers = getProviderStrategy(aiProvider, useUserKey, !!userApiKey);
  
  let lastError: Error | null = null;
  
  // Try each provider in order
  for (const provider of providers) {
    try {
      logger.info('Attempting generation with provider', { 
        provider, 
        useUserKey: provider.useUserKey,
        framework: options.framework 
      });
      
      const result = await generateWithProvider(provider, generationOptions);
      
      logger.info('Generation successful', { 
        provider: provider.name,
        model: result.model,
        tokensUsed: result.tokensUsed 
      });
      
      return result;
    } catch (error) {
      lastError = error as Error;
      logger.warn('Generation failed with provider', { 
        provider: provider.name, 
        error: lastError.message 
      });
      
      // Continue to next provider
      continue;
    }
  }
  
  // All providers failed
  logger.error('All AI providers failed', { lastError: lastError?.message });
  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Stream component generation with AI provider selection and fallback
 */
export async function* streamComponentGeneration(
  options: GenerateComponentOptions
): AsyncGenerator<string, void, unknown> {
  const { aiProvider = 'auto', useUserKey = false, userApiKey, ...generationOptions } = options;
  
  // Determine provider strategy
  const providers = getProviderStrategy(aiProvider, useUserKey, !!userApiKey);
  
  let lastError: Error | null = null;
  
  // Try each provider in order
  for (const provider of providers) {
    try {
      logger.info('Attempting streaming generation with provider', { 
        provider: provider.name, 
        useUserKey: provider.useUserKey,
        framework: options.framework 
      });
      
      const stream = streamWithProvider(provider, generationOptions);
      
      // Yield chunks from successful provider
      for await (const chunk of stream) {
        yield chunk;
      }
      
      logger.info('Streaming generation successful', { 
        provider: provider.name 
      });
      
      return; // Success, exit function
    } catch (error) {
      lastError = error as Error;
      logger.warn('Streaming generation failed with provider', { 
        provider: provider.name, 
        error: lastError.message 
      });
      
      // Continue to next provider
      continue;
    }
  }
  
  // All providers failed
  logger.error('All AI providers failed for streaming', { lastError: lastError?.message });
  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

interface ProviderConfig {
  name: 'openai' | 'anthropic' | 'google';
  useUserKey: boolean;
  apiKey?: string;
}

/**
 * Determine provider strategy based on user preferences
 */
function getProviderStrategy(
  aiProvider: 'openai' | 'anthropic' | 'google' | 'auto',
  useUserKey: boolean,
  hasUserKey: boolean
): ProviderConfig[] {
  const strategies: ProviderConfig[] = [];
  
  // If user specified a provider and has a key, try it first
  if (aiProvider !== 'auto' && useUserKey && hasUserKey) {
    strategies.push({
      name: aiProvider,
      useUserKey: true
    });
  }
  
  // If user wants to use their keys and has them, try all user keys
  if (useUserKey && hasUserKey) {
    // Add user keys in priority order (can be customized)
    if (aiProvider !== 'openai') {
      strategies.push({ name: 'openai', useUserKey: true });
    }
    if (aiProvider !== 'anthropic') {
      strategies.push({ name: 'anthropic', useUserKey: true });
    }
    if (aiProvider !== 'google') {
      strategies.push({ name: 'google', useUserKey: true });
    }
  }
  
  // Always fallback to Gemini (free tier)
  strategies.push({ name: 'google', useUserKey: false });
  
  return strategies;
}

/**
 * Generate with specific provider
 */
async function generateWithProvider(
  provider: ProviderConfig,
  options: Omit<GenerateComponentOptions, 'aiProvider' | 'useUserKey' | 'userApiKey'>
): Promise<ComponentGenerationResult> {
  switch (provider.name) {
    case 'openai':
      return await generateWithOpenAI({
        ...options,
        apiKey: provider.apiKey,
        useUserKey: provider.useUserKey
      });
    
    case 'anthropic':
      return await generateWithAnthropic({
        ...options,
        apiKey: provider.apiKey,
        useUserKey: provider.useUserKey
      });
    
    case 'google':
      return await generateWithGemini({
        ...options,
        apiKey: provider.apiKey,
        useUserKey: provider.useUserKey
      });
    
    default:
      throw new Error(`Unsupported provider: ${provider.name}`);
  }
}

/**
 * Stream with specific provider
 */
function streamWithProvider(
  provider: ProviderConfig,
  options: Omit<GenerateComponentOptions, 'aiProvider' | 'useUserKey' | 'userApiKey'>
): AsyncGenerator<string, void, unknown> {
  switch (provider.name) {
    case 'openai':
      return streamWithOpenAI({
        ...options,
        apiKey: provider.apiKey,
        useUserKey: provider.useUserKey
      });
    
    case 'anthropic':
      return streamWithAnthropic({
        ...options,
        apiKey: provider.apiKey,
        useUserKey: provider.useUserKey
      });
    
    case 'google':
      return streamWithGemini({
        ...options,
        apiKey: provider.apiKey,
        useUserKey: provider.useUserKey
      });
    
    default:
      throw new Error(`Unsupported provider: ${provider.name}`);
  }
}

/**
 * Get provider information and capabilities
 */
export function getProviderInfo(provider: 'openai' | 'anthropic' | 'google') {
  switch (provider) {
    case 'openai':
      return {
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        maxTokens: 128000,
        rateLimitPerMinute: 3500,
        features: ['function-calling', 'json-mode', 'vision'],
        pricing: 'Pay-per-token'
      };
    
    case 'anthropic':
      return {
        name: 'Anthropic',
        models: ['claude-3.5-sonnet', 'claude-3-haiku', 'claude-3-opus'],
        maxTokens: 200000,
        rateLimitPerMinute: 1000,
        features: ['function-calling', 'vision', 'long-context'],
        pricing: 'Pay-per-token'
      };
    
    case 'google':
      return {
        name: 'Google AI',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
        maxTokens: 2097152,
        rateLimitPerMinute: 60,
        features: ['vision', 'long-context', 'free-tier'],
        pricing: 'Free tier available'
      };
    
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Validate API key format for provider
 */
export function validateApiKey(provider: 'openai' | 'anthropic' | 'google', apiKey: string): boolean {
  switch (provider) {
    case 'openai':
      return /^sk-[A-Za-z0-9]{48}$|^sk-proj-[A-Za-z0-9_-]{48}$/.test(apiKey);
    
    case 'anthropic':
      return /^sk-ant-[A-Za-z0-9_-]{95}$/.test(apiKey);
    
    case 'google':
      return /^AIza[A-Za-z0-9_-]{35}$/.test(apiKey);
    
    default:
      return false;
  }
}