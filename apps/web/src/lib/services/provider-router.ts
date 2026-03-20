import type { AIProvider } from '@/lib/encryption';
import { routeSizaGeneration } from './siza-router';
import type { GenerationEvent } from './generation-types';
import { generateWithProvider } from './generation';
import { generateComponentStream as mcpStream } from '@/lib/mcp/client';
import { captureServerError } from '@/lib/sentry/server';

export interface RouteGenerationOptions {
  mcpEnabled: boolean;
  allowDirectProviderFallback?: boolean;
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

function resolveDirectProviderFallback(): { provider: AIProvider; model: string } {
  const validProviders: AIProvider[] = ['google', 'openai', 'anthropic'];
  const envProvider = process.env.DEFAULT_GENERATION_PROVIDER;
  const provider: AIProvider =
    envProvider && validProviders.includes(envProvider as AIProvider)
      ? (envProvider as AIProvider)
      : 'google';
  const model = process.env.DEFAULT_GENERATION_MODEL || 'gemini-2.5-flash';
  return { provider, model };
}

async function* streamDirectProviderFallback(
  opts: RouteGenerationOptions,
  provider: AIProvider,
  model: string
): AsyncGenerator<GenerationEvent> {
  for await (const event of generateWithProvider({
    provider,
    model,
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

  if (hasOutput) {
    return;
  }

  if (!opts.allowDirectProviderFallback) {
    yield {
      type: 'error',
      message:
        'MCP gateway generation failed. Direct-provider fallback is disabled by policy. Retry once MCP is available.',
      timestamp: Date.now(),
    };
    return;
  }

  const fallback = resolveDirectProviderFallback();
  yield {
    type: 'fallback',
    provider: fallback.provider,
    message: `MCP gateway unavailable, falling back to ${fallback.provider}`,
    timestamp: Date.now(),
  };
  yield* streamDirectProviderFallback(opts, fallback.provider, fallback.model);
}

const QUOTA_ERROR_PATTERNS = [
  /quota\s*(exceeded|limit)/i,
  /\b429\b/,
  /rate\s*limit/i,
  /resource_exhausted/i,
  /too\s*many\s*requests/i,
];

const CAPACITY_MESSAGE =
  'AI provider capacity reached. Siza free-tier capacity is unavailable right now. ' +
  'Add a BYOK key in AI Keys or retry in a few minutes.';

function isQuotaError(message?: string): boolean {
  if (!message) return false;
  return QUOTA_ERROR_PATTERNS.some((p) => p.test(message));
}

function canFallbackToAnthropic(opts: RouteGenerationOptions): boolean {
  if (!process.env.ANTHROPIC_API_KEY) {
    return false;
  }

  if (opts.provider !== 'anthropic') {
    return true;
  }

  return !!opts.userApiKey;
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

  if (!canFallbackToAnthropic(opts)) {
    yield {
      type: 'error',
      message: CAPACITY_MESSAGE,
      timestamp: Date.now(),
    };
    return;
  }

  captureServerError(new Error(quotaError.message), {
    route: '/api/generate',
    extra: { fallback: `${opts.provider}-to-anthropic` },
  });

  yield {
    type: 'fallback',
    provider: 'anthropic',
    message:
      opts.provider === 'anthropic'
        ? 'Anthropic BYOK quota exceeded, retrying with server backup capacity'
        : `${opts.provider} quota exceeded, falling back to Anthropic`,
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
    apiKey: undefined,
    contextAddition: opts.contextAddition,
    imageBase64: opts.imageBase64,
    imageMimeType: opts.imageMimeType,
  })) {
    if (event.type === 'complete') break;
    yield event;
  }
}
