/**
 * AI Service Types
 * Shared types for AI generation services
 */

export interface GenerateComponentOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentLibrary?: 'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none';
  description: string;
  style?: 'modern' | 'minimal' | 'colorful';
  typescript?: boolean;
  signal?: AbortSignal;
  apiKey?: string;
  useUserKey?: boolean;
  model?: string;
  aiProvider?: 'openai' | 'anthropic' | 'google' | 'auto';
  userApiKey?: string;
}

export interface ComponentGenerationResult {
  code: string;
  language: string;
  framework: string;
  tokensUsed?: number;
  provider: string;
  model: string;
}

export interface AIProvider {
  name: string;
  models: string[];
  rateLimitPerMinute: number;
  maxTokens: number;
  requiresOrganization: boolean;
}

export type AIProviderType = 'openai' | 'anthropic' | 'google';

export interface StreamEvent {
  type: 'start' | 'progress' | 'code' | 'complete' | 'error';
  data?: any;
  timestamp: number;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  events: StreamEvent[];
  code?: string;
  error?: string;
}

// Additional types for testing and service orchestration
export interface ComponentGenerationRequest {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentLibrary?: 'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none';
  description: string;
  style?: 'modern' | 'minimal' | 'colorful';
  typescript?: boolean;
  signal?: AbortSignal;
  apiKey?: string;
  useUserKey?: boolean;
  model?: string;
  aiProvider?: 'openai' | 'anthropic' | 'google' | 'auto';
  userApiKey?: string;
  stream?: boolean;
}

export interface ComponentGenerationResponse {
  success: boolean;
  data?: ComponentGenerationResult;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    provider: string;
    model: string;
  };
}

export interface ProviderInfo {
  name: string;
  models: string[];
  maxTokens: number;
  contextWindow: number;
  rateLimitPerMinute: number;
  requiresOrganization: boolean;
}

// Service interface for testing
export interface IAIGenerationService {
  generateComponent(request: ComponentGenerationRequest): Promise<ComponentGenerationResponse>;
  streamComponent(request: ComponentGenerationRequest): AsyncGenerator<StreamEvent>;
  getProviderInfo(provider: AIProviderType): ProviderInfo;
  getAllProviderInfo(): ProviderInfo[];
  validateApiKey(provider: AIProviderType, apiKey: string): boolean;
}

// Mock service for testing
export interface MockAIGenerationService {
  generateComponent: jest.Mock;
  streamComponent: jest.Mock;
  getProviderInfo: jest.Mock;
  getAllProviderInfo: jest.Mock;
  validateApiKey: jest.Mock;
}

// Export mock for testing
export const aiGenerationService: MockAIGenerationService = {
  generateComponent: jest.fn(),
  streamComponent: jest.fn(),
  getProviderInfo: jest.fn(),
  getAllProviderInfo: jest.fn(),
  validateApiKey: jest.fn(),
};