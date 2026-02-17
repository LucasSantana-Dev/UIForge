/**
 * API client for component generation with SSE streaming
 */

export interface GenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentLibrary?: 'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none';
  description: string;
  style?: 'modern' | 'minimal' | 'colorful';
  typescript?: boolean;
  aiProvider?: 'openai' | 'anthropic' | 'google' | 'auto';
  useUserKey?: boolean;
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

// Wireframe generation types and functions

export interface WireframeOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentType: 'mobile' | 'web' | 'desktop' | 'tablet';
  description: string;
  style?: 'low-fidelity' | 'high-fidelity' | 'prototype';
  outputFormat?: 'figma' | 'json' | 'svg' | 'png';
  componentLibrary?: 'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none';
  typescript?: boolean;
}

export interface WireframeEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  progress?: number;
  message?: string;
  timestamp: number;
}

export interface WireframeResult {
  wireframe: {
    type: string;
    width: number;
    height: number;
    elements: any[];
    styles?: any;
  };
  metadata: {
    framework: string;
    componentType: string;
    generatedAt: string;
    outputFormat: string;
  };
}

/**
 * Generate wireframe with streaming support
 */
export async function* streamWireframe(
  options: WireframeOptions
): AsyncGenerator<WireframeEvent> {
  const response = await fetch('/api/wireframe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Wireframe generation failed');
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
 * Generate wireframe (returns full result)
 */
export async function generateWireframe(
  options: WireframeOptions
): Promise<WireframeResult> {
  let finalEvent: WireframeEvent | null = null;

  for await (const event of streamWireframe(options)) {
    switch (event.type) {
      case 'start':
        break;
      case 'progress':
        break;
      case 'complete':
        finalEvent = event;
        break;
      case 'error':
        throw new Error(event.message || 'Wireframe generation failed');
    }
  }

  if (!finalEvent) {
    throw new Error('Wireframe generation incomplete');
  }

  // Fetch the final result
  const response = await fetch('/api/wireframe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch wireframe result');
  }

  return response.json();
}

/**
 * Get available wireframe templates
 */
export async function getWireframeTemplates(): Promise<{
  templates: Array<{
    id: string;
    name: string;
    description: string;
    componentType: string;
    elements: string[];
  }>;
}> {
  const response = await fetch('/api/wireframe/templates');

  if (!response.ok) {
    throw new Error('Failed to fetch wireframe templates');
  }

  return response.json();
}

/**
 * Export wireframe to Figma
 */
export async function exportToFigma(
  wireframe: WireframeResult,
  options: {
    fileName?: string;
    exportFormat?: 'json' | 'figma-plugin';
  } = {}
): Promise<{
  success: boolean;
  format: string;
  data: any;
  instructions?: string;
  metadata?: any;
}> {
  const response = await fetch('/api/wireframe/export/figma', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wireframe,
      fileName: options.fileName || 'UIForge Wireframe',
      exportFormat: options.exportFormat || 'json',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to export to Figma');
  }

  return response.json();
}

/**
 * Dual generation - generate both code and wireframe
 */
export async function generateCodeAndWireframe(
  codeOptions: GenerationOptions,
  wireframeOptions: WireframeOptions
): Promise<{
  code: GenerationResult;
  wireframe: WireframeResult;
}> {
  // Generate both in parallel
  const [codeResult, wireframeResult] = await Promise.all([
    generateComponent(codeOptions),
    generateWireframe(wireframeOptions),
  ]);

  return {
    code: codeResult,
    wireframe: wireframeResult,
  };
}
