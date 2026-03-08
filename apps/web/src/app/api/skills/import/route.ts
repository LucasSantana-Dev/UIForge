import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseSkillMd } from '@/lib/skills/parser';
import { upsertSkill } from '@/lib/repositories/skill.repo';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { content, slug } = body as { content: string; slug: string };

  if (!content || !slug) {
    return NextResponse.json({ error: 'Missing content or slug' }, { status: 400 });
  }

  const parsed = parseSkillMd(content);

  const skill = await upsertSkill({
    slug,
    name: parsed.frontmatter.name,
    description: parsed.frontmatter.description,
    instructions: parsed.instructions,
    version: parsed.frontmatter.version ?? null,
    author: parsed.frontmatter.author ?? null,
    license: parsed.frontmatter.license ?? null,
    tags: parsed.frontmatter.tags ?? [],
    allowed_tools: parsed.frontmatter['allowed-tools'] ?? [],
    argument_hint: parsed.frontmatter['argument-hint'] ?? null,
    invocation_mode: parsed.frontmatter['invocation-mode'] ?? 'user',
    raw_frontmatter: parsed.rawFrontmatter,
    source_type: 'user',
    created_by: user.id,
    is_active: true,
    category: 'custom',
    frameworks: [],
    complexity_boost: 0,
    requires_vision: false,
    install_count: 0,
  });

  return NextResponse.json({ skill });
}
