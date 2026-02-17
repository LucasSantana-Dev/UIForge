/**
 * OpenAI Service for Component Generation
 * Handles component generation with OpenAI GPT models
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';
import type { GenerateComponentOptions, ComponentGenerationResult } from '../types/ai';

// Model configuration
const DEFAULT_MODEL = 'gpt-4-turbo';
const FALLBACK_MODEL = 'gpt-3.5-turbo';

/**
 * Get OpenAI client instance
 */
function getOpenAIClient(apiKey?: string, useUserKey = false): OpenAI {
  let key: string;

  if (useUserKey && apiKey) {
    key = apiKey;
  } else {
    // Use environment key (fallback)
    key = process.env.OPENAI_API_KEY || '';
  }

  if (!key) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAI({
    apiKey: key,
    maxRetries: 3,
    timeout: 60000, // 60 seconds
  });
}

/**
 * Build component generation prompt for OpenAI
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
 * Generate component code using OpenAI
 */
export async function generateComponent(
  options: GenerateComponentOptions
): Promise<ComponentGenerationResult> {
  try {
    const client = getOpenAIClient(options.apiKey, options.useUserKey);
    const prompt = buildPrompt(options);
    const model = options.model || DEFAULT_MODEL;

    logger.info('Generating component with OpenAI', {
      framework: options.framework,
      library: options.componentLibrary,
      model,
      useUserKey: options.useUserKey,
    });

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert frontend developer who specializes in creating high-quality, production-ready components. Always provide clean, well-structured code with proper TypeScript typing.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Extract code from markdown code block
    const codeBlockRegex = /```(?:tsx?|jsx?|vue|html|svelte)?\n([\s\S]*?)\n```/;
    const match = content.match(codeBlockRegex);

    const code = match ? match[1].trim() : content.trim();

    logger.info('Component generated successfully with OpenAI', {
      framework: options.framework,
      codeLength: code.length,
      tokensUsed: response.usage?.total_tokens,
    });

    return {
      code,
      language: options.typescript ? 'typescript' : 'javascript',
      framework: options.framework,
      tokensUsed: response.usage?.total_tokens,
      provider: 'openai',
      model,
    };
  } catch (error) {
    logger.error('OpenAI generation failed', error);

    // Try fallback model if primary fails
    const currentModel = options.model || DEFAULT_MODEL;
    if (String(currentModel) !== String(FALLBACK_MODEL) && String(DEFAULT_MODEL) !== String(FALLBACK_MODEL) && String(currentModel) !== String(DEFAULT_MODEL)) {
      logger.info('Retrying with fallback model', { model: FALLBACK_MODEL });
      return generateComponent({ ...options, model: FALLBACK_MODEL });
    }

    throw new Error(`Failed to generate component with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Stream component generation with OpenAI
 */
export async function* streamComponentGeneration(
  options: GenerateComponentOptions
): AsyncGenerator<string, void, unknown> {
  const { signal } = options;
  const model = options.model || DEFAULT_MODEL;

  try {
    const client = getOpenAIClient(options.apiKey, options.useUserKey);
    const prompt = buildPrompt(options);

    logger.info('Starting streaming generation with OpenAI', {
      framework: options.framework,
      model,
      useUserKey: options.useUserKey,
    });

    const stream = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert frontend developer who specializes in creating high-quality, production-ready components. Always provide clean, well-structured code with proper TypeScript typing.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      // Check for abort signal
      if (signal?.aborted) {
        logger.info('OpenAI streaming aborted');
        return;
      }

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        yield content;
      }
    }

    logger.info('OpenAI streaming generation completed', {
      framework: options.framework,
      contentLength: fullContent.length,
    });
  } catch (error) {
    // Don't treat abort as error
    if (error instanceof Error && error.name === 'AbortError') {
      logger.info('OpenAI streaming aborted');
      return;
    }

    logger.error('OpenAI streaming failed', error);

    // Try fallback model if primary fails
    const currentModel = options.model || DEFAULT_MODEL;
    if (String(currentModel) !== String(FALLBACK_MODEL) && String(DEFAULT_MODEL) !== String(FALLBACK_MODEL) && String(currentModel) !== String(DEFAULT_MODEL)) {
      logger.info('Retrying stream with fallback model', { model: FALLBACK_MODEL });
      yield* streamComponentGeneration({ ...options, model: FALLBACK_MODEL });
      return;
    }

    throw new Error(`Failed to stream component generation with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate OpenAI API key format
 */
export function validateApiKey(apiKey: string): boolean {
  // OpenAI API keys start with 'sk-' and are 51 characters long
  // Project keys start with 'sk-proj-' and are 56 characters long
  return /^sk-[A-Za-z0-9]{48}$|^sk-proj-[A-Za-z0-9_-]{48}$/.test(apiKey);
}

/**
 * Get available models and their capabilities
 */
export function getAvailableModels() {
  return [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      maxTokens: 128000,
      contextWindow: 128000,
      costPer1kTokens: 0.03,
      features: ['function-calling', 'json-mode', 'vision'],
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      maxTokens: 8192,
      contextWindow: 8192,
      costPer1kTokens: 0.06,
      features: ['function-calling', 'vision'],
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      maxTokens: 4096,
      contextWindow: 16384,
      costPer1kTokens: 0.002,
      features: ['function-calling'],
    },
  ];
}
