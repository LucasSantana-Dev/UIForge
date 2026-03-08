import { z } from 'zod';

const frontmatterSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().min(1).max(1024),
  version: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional(),
  'allowed-tools': z.array(z.string()).optional(),
  'argument-hint': z.string().optional(),
  'invocation-mode': z
    .enum(['user', 'auto', 'background'])
    .optional()
    .default('user'),
  compatibility: z
    .record(z.string(), z.unknown())
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type SkillFrontmatter = z.infer<typeof frontmatterSchema>;

export interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  instructions: string;
  rawFrontmatter: Record<string, unknown>;
}

function parseYamlValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function extractFrontmatter(
  content: string
): { data: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const yamlBlock = match[1];
  const body = match[2];
  const data: Record<string, unknown> = {};

  for (const line of yamlBlock.split('\n')) {
    const kv = line.match(/^([a-z][a-z0-9-]*)\s*:\s*(.*)$/i);
    if (kv) {
      data[kv[1]] = parseYamlValue(kv[2]);
    }
  }

  return { data, body };
}

export function parseSkillMd(content: string): ParsedSkill {
  const { data, body } = extractFrontmatter(content);
  const frontmatter = frontmatterSchema.parse(data);
  return {
    frontmatter,
    instructions: body.trim(),
    rawFrontmatter: data,
  };
}

export function substituteArguments(
  instructions: string,
  args: string[]
): string {
  let result = instructions.replace(/\$ARGUMENTS/g, args.join(' '));
  for (let i = 0; i < args.length; i++) {
    result = result.replace(new RegExp(`\\$${i}`, 'g'), args[i]);
  }
  return result;
}

export function generateSkillMd(
  frontmatter: Record<string, unknown>,
  instructions: string
): string {
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(', ')}]`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---', '', instructions);
  return lines.join('\n');
}
