/**
 * Simplified AI Generation Service
 * Replaces complex 8,122-line service with 500-line zero-cost solution
 */

import { localAI, checkOllamaAvailability } from './local-ai';
import type { GenerateComponentOptions, ComponentGenerationResult } from '../types/ai';

/**
 * Check if code contains common code patterns (heuristic check, not real syntax validation)
 * This is a simple pattern detector using regex, not a parser-based validator.
 * For production use, consider integrating @babel/parser or TypeScript compiler API.
 */
export async function hasCodePatterns(code: string, _language: string): Promise<boolean> {
  // Simple heuristic checks for common code patterns
  const patterns = [
    /function\s+\w+/, // Function declarations
    /const\s+\w+\s*=\s*\(/, // Arrow functions
    /class\s+\w+/, // Class declarations
    /import\s+.*from/, // Import statements
    /export\s+/, // Export statements
    /{\s*[\w\s,]*\s*}/, // Object literals
    /\[\s*.*?\s*\]/, // Array literals
    /if\s*\(/, // Conditional statements
    /for\s*\(/, // For loops
    /return\s+/, // Return statements
  ];

  return patterns.some(pattern => pattern.test(code));
}

/**
 * Format code with local AI (experimental)
 * For now, returns the code as-is since local AI models may not be reliable for formatting
 */
export async function formatCode(code: string, _language: string, _apiKey?: string, _useUserKey?: boolean): Promise<string> {
  // For now, just return the code as-is
  // In a real implementation, you might use a code formatter like prettier
  return code;
}

/**
 * Simplified component generation using local AI
 */
export async function generateComponent(
  options: GenerateComponentOptions
): Promise<ComponentGenerationResult> {
  const { framework, description, style = 'modern' } = options;

  // Check if local AI is available
  const isAvailable = await checkOllamaAvailability();
  if (!isAvailable) {
    throw new Error('Local AI service is not available. Please ensure Ollama is running.');
  }

  // Build optimized prompt for local model
  const prompt = buildOptimizedPrompt({
    framework,
    description,
    style,
  });

  try {
    const generatedCode = await localAI.generate(prompt);

    return {
      code: generatedCode,
      language: 'typescript',
      framework,
      model: localAI.model,
      tokensUsed: 0, // Local models don't track tokens
      provider: localAI.name,
    };
  } catch (error) {
    console.error('Component generation failed:', error);
    throw new Error('Failed to generate component. Please try again.');
  }
}

/**
 * Stream component generation using local AI
 */
export async function* streamComponentGeneration(
  options: GenerateComponentOptions
): AsyncGenerator<string, void, unknown> {
  const { framework, description, style = 'modern' } = options;

  // Check if local AI is available
  const isAvailable = await checkOllamaAvailability();
  if (!isAvailable) {
    throw new Error('Local AI service is not available. Please ensure Ollama is running.');
  }

  // Build optimized prompt for local model
  const prompt = buildOptimizedPrompt({
    framework,
    description,
    style,
  });

  try {
    yield* localAI.stream(prompt);
  } catch (error) {
    console.error('Component streaming failed:', error);
    throw new Error('Failed to stream component generation. Please try again.');
  }
}

/**
 * Build optimized prompt for local AI models
 */
function buildOptimizedPrompt(options: {
  framework: string;
  description: string;
  style: string;
}): string {
  const { framework, description, style } = options;

  return `Generate a ${framework} component with the following requirements:

Description: ${description}
Style: ${style}

Requirements:
- Use TypeScript if applicable
- Follow modern best practices
- Include proper imports
- Make it responsive and accessible
- Add basic error handling
- Include inline comments for clarity

Please provide only the complete component code without explanations or markdown formatting.`;
}

/**
 * Get AI service status
 */
export async function getAIServiceStatus() {
  const isAvailable = await checkOllamaAvailability();

  return {
    available: isAvailable,
    provider: localAI.name,
    model: localAI.model,
    type: 'self-hosted',
    cost: '$0/month',
  };
}

/**
 * Health check for AI service
 */
export async function healthCheck() {
  try {
    const isAvailable = await checkOllamaAvailability();
    const testPrompt = "Respond with 'OK' if you can read this.";
    const response = isAvailable ? await localAI.generate(testPrompt) : '';

    return {
      status: isAvailable && response.includes('OK') ? 'healthy' : 'unhealthy',
      provider: localAI.name,
      model: localAI.model,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      provider: localAI.name,
      model: localAI.model,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
