import {
  createGeneration,
  updateGeneration,
} from '@/lib/repositories/generation.repo';
import { enrichPromptWithContext } from './context-enrichment';
import { storeGenerationEmbedding } from './embeddings';
import { runAllGates, type QualityReport } from '@/lib/quality/gates';
import { incrementGenerationCount } from '@/lib/usage/tracker';

const BORDER_RADIUS_MAP: Record<string, string> = {
  none: '0',
  small: '4px',
  medium: '8px',
  large: '12px',
  full: '9999px',
};

export interface DesignContextParams {
  colorMode?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  animation?: string;
  spacing?: string;
  borderRadius?: string;
  typography?: string;
  brandHeadingFont?: string;
  brandBodyFont?: string;
  brandSemanticColors?: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export function buildDesignContext(params: DesignContextParams): string {
  if (!params.colorMode && !params.primaryColor) return '';

  const parts: string[] = [];
  if (params.colorMode) parts.push(params.colorMode + ' mode');
  if (params.primaryColor) parts.push('primary ' + params.primaryColor);
  if (params.secondaryColor) parts.push('secondary ' + params.secondaryColor);
  if (params.accentColor) parts.push('accent ' + params.accentColor);
  if (params.animation) parts.push(params.animation + ' animations');
  if (params.spacing && params.spacing !== 'default') {
    parts.push(params.spacing + ' spacing');
  }
  if (params.borderRadius) {
    parts.push(
      'border-radius ' + (BORDER_RADIUS_MAP[params.borderRadius] || '8px')
    );
  }
  if (params.typography && params.typography !== 'system') {
    parts.push(params.typography + ' typography');
  }
  if (params.brandHeadingFont) {
    parts.push('heading font: ' + params.brandHeadingFont);
  }
  if (params.brandBodyFont) {
    parts.push('body font: ' + params.brandBodyFont);
  }
  if (params.brandSemanticColors) {
    const sc = params.brandSemanticColors;
    parts.push(
      'semantic colors: success ' +
        sc.success +
        ', warning ' +
        sc.warning +
        ', error ' +
        sc.error +
        ', info ' +
        sc.info
    );
  }

  return '\nDesign context: ' + parts.join(', ') + '.';
}

export async function enrichWithRag(
  description: string,
  options: { framework: string; apiKey?: string }
): Promise<string> {
  try {
    const enrichment = await enrichPromptWithContext(description, options);
    return enrichment.systemPromptAddition;
  } catch {
    return '';
  }
}

export interface GenerationRecordParams {
  userId: string;
  prompt: string;
  framework: string;
  provider: string;
  model: string;
  parentGenerationId?: string | null;
}

export async function createGenerationRecord(
  params: GenerationRecordParams
): Promise<string | null> {
  return createGeneration({
    user_id: params.userId,
    prompt: params.prompt,
    framework: params.framework,
    status: 'processing',
    ai_provider: params.provider,
    model_used: params.model,
    parent_generation_id: params.parentGenerationId,
  });
}

export async function completeGeneration(
  generationId: string,
  code: string,
  provider: string,
  qualityScore: number
): Promise<void> {
  await updateGeneration(generationId, {
    status: 'completed',
    generated_code: code,
    ai_provider: code ? provider : 'google',
    quality_score: qualityScore,
  });
}

export async function failGeneration(
  generationId: string,
  errorMessage: string
): Promise<void> {
  await updateGeneration(generationId, {
    status: 'failed',
    error_message: errorMessage,
  });
}

export function runQualityGates(code: string): QualityReport {
  return runAllGates(code);
}

export async function postGenerationTasks(
  generationId: string,
  description: string,
  userId: string,
  apiKey?: string
): Promise<void> {
  storeGenerationEmbedding(generationId, description, apiKey).catch(() => {});
  incrementGenerationCount(userId).catch(() => {});
}

export function createSseEvent(data: object): string {
  return 'data: ' + JSON.stringify(data) + '\n\n';
}

export interface ConversationContext {
  previousCode: string;
  refinementPrompt: string;
}

export function buildStreamPrompt(
  description: string,
  ctx?: ConversationContext
): string {
  if (ctx) {
    return (
      'Previous code:\n```\n' +
      ctx.previousCode +
      '\n```\n\nRefinement: ' +
      ctx.refinementPrompt
    );
  }
  return description;
}
