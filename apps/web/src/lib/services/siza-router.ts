import type { AIProvider } from '@/lib/encryption';

export interface SizaRoutingResult {
  provider: AIProvider;
  model: string;
  reason: 'default' | 'vision' | 'free-tier';
}

const VALID_PROVIDERS: AIProvider[] = ['google', 'openai', 'anthropic'];

function getDefaultProvider(): { provider: AIProvider; model: string } {
  const envProvider = process.env.DEFAULT_GENERATION_PROVIDER;
  const provider: AIProvider =
    envProvider && VALID_PROVIDERS.includes(envProvider as AIProvider)
      ? (envProvider as AIProvider)
      : 'google';
  const model = process.env.DEFAULT_GENERATION_MODEL || 'gemini-2.5-flash';
  return { provider, model };
}

export function routeSizaGeneration(params: {
  prompt: string;
  hasImage: boolean;
  isFreeTier: boolean;
}): SizaRoutingResult {
  const defaults = getDefaultProvider();
  const reason = params.hasImage ? 'vision' : params.isFreeTier ? 'free-tier' : 'default';
  return { provider: defaults.provider, model: defaults.model, reason };
}
