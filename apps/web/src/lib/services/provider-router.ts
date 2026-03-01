import type { AIProvider } from '@/lib/encryption';
import { routeSizaGeneration, getQuotaFallback } from './siza-router';
import type { GenerationEvent } from './gemini';
import { generateComponentStream } from './gemini';
import { generateWithProvider } from './generation';
import { generateComponent } from '@/lib/mcp/client';
import { captureServerError } from '@/lib/sentry/server';
import { canUseFallback, recordFallback } from './fallback-limiter';

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

  const resolvedOpts = {
    ...opts,
    provider: routing.provider,
    model: routing.model,
  };

  let quotaError: GenerationEvent | null = null;
  for await (const event of routeViaProvider(resolvedOpts)) {
    if (event.type === 'error' && isQuotaError(event.message)) {
      quotaError = event;
      break;
    }
    yield event;
  }

  if (!quotaError) return;

  const fallback = getQuotaFallback(routing.provider);
  if (!fallback || !canUseFallback()) {
    yield quotaError;
    return;
  }

  recordFallback();
  yield {
    type: 'fallback',
    provider: fallback.provider,
    message: 'Siza AI routing to alternate provider',
    timestamp: Date.now(),
  };

  const fallbackOpts = {
    ...opts,
    provider: fallback.provider,
    model: fallback.model,
  };

  for await (const event of routeViaProvider(fallbackOpts)) {
    if (event.type === 'complete') break;
    yield event;
  }
}

async function* routeViaMcp(opts: RouteGenerationOptions): AsyncGenerator<GenerationEvent> {
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

const QUOTA_ERROR_PATTERNS = [
  'quota',
  '429',
  'rate limit',
  'resource_exhausted',
  'too many requests',
];

function isQuotaError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return QUOTA_ERROR_PATTERNS.some((p) => lower.includes(p));
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
  if (!serverKeyAvailable || !canUseFallback()) {
    yield quotaError;
    return;
  }

  recordFallback();

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
    contextAddition: opts.contextAddition,
    imageBase64: opts.imageBase64,
    imageMimeType: opts.imageMimeType,
  })) {
    if (event.type === 'complete') break;
    yield event;
  }
}
