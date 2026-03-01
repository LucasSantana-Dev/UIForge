/**
 * Anthropic Service for Component Generation
 * Handles component generation with Claude AI models
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import type { GenerateComponentOptions, ComponentGenerationResult } from '../types/ai';

// Model configuration
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const FALLBACK_MODEL = 'claude-haiku-4-5-20251001';

/**
 * Get Anthropic client instance
 */
function getAnthropicClient(apiKey?: string, useUserKey = false): Anthropic {
  let key: string;

  if (useUserKey && apiKey) {
    key = apiKey;
  } else {
    // Use environment key (fallback)
    key = process.env.ANTHROPIC_API_KEY || '';
  }

  if (!key) {
    throw new Error('Anthropic API key is required');
  }

  return new Anthropic({
    apiKey: key,
    maxRetries: 3,
    timeout: 60000, // 60 seconds
  });
}

/**
 * Build component generation prompt for Anthropic
 */
function buildPrompt(options: GenerateComponentOptions): string {
  const {
    framework,
    componentLibrary = 'none',
    description,
    style = 'modern',
    typescript = true,
  } = options;

  const lang = typescript ? 'TypeScript' : 'JavaScript';
  const ext = typescript
    ? framework === 'react'
      ? 'tsx'
      : 'ts'
    : framework === 'react'
      ? 'jsx'
      : 'js';

  return `Generate a ${framework} component with the following specifications:

**Description**: ${description}

**Requirements**:
- Framework: ${framework}
- Language: ${lang}
- Component Library: ${componentLibrary}
- Style: ${style}
- File extension: .${ext}

**Instructions**:
1. Generate ONLY the component code, no explanations
2. Use best practices for ${framework}
3. Include proper imports and exports
4. Use ${componentLibrary === 'tailwind' ? 'Tailwind CSS classes' : componentLibrary === 'shadcn' ? 'shadcn/ui components with Tailwind' : componentLibrary === 'none' ? 'inline styles or CSS modules' : componentLibrary + ' components'}
5. Make it production-ready and type-safe
6. Follow ${style} design principles
7. Include props interface/types with proper TypeScript typing
8. Add JSDoc comments for component description
9. Ensure the component is self-contained and functional
10. Use semantic HTML and accessibility best practices

Output the code wrapped in a markdown code block with the appropriate language tag (${ext}).`;
}

/**
 * Generate component code using Anthropic Claude
 */
export async function generateComponent(
  options: GenerateComponentOptions
): Promise<ComponentGenerationResult> {
  try {
    const client = getAnthropicClient(options.apiKey, options.useUserKey);
    const prompt = buildPrompt(options);
    const model = options.model || DEFAULT_MODEL;

    logger.info('Generating component with Anthropic', {
      framework: options.framework,
      library: options.componentLibrary,
      model,
      useUserKey: options.useUserKey,
    });

    const response = await client.messages.create({
      model,
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected content type from Anthropic');
    }

    const text = content.text;

    // Extract code from markdown code block
    const codeBlockRegex = /```(?:tsx?|jsx?|vue|html|svelte)?\n([\s\S]*?)\n```/;
    const match = text.match(codeBlockRegex);

    const code = match ? match[1].trim() : text.trim();

    logger.info('Component generated successfully with Anthropic', {
      framework: options.framework,
      codeLength: code.length,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    });

    return {
      code,
      language: options.typescript ? 'typescript' : 'javascript',
      framework: options.framework,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      provider: 'anthropic',
      model,
    };
  } catch (error) {
    logger.error('Anthropic generation failed', error);

    // Try fallback model if primary fails
    const currentModel = options.model || DEFAULT_MODEL;
    if (
      String(currentModel) !== String(FALLBACK_MODEL) &&
      String(DEFAULT_MODEL) !== String(FALLBACK_MODEL) &&
      String(currentModel) !== String(DEFAULT_MODEL)
    ) {
      logger.info('Retrying with fallback model', { model: FALLBACK_MODEL });
      return generateComponent({ ...options, model: FALLBACK_MODEL });
    }

    throw new Error(
      `Failed to generate component with Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Stream component generation with Anthropic
 */
export async function* streamComponentGeneration(
  options: GenerateComponentOptions
): AsyncGenerator<string, void, unknown> {
  const { signal } = options;
  const model = options.model || DEFAULT_MODEL;

  try {
    const client = getAnthropicClient(options.apiKey, options.useUserKey);
    const prompt = buildPrompt(options);

    logger.info('Starting streaming generation with Anthropic', {
      framework: options.framework,
      model,
      useUserKey: options.useUserKey,
    });

    const stream = await client.messages.create({
      model,
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      // Check for abort signal
      if (signal?.aborted) {
        logger.info('Anthropic streaming aborted');
        return;
      }

      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const content = chunk.delta.text;
        fullContent += content;
        yield content;
      }
    }

    logger.info('Anthropic streaming generation completed', {
      framework: options.framework,
      contentLength: fullContent.length,
    });
  } catch (error) {
    // Don't treat abort as error
    if (error instanceof Error && error.name === 'AbortError') {
      logger.info('Anthropic streaming aborted');
      return;
    }

    logger.error('Anthropic streaming failed', error);

    // Try fallback model if primary fails
    const currentModel = options.model || DEFAULT_MODEL;
    if (
      String(currentModel) !== String(FALLBACK_MODEL) &&
      String(DEFAULT_MODEL) !== String(FALLBACK_MODEL) &&
      String(currentModel) !== String(DEFAULT_MODEL)
    ) {
      logger.info('Retrying stream with fallback model', { model: FALLBACK_MODEL });
      yield* streamComponentGeneration({ ...options, model: FALLBACK_MODEL });
      return;
    }

    throw new Error(
      `Failed to stream component generation with Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate Anthropic API key format
 */
export function validateApiKey(apiKey: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(apiKey);
}

/**
 * Get available models and their capabilities
 */
export function getAvailableModels() {
  return [
    {
      id: 'claude-sonnet-4-6',
      name: 'Claude Sonnet 4.6',
      maxTokens: 16384,
      contextWindow: 200000,
      costPer1kTokens: 0.015,
      features: ['function-calling', 'vision', 'long-context'],
    },
    {
      id: 'claude-opus-4-6',
      name: 'Claude Opus 4.6',
      maxTokens: 16384,
      contextWindow: 200000,
      costPer1kTokens: 0.075,
      features: ['function-calling', 'vision', 'long-context'],
    },
    {
      id: 'claude-haiku-4-5-20251001',
      name: 'Claude Haiku 4.5',
      maxTokens: 8192,
      contextWindow: 200000,
      costPer1kTokens: 0.004,
      features: ['vision'],
    },
  ];
}
