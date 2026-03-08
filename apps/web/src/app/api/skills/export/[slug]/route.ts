import { NextRequest, NextResponse } from 'next/server';
import { getSkillBySlug } from '@/lib/repositories/skill.repo';
import { generateSkillMd } from '@/lib/skills/parser';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json(
      { error: 'Skill not found' },
      { status: 404 }
    );
  }

  const frontmatter: Record<string, unknown> = {
    name: skill.name,
    description: skill.description,
  };

  if (skill.version) frontmatter.version = skill.version;
  if (skill.author) frontmatter.author = skill.author;
  if (skill.license) frontmatter.license = skill.license;
  if (skill.tags?.length) frontmatter.tags = skill.tags;
  if (skill.allowed_tools?.length) {
    frontmatter['allowed-tools'] = skill.allowed_tools;
  }
  if (skill.argument_hint) {
    frontmatter['argument-hint'] = skill.argument_hint;
  }
  if (skill.invocation_mode !== 'user') {
    frontmatter['invocation-mode'] = skill.invocation_mode;
  }

  const md = generateSkillMd(frontmatter, skill.instructions);

  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${slug}.skill.md"`,
    },
  });
}
