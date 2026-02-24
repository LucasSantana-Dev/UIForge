import { TaskType } from '@google/generative-ai';
import {
  generateEmbedding,
  findSimilarGenerations,
  findSimilarPatterns,
  type SimilarGeneration,
  type SimilarPattern,
} from './embeddings';

export interface EnrichmentContext {
  similarGenerations: SimilarGeneration[];
  similarPatterns: SimilarPattern[];
  systemPromptAddition: string;
}

export interface EnrichmentOptions {
  maxGenerations?: number;
  maxPatterns?: number;
  minQuality?: number;
  generationThreshold?: number;
  patternThreshold?: number;
  framework?: string;
  apiKey?: string;
}

export async function enrichPromptWithContext(
  prompt: string,
  options?: EnrichmentOptions
): Promise<EnrichmentContext> {
  const queryEmbedding = await generateEmbedding(prompt, TaskType.RETRIEVAL_QUERY, options?.apiKey);

  const [generations, patterns] = await Promise.all([
    findSimilarGenerations(queryEmbedding, {
      limit: options?.maxGenerations ?? 3,
      minQuality: options?.minQuality ?? 0.7,
      threshold: options?.generationThreshold ?? 0.7,
    }),
    findSimilarPatterns(queryEmbedding, {
      limit: options?.maxPatterns ?? 2,
      threshold: options?.patternThreshold ?? 0.5,
    }),
  ]);

  const filtered = options?.framework
    ? {
        generations: generations.filter((g) => g.framework === options.framework),
        patterns: patterns.filter((p) => p.framework === options.framework),
      }
    : { generations, patterns };

  const systemPromptAddition = buildContextBlock(filtered.generations, filtered.patterns);

  return {
    similarGenerations: filtered.generations,
    similarPatterns: filtered.patterns,
    systemPromptAddition,
  };
}

function buildContextBlock(generations: SimilarGeneration[], patterns: SimilarPattern[]): string {
  if (generations.length === 0 && patterns.length === 0) return '';

  const parts: string[] = [];
  parts.push('Use the following examples as reference for style and quality:');

  for (const gen of generations) {
    parts.push(`\n--- Past Generation (quality: ${gen.quality_score}) ---`);
    parts.push(`Prompt: ${gen.prompt}`);
    parts.push(`Code:\n${truncateCode(gen.generated_code, 1500)}`);
  }

  for (const pat of patterns) {
    parts.push(`\n--- Pattern: ${pat.name} (${pat.category}) ---`);
    parts.push(`Description: ${pat.description}`);
    parts.push(`Code:\n${truncateCode(pat.code, 1500)}`);
  }

  parts.push('\nGenerate code that matches or exceeds the quality ' + 'of these examples.');

  return parts.join('\n');
}

function truncateCode(code: string, maxLength: number): string {
  if (code.length <= maxLength) return code;
  return code.slice(0, maxLength) + '\n// ... (truncated)';
}
