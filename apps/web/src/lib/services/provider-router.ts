import type { AIProvider } from '@/lib/encryption';
import type { GenerationEvent } from './gemini';
import { generateComponentStream } from './gemini';
import { generateWithProvider } from './generation';
import { generateComponent } from '@/lib/mcp/client';
import { captureServerError } from '@/lib/sentry/server';

export interface RouteGenerationOptions {
  mcpEnabled: boolean;
  prompt: string;
  framework: string;
  componentLibrary?: string;
  style?: string;
  typescript?: boolean;
  userApiKey?: string;
  contextAddition: string;
  imageBase64?: string;
  imageMimeType?: string;
  provider: string;
  model: string;
}

export async function* routeGeneration(
  opts: RouteGenerationOptions
): AsyncGenerator<GenerationEvent> {
  if (opts.mcpEnabled) {
    yield* routeViaMcp(opts);
  } else {
    yield* routeViaProvider(opts);
  }
}

async function* routeViaMcp(
  opts: RouteGenerationOptions
): AsyncGenerator<GenerationEvent> {
  yield { type: 'start', timestamp: Date.now() };

  let mcpCode = '';
  try {
    mcpCode = await generateComponent({
      prompt: opts.prompt,
      framework: opts.framework,
      componentLibrary: opts.componentLibrary,
      style: opts.style,
      typescript: opts.typescript,
      imageBase64: opts.imageBase64,
      imageMimeType: opts.imageMimeType,
      contextAddition: opts.contextAddition,
    });
  } catch (mcpError) {
    captureServerError(mcpError, {
      route: '/api/generate',
      extra: { fallback: 'mcp-to-gemini' },
    });
  }

  if (mcpCode) {
    const chunkSize = 200;
    for (let i = 0; i < mcpCode.length; i += chunkSize) {
      yield {
        type: 'chunk',
        content: mcpCode.slice(i, i + chunkSize),
        timestamp: Date.now(),
      };
    }
  } else {
    for await (const event of generateComponentStream({
      prompt: opts.prompt,
      framework: opts.framework,
      componentLibrary: opts.componentLibrary,
      style: opts.style,
      typescript: opts.typescript,
      apiKey: opts.userApiKey,
      contextAddition: opts.contextAddition,
      imageBase64: opts.imageBase64,
      imageMimeType: opts.imageMimeType,
    })) {
      if (event.type !== 'complete') {
        yield event;
      }
    }
  }
}

async function* routeViaProvider(
  opts: RouteGenerationOptions
): AsyncGenerator<GenerationEvent> {
  for await (const event of generateWithProvider({
    provider: opts.provider as AIProvider,
    model: opts.model,
    prompt: opts.prompt,
    framework: opts.framework,
    componentLibrary: opts.componentLibrary,
    style: opts.style,
    typescript: opts.typescript,
    apiKey: opts.userApiKey,
    contextAddition: opts.contextAddition,
    imageBase64: opts.imageBase64,
    imageMimeType: opts.imageMimeType,
  })) {
    if (event.type === 'complete') break;
    yield event;
  }
}
