/**
 * Gemini AI Service
 * Handles component generation with Gemini 1.5 Flash (free tier)
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { GenerateComponentOptions, ComponentGenerationResult } from '../types/ai';

// Model configuration for Gemini 1.5 Flash (free tier)
const MODEL_NAME = 'gemini-1.5-flash';

// Lazy initialization of Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(apiKey?: string, useUserKey = false): GoogleGenerativeAI {
  let key: string;

  if (useUserKey && apiKey) {
    key = apiKey;
  } else {
    // Use environment key (fallback)
    key = env.GEMINI_API_KEY || '';
  }

  if (!key) {
    throw new Error('Gemini API key is required');
  }

  if (!genAI || genAI.apiKey !== key) {
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

/**
 * Get Gemini model instance
 */
function getModel(apiKey?: string, useUserKey = false): GenerativeModel {
  return getGenAI(apiKey, useUserKey).getGenerativeModel({ model: MODEL_NAME });
}

/**
 * Build component generation prompt
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
3. Include proper imports
4. Use ${componentLibrary === 'tailwind' ? 'Tailwind CSS classes' : componentLibrary === 'shadcn' ? 'shadcn/ui components with Tailwind' : componentLibrary === 'none' ? 'inline styles or CSS modules' : componentLibrary + ' components'}
5. Make it production-ready and type-safe
6. Follow ${style} design principles
7. Include props interface/types
8. Add JSDoc comments for component description

Output the code wrapped in a markdown code block with the appropriate language tag.`;
}

/**
 * Generate component code using Gemini AI
 */
export async function generateComponent(
  options: GenerateComponentOptions
): Promise<ComponentGenerationResult> {
  try {
    logger.info('Generating component with Gemini', {
      framework: options.framework,
      library: options.componentLibrary,
      useUserKey: options.useUserKey,
    });

    const model = getModel(options.apiKey, options.useUserKey);
    const prompt = buildPrompt(options);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract code from markdown code block
    const codeBlockRegex = /```(?:\w*)\n([\s\S]*?)\n```/;
    const match = text.match(codeBlockRegex);

    const code = match ? match[1].trim() : text.trim();

    logger.info('Component generated successfully', {
      framework: options.framework,
      codeLength: code.length,
    });

    return {
      code,
      language: options.typescript ? 'typescript' : 'javascript',
      framework: options.framework,
      tokensUsed: response.usageMetadata?.totalTokenCount,
      provider: 'google',
      model: MODEL_NAME,
    };
  } catch (error) {
    logger.error('Gemini generation failed', error);
    throw new Error('Failed to generate component with Gemini AI');
  }
}

/**
 * Stream component generation with Gemini AI
 * Returns an async generator for Server-Sent Events
 */
export async function* streamComponentGeneration(
  options: GenerateComponentOptions
): AsyncGenerator<string, void, unknown> {
  const { signal } = options;

  try {
    // Check if already aborted
    if (signal?.aborted) {
      logger.info('Generation aborted before start');
      return;
    }

    logger.info('Starting streaming generation with Gemini', {
      framework: options.framework,
      useUserKey: options.useUserKey,
    });

    const model = getModel(options.apiKey, options.useUserKey);
    const prompt = buildPrompt(options);

    // Stream generation
    const result = await model.generateContentStream(prompt);

    // Yield chunks as they arrive
    for await (const chunk of result.stream) {
      // Check for abort between chunks
      if (signal?.aborted) {
        logger.info('Generation aborted during streaming');
        return;
      }

      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }

    logger.info('Streaming generation completed');
  } catch (error: any) {
    // Don't treat abort as error
    if (error?.name === 'AbortError' || signal?.aborted) {
      logger.info('Generation aborted');
      return;
    }

    logger.error('Gemini streaming failed', error);
    throw new Error('Failed to stream component generation');
  }
}

/**
 * Check if code contains common code patterns (heuristic check, not real syntax validation)
 * This is a simple pattern detector using regex, not a parser-based validator.
 * For production use, consider integrating @babel/parser or TypeScript compiler API.
 */
export async function hasCodePatterns(code: string, _language: string): Promise<boolean> {
  try {
    // Heuristic check - detect common code patterns
    const hasImports = /import\s+.*\s+from\s+['"]/.test(code);
    const hasFunction = /function\s+\w+|const\s+\w+\s*=|export\s+(default\s+)?function/.test(code);
    const hasReturn = /return\s+[(<]/.test(code);

    return hasImports || hasFunction || hasReturn;
  } catch (error) {
    logger.error('Code pattern check failed', error);
    return false;
  }
}

/**
 * @deprecated Use hasCodePatterns instead. This is a heuristic check, not real validation.
 */
export async function validateCode(code: string, language: string): Promise<boolean> {
  return hasCodePatterns(code, language);
}

/**
 * Format code with Gemini (experimental)
 */
export async function formatCode(
  code: string,
  _language: string,
  apiKey?: string,
  useUserKey = false
): Promise<string> {
  try {
    const model = getModel(apiKey, useUserKey);
    const prompt = `Format this ${_language} code following best practices and proper indentation. Return ONLY the formatted code without explanations:

\`\`\`${_language}
${code}
\`\`\``;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract formatted code
    const codeBlockRegex = /```(?:tsx?|jsx?|vue|html|svelte)?\n([\s\S]*?)\n```/;
    const match = text.match(codeBlockRegex);

    return match ? match[1].trim() : code;
  } catch (error) {
    logger.error('Code formatting failed', error);
    return code; // Return original code on error
  }
}
