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
