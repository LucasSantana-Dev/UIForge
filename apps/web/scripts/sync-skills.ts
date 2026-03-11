import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSkillMd } from '../src/lib/skills/parser.ts';
import type { SkillCategory } from '../src/lib/repositories/skill.types.ts';
import { createServiceRoleClient } from './sync-helpers.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const SKILLS_ROOT = resolve(REPO_ROOT, 'skills');

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferCategory(slug: string, tags: string[]): SkillCategory {
  const source = `${slug} ${tags.join(' ')}`.toLowerCase();
  if (source.includes('accessibility') || source.includes('a11y') || source.includes('wcag')) {
    return 'accessibility';
  }
  if (source.includes('dashboard')) return 'dashboard';
  if (source.includes('form') || source.includes('validation')) return 'form';
  if (source.includes('layout') || source.includes('navigation')) return 'layout';
  if (source.includes('design') || source.includes('figma') || source.includes('wireframe')) {
    return 'design';
  }
  if (source.includes('fullstack') || source.includes('backend')) return 'fullstack';
  if (source.includes('component') || source.includes('ui')) return 'component';
  return 'custom';
}

function inferFrameworks(tags: string[]): string[] {
  const candidates = ['react', 'vue', 'angular', 'svelte'];
  return candidates.filter((framework) => tags.includes(framework));
}

async function main() {
  const supabase = createServiceRoleClient('skills synchronization');

  const { data: currentData, error: currentError } = await supabase
    .from('skills')
    .select('slug,name,category,complexity_boost,preferred_provider,requires_vision,icon')
    .eq('source_type', 'official');
  if (currentError) {
    throw new Error(`Unable to load current skills: ${currentError.message}`);
  }
  const current = new Map((currentData ?? []).map((item) => [item.slug, item]));

  const entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
  const skillDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const payload: Array<Record<string, unknown>> = [];

  for (const slug of skillDirs) {
    const skillPath = join(SKILLS_ROOT, slug, 'SKILL.md');
    let content: string;
    try {
      content = await readFile(skillPath, 'utf8');
    } catch {
      continue;
    }

    const parsed = parseSkillMd(content);
    const tags = parsed.frontmatter.tags ?? [];
    const existing = current.get(slug);
    const inferredRequiresVision =
      tags.includes('vision') || tags.includes('screenshot') || tags.includes('figma');

    payload.push({
      slug,
      name: existing?.name ?? humanizeSlug(parsed.frontmatter.name || slug),
      description: parsed.frontmatter.description,
      instructions: parsed.instructions,
      category: existing?.category ?? inferCategory(slug, tags),
      source_url: `https://github.com/Forge-Space/siza/tree/main/skills/${slug}/SKILL.md`,
      source_type: 'official',
      frameworks: inferFrameworks(tags),
      is_active: true,
      version: parsed.frontmatter.version ?? '1.0.0',
      author: parsed.frontmatter.author ?? 'Forge Space',
      license: parsed.frontmatter.license ?? 'MIT',
      tags,
      allowed_tools: parsed.frontmatter['allowed-tools'] ?? [],
      argument_hint: parsed.frontmatter['argument-hint'] ?? null,
      invocation_mode: parsed.frontmatter['invocation-mode'] ?? 'user',
      raw_frontmatter: parsed.rawFrontmatter,
      complexity_boost: existing?.complexity_boost ?? 0,
      preferred_provider: existing?.preferred_provider ?? null,
      requires_vision: existing?.requires_vision ?? inferredRequiresVision,
      icon: existing?.icon ?? null,
      created_by: null,
    });
  }

  const { data, error } = await supabase
    .from('skills')
    .upsert(payload, { onConflict: 'slug' })
    .select('id, slug, name');

  if (error) {
    throw new Error(`Skills sync failed: ${error.message}`);
  }

  console.log(`Synced ${data?.length ?? 0} official skills from ${SKILLS_ROOT}.`);
  for (const row of data ?? []) {
    console.log(`- ${row.slug} (${row.id})`);
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
