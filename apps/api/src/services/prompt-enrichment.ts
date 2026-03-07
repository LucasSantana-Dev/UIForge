import { assembleContext } from '@forgespace/siza-gen/lite';

export function getEnrichedSystemPrompt(
  basePrompt: string,
  framework: string,
  componentLibrary?: string
): string {
  try {
    const result = assembleContext({
      framework,
      componentLibrary,
      tokenBudget: 2000,
    });
    return result.systemPrompt ? basePrompt + '\n\n' + result.systemPrompt : basePrompt;
  } catch {
    return basePrompt;
  }
}
