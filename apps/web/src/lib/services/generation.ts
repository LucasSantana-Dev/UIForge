import { AIProvider } from '@/lib/encryption';
import { GenerationEvent, generateComponentStream } from './gemini';

const FALLBACK_SYSTEM_PROMPT = `You are a UI component generator. Generate a single, self-contained React component.

Rules:
- Export the component as the default export
- Include all necessary imports at the top
- Use only the specified component library for styling
- The component must be complete and ready to use
- Do not include any explanation, markdown, or code fences — output ONLY the code
- Do not wrap the code in backticks or any formatting`;

export interface MultiProviderOptions {
  provider: AIProvider;
  model: string;
  prompt: string;
  framework: string;
  componentLibrary?: string;
  style?: string;
  typescript?: boolean;
  apiKey?: string;
  contextAddition?: string;
  imageBase64?: string;
  imageMimeType?: string;
  componentType?: string;
  mood?: string;
  industry?: string;
  conversationContext?: {
    previousCode: string;
    refinementPrompt: string;
    originalPrompt: string;
  };
}

function buildPrompt(options: MultiProviderOptions): string {
  const parts = [`Generate a ${options.framework} component:`, options.prompt];
  if (options.componentLibrary && options.componentLibrary !== 'none') {
    parts.push(`Use ${options.componentLibrary} for styling.`);
  }
  if (options.style) {
    parts.push(`Design style: ${options.style}.`);
  }
  if (options.typescript) {
    parts.push('Use TypeScript with proper type annotations.');
  } else {
    parts.push('Use JavaScript.');
  }
  return parts.join('\n');
}

function getEnrichedSystemPrompt(options: {
  framework: string;
  componentLibrary?: string;
  componentType?: string;
  mood?: string;
  industry?: string;
  contextAddition?: string;
}): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const siza = require('@forgespace/siza-gen');
    const assembled = siza.assembleContext({
      framework: options.framework,
      componentLibrary: options.componentLibrary,
      componentType: options.componentType,
      mood: options.mood,
      industry: options.industry,
      tokenBudget: 4000,
      maxExamples: 3,
    });
    const base = assembled.systemPrompt;
    return options.contextAddition ? `${base}\n\n${options.contextAddition}` : base;
  } catch {
    return options.contextAddition
      ? `${FALLBACK_SYSTEM_PROMPT}\n\n${options.contextAddition}`
      : FALLBACK_SYSTEM_PROMPT;
  }
}

export const PROVIDER_MODELS: Record<AIProvider, { id: string; name: string }[]> = {
  siza: [{ id: 'siza-auto', name: 'Siza AI (Auto)' }],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
  ],
};

export async function* generateWithProvider(
  options: MultiProviderOptions
): AsyncGenerator<GenerationEvent> {
  const { provider } = options;

  switch (provider) {
    case 'google':
      yield* generateComponentStream({
        prompt: options.prompt,
        framework: options.framework,
        componentLibrary: options.componentLibrary,
        style: options.style,
        typescript: options.typescript,
        apiKey: options.apiKey,
        contextAddition: options.contextAddition,
        imageBase64: options.imageBase64,
        imageMimeType: options.imageMimeType,
      });
      break;
    case 'openai':
      yield* generateWithOpenAI(options);
      break;
    case 'anthropic':
      yield* generateWithAnthropic(options);
      break;
    default:
      yield {
        type: 'error',
        message: `Unsupported provider: ${provider}`,
        timestamp: Date.now(),
      };
  }
}

async function* generateWithOpenAI(options: MultiProviderOptions): AsyncGenerator<GenerationEvent> {
  if (!options.apiKey) {
    yield {
      type: 'error',
      message: 'OpenAI API key is required. Add your key in AI Keys settings.',
      timestamp: Date.now(),
    };
    return;
  }

  yield { type: 'start', timestamp: Date.now() };

  try {
    const systemPrompt = getEnrichedSystemPrompt({
      framework: options.framework,
      componentLibrary: options.componentLibrary,
      componentType: options.componentType,
      mood: options.mood,
      industry: options.industry,
      contextAddition: options.contextAddition,
    });
    const userPrompt = buildPrompt(options);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      yield {
        type: 'error',
        message: `OpenAI error: ${error.error?.message || response.statusText}`,
        timestamp: Date.now(),
      };
      return;
    }

    if (!response.body) {
      yield { type: 'error', message: 'No response stream', timestamp: Date.now() };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield { type: 'chunk', content, timestamp: Date.now() };
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { type: 'complete', timestamp: Date.now() };
  } catch (error) {
    yield {
      type: 'error',
      message: error instanceof Error ? error.message : 'OpenAI generation failed',
      timestamp: Date.now(),
    };
  }
}

async function* generateWithAnthropic(
  options: MultiProviderOptions
): AsyncGenerator<GenerationEvent> {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    yield {
      type: 'error',
      message: 'Anthropic API key is required. Add your key in AI Keys settings.',
      timestamp: Date.now(),
    };
    return;
  }

  yield { type: 'start', timestamp: Date.now() };

  try {
    const systemPrompt = getEnrichedSystemPrompt({
      framework: options.framework,
      componentLibrary: options.componentLibrary,
      componentType: options.componentType,
      mood: options.mood,
      industry: options.industry,
      contextAddition: options.contextAddition,
    });
    const userPrompt = buildPrompt(options);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      yield {
        type: 'error',
        message: `Anthropic error: ${error.error?.message || response.statusText}`,
        timestamp: Date.now(),
      };
      return;
    }

    if (!response.body) {
      yield { type: 'error', message: 'No response stream', timestamp: Date.now() };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta') {
              const text = data.delta?.text;
              if (text) {
                yield { type: 'chunk', content: text, timestamp: Date.now() };
              }
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { type: 'complete', timestamp: Date.now() };
  } catch (error) {
    yield {
      type: 'error',
      message: error instanceof Error ? error.message : 'Anthropic generation failed',
      timestamp: Date.now(),
    };
  }
}
