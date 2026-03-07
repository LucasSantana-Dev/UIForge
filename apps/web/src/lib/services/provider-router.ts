import type { AIProvider } from '@/lib/encryption';
import { routeSizaGeneration } from './siza-router';
import type { GenerationEvent } from './generation-types';
import { generateWithProvider } from './generation';
import { generateComponentStream as mcpStream } from '@/lib/mcp/client';
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
  correlationId?: string;
  accessToken?: string;
}

export async function* routeGeneration(
  opts: RouteGenerationOptions
): AsyncGenerator<GenerationEvent> {
  if (opts.mcpEnabled) {
    yield* routeViaMcp(opts);
  } else if (opts.provider === 'siza') {
    yield* routeViaSizaAI(opts);
  } else {
    yield* routeViaProvider(opts);
  }
}

async function* routeViaSizaAI(opts: RouteGenerationOptions): AsyncGenerator<GenerationEvent> {
  const routing = routeSizaGeneration({
    prompt: opts.prompt,
    hasImage: !!opts.imageBase64,
    isFreeTier: !opts.userApiKey,
  });

  yield {
    type: 'routing',
    provider: routing.provider,
    model: routing.model,
    reason: routing.reason,
    timestamp: Date.now(),
  } as GenerationEvent;

  yield* routeViaProvider({
    ...opts,
    provider: routing.provider,
    model: routing.model,
  });
}

async function* routeViaMcp(opts: RouteGenerationOptions): AsyncGenerator<GenerationEvent> {
  if (!opts.accessToken) {
    yield {
      type: 'error',
      message: 'MCP gateway requires authentication. No access token available.',
      timestamp: Date.now(),
    };
    return;
  }

  yield { type: 'start', timestamp: Date.now() };

  let hasOutput = false;
  try {
    for await (const event of mcpStream(
      {
        prompt: opts.prompt,
        framework: opts.framework,
        componentLibrary: opts.componentLibrary,
        style: opts.style,
        typescript: opts.typescript,
        imageBase64: opts.imageBase64,
        imageMimeType: opts.imageMimeType,
        contextAddition: opts.contextAddition,
      },
      opts.accessToken,
      opts.correlationId
    )) {
      hasOutput = true;
      if (event.type !== 'complete') {
        yield event;
      }
    }
  } catch (mcpError) {
    captureServerError(mcpError, {
      route: '/api/generate',
      extra: { fallback: 'mcp-to-default' },
    });
  }

  if (!hasOutput) {
    const validProviders: AIProvider[] = ['google', 'openai', 'anthropic'];
    const envProvider = process.env.DEFAULT_GENERATION_PROVIDER;
    const fallbackProvider: AIProvider =
      envProvider && validProviders.includes(envProvider as AIProvider)
        ? (envProvider as AIProvider)
        : 'google';
    const fallbackModel = process.env.DEFAULT_GENERATION_MODEL || 'gemini-2.5-flash';

    yield {
      type: 'fallback',
      provider: fallbackProvider,
      message: `MCP gateway unavailable, falling back to ${fallbackProvider}`,
      timestamp: Date.now(),
    };
    for await (const event of generateWithProvider({
      provider: fallbackProvider,
      model: fallbackModel,
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

const QUOTA_ERROR_PATTERNS = [
  /quota\s*(exceeded|limit)/i,
  /\b429\b/,
  /rate\s*limit/i,
  /resource_exhausted/i,
  /too\s*many\s*requests/i,
];

function isQuotaError(message?: string): boolean {
  if (!message) return false;
  return QUOTA_ERROR_PATTERNS.some((p) => p.test(message));
}

async function* routeViaProvider(opts: RouteGenerationOptions): AsyncGenerator<GenerationEvent> {
  let quotaError: GenerationEvent | null = null;

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
    if (event.type === 'error' && isQuotaError(event.message)) {
      quotaError = event;
      break;
    }
    yield event;
  }

  if (!quotaError) return;

  const serverKeyAvailable = opts.provider !== 'anthropic' && !!process.env.ANTHROPIC_API_KEY;
  if (!serverKeyAvailable) {
    yield quotaError;
    return;
  }

  captureServerError(new Error(quotaError.message), {
    route: '/api/generate',
    extra: { fallback: `${opts.provider}-to-anthropic` },
  });

  yield {
    type: 'fallback',
    provider: 'anthropic',
    message: `${opts.provider} quota exceeded, falling back to Anthropic`,
    timestamp: Date.now(),
  };

  for await (const event of generateWithProvider({
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
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
