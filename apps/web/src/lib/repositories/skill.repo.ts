import { getClient } from './base.repo';

export type SkillCategory =
  | 'component'
  | 'form'
  | 'layout'
  | 'dashboard'
  | 'design'
  | 'accessibility'
  | 'fullstack'
  | 'custom';

export type SkillSourceType = 'official' | 'community' | 'user';

export interface SkillRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SkillCategory;
  instructions: string;
  source_url: string | null;
  source_type: SkillSourceType;
  parameter_schema: Record<string, unknown> | null;
  preferred_provider: string | null;
  complexity_boost: number;
  requires_vision: boolean;
  icon: string | null;
  frameworks: string[];
  install_count: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillFilters {
  category?: SkillCategory;
  sourceType?: SkillSourceType;
  framework?: string;
  search?: string;
}

const skillCache = new Map<string, { data: SkillRow; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key: string): SkillRow | null {
  const entry = skillCache.get(key);
  if (!entry || Date.now() > entry.expiry) {
    skillCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: SkillRow): void {
  skillCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

export async function listSkills(filters?: SkillFilters): Promise<SkillRow[]> {
  const supabase = await getClient();
  let query = supabase
    .from('skills')
    .select('*')
    .eq('is_active', true)
    .order('install_count', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.sourceType) {
    query = query.eq('source_type', filters.sourceType);
  }
  if (filters?.framework) {
    query = query.contains('frameworks', [filters.framework]);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data } = await query;
  return (data as unknown as SkillRow[]) ?? [];
}

export async function getSkillById(id: string): Promise<SkillRow | null> {
  const cached = getCached(id);
  if (cached) return cached;

  const supabase = await getClient();
  const { data } = await supabase.from('skills').select('*').eq('id', id).single();

  const skill = data as unknown as SkillRow | null;
  if (skill) setCache(id, skill);
  return skill;
}

export async function getSkillsByIds(ids: string[]): Promise<SkillRow[]> {
  const uncachedIds: string[] = [];
  const results: SkillRow[] = [];

  for (const id of ids) {
    const cached = getCached(id);
    if (cached) {
      results.push(cached);
    } else {
      uncachedIds.push(id);
    }
  }

  if (uncachedIds.length > 0) {
    const supabase = await getClient();
    const { data } = await supabase.from('skills').select('*').in('id', uncachedIds);

    const skills = (data as unknown as SkillRow[]) ?? [];
    for (const skill of skills) {
      setCache(skill.id, skill);
      results.push(skill);
    }
  }

  return results;
}

export async function insertGenerationSkills(
  generationId: string,
  skills: Array<{ skillId: string; parameters?: Record<string, unknown> }>
): Promise<void> {
  const supabase = await getClient();
  await supabase.from('generation_skills').insert(
    skills.map((s) => ({
      generation_id: generationId,
      skill_id: s.skillId,
      skill_parameters: s.parameters ?? null,
    })) as any
  );
}

export async function getUserFavoriteSkillIds(userId: string): Promise<string[]> {
  const supabase = await getClient();
  const { data } = await supabase
    .from('user_skill_favorites')
    .select('skill_id')
    .eq('user_id', userId);

  return (data as unknown as Array<{ skill_id: string }>)?.map((r) => r.skill_id) ?? [];
}

export async function toggleSkillFavorite(
  userId: string,
  skillId: string,
  isFavorite: boolean
): Promise<void> {
  const supabase = await getClient();
  if (isFavorite) {
    await supabase
      .from('user_skill_favorites')
      .insert({ user_id: userId, skill_id: skillId } as any);
  } else {
    await supabase
      .from('user_skill_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillId);
  }
}
