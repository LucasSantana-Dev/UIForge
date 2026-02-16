/**
 * API client for component generation with SSE streaming
 */

export interface GenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentLibrary?: 'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none';
  description: string;
  style?: 'modern' | 'minimal' | 'colorful';
  typescript?: boolean;
}

export interface GenerationEvent {
  type: 'start' | 'chunk' | 'complete' | 'error';
  content?: string;
  totalLength?: number;
  message?: string;
  timestamp: number;
}

export interface GenerationResult {
  code: string;
  language: string;
  framework: string;
  tokensUsed?: number;
  totalLength: number;
}

/**
 * Stream component generation with Server-Sent Events
 */
export async function* streamGeneration(
  options: GenerationOptions
): AsyncGenerator<GenerationEvent> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Generation failed');
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch (error) {
            console.error('Failed to parse SSE data:', error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Generate component with streaming (returns full result)
 */
export async function generateComponent(
  options: GenerationOptions
): Promise<GenerationResult> {
  let code = '';
  let finalEvent: GenerationEvent | null = null;

  for await (const event of streamGeneration(options)) {
    switch (event.type) {
      case 'start':
        code = '';
        break;
      case 'chunk':
        if (event.content) {
          code += event.content;
        }
        break;
      case 'complete':
        finalEvent = event;
        break;
      case 'error':
        throw new Error(event.message || 'Generation failed');
    }
  }

  if (!finalEvent) {
    throw new Error('Generation incomplete');
  }

  return {
    code,
    language: options.typescript ? 'typescript' : 'javascript',
    framework: options.framework,
    totalLength: finalEvent.totalLength || code.length,
  };
}

/**
 * Validate generated code
 */
export async function validateCode(code: string, language: string): Promise<{
  valid: boolean;
  language: string;
  timestamp: number;
}> {
  const response = await fetch('/api/generate/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    throw new Error('Validation failed');
  }

  return response.json();
}

/**
 * Format generated code
 */
export async function formatCode(code: string, language: string): Promise<{
  code: string;
  language: string;
  timestamp: number;
}> {
  const response = await fetch('/api/generate/format', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    throw new Error('Formatting failed');
  }

  return response.json();
}
