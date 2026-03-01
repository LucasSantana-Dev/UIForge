import type { AIProvider } from '@/lib/encryption';

export interface SizaRoutingResult {
  provider: AIProvider;
  model: string;
  reason: 'default' | 'vision' | 'quality' | 'free-tier' | 'quota-fallback';
}

const COMPLEXITY_KEYWORDS = [
  'state management',
  'animation',
  'api',
  'fetch',
  'authentication',
  'form validation',
  'drag and drop',
  'real-time',
  'websocket',
  'canvas',
  'chart',
  'graph',
  'dashboard',
  'crud',
  'pagination',
  'infinite scroll',
  'virtualized',
  'complex',
  'advanced',
];

export function analyzePromptComplexity(prompt: string): number {
  const words = prompt.trim().split(/\s+/).length;
  const wordScore = Math.min(words / 200, 0.5);

  const lower = prompt.toLowerCase();
  const keywordHits = COMPLEXITY_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const keywordScore = Math.min(keywordHits / 5, 0.5);

  return Math.min(wordScore + keywordScore, 1.0);
}

export function routeSizaGeneration(params: {
  prompt: string;
  hasImage: boolean;
  isFreeTier: boolean;
}): SizaRoutingResult {
  if (params.hasImage) {
    return { provider: 'google', model: 'gemini-2.0-flash', reason: 'vision' };
  }

  if (params.isFreeTier) {
    return { provider: 'google', model: 'gemini-2.0-flash', reason: 'free-tier' };
  }

  const complexity = analyzePromptComplexity(params.prompt);
  if (complexity >= 0.6) {
    return {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      reason: 'quality',
    };
  }

  return { provider: 'google', model: 'gemini-2.0-flash', reason: 'default' };
}

export function getQuotaFallback(currentProvider: AIProvider): SizaRoutingResult | null {
  if (currentProvider === 'google') {
    if (process.env.ANTHROPIC_API_KEY) {
      return {
        provider: 'anthropic',
        model: 'claude-haiku-4-5-20251001',
        reason: 'quota-fallback',
      };
    }
    return null;
  }
  return { provider: 'google', model: 'gemini-2.0-flash', reason: 'quota-fallback' };
}
