import {
  listSkills as repoListSkills,
  getSkillsByIds,
  insertGenerationSkills,
  type SkillRow,
  type SkillFilters,
} from '@/lib/repositories/skill.repo';

const MAX_SKILLS_PER_GENERATION = 3;

export async function listSkills(filters?: SkillFilters): Promise<SkillRow[]> {
  return repoListSkills(filters);
}

export async function buildSkillContext(skillIds: string[]): Promise<string> {
  if (!skillIds.length) return '';

  const ids = skillIds.slice(0, MAX_SKILLS_PER_GENERATION);
  const skills = await getSkillsByIds(ids);
  if (!skills.length) return '';

  const sections = skills.map((s) => `## Skill: ${s.name}\n${s.instructions}`);

  return '\n\n--- Skills Context ---\n' + sections.join('\n\n') + '\n--- End Skills Context ---';
}

export function applySkillRoutingHints(
  skillIds: string[],
  skills: SkillRow[],
  baseComplexity: number
): { complexity: number; preferredProvider?: string; requiresVision: boolean } {
  let complexity = baseComplexity;
  let preferredProvider: string | undefined;
  let requiresVision = false;

  for (const skill of skills) {
    if (!skillIds.includes(skill.id)) continue;
    complexity += Number(skill.complexity_boost) || 0;
    if (skill.preferred_provider && !preferredProvider) {
      preferredProvider = skill.preferred_provider;
    }
    if (skill.requires_vision) requiresVision = true;
  }

  return { complexity, preferredProvider, requiresVision };
}

export async function trackSkillUsage(
  generationId: string,
  skillIds: string[],
  skillParams?: Record<string, Record<string, unknown>>
): Promise<void> {
  const entries = skillIds.slice(0, MAX_SKILLS_PER_GENERATION).map((skillId) => ({
    skillId,
    parameters: skillParams?.[skillId],
  }));

  await insertGenerationSkills(generationId, entries);
}
