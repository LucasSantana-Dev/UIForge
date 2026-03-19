import { GET } from '@/app/api/skills/export/[slug]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/repositories/skill.repo', () => ({
  getSkillBySlug: jest.fn(),
}));
jest.mock('@/lib/skills/parser', () => ({
  generateSkillMd: jest.fn(),
}));

import { getSkillBySlug } from '@/lib/repositories/skill.repo';
import { generateSkillMd } from '@/lib/skills/parser';
const mockGetSkillBySlug = getSkillBySlug as jest.MockedFunction<typeof getSkillBySlug>;
const mockGenerateSkillMd = generateSkillMd as jest.MockedFunction<typeof generateSkillMd>;

const SKILL = {
  slug: 'my-skill',
  name: 'My Skill',
  description: 'A test skill',
  version: '1.0.0',
  author: 'Alice',
  license: 'MIT',
  tags: ['test'],
  allowed_tools: ['bash'],
  argument_hint: 'hint',
  invocation_mode: 'agent',
  instructions: 'Do the thing.',
};

const GENERATED_MD = '---\nname: My Skill\n---\nDo the thing.';

function makeRequest(slug: string) {
  return new NextRequest(`http://localhost/api/skills/export/${slug}`);
}

function makeContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSkillBySlug.mockResolvedValue(SKILL as never);
  mockGenerateSkillMd.mockReturnValue(GENERATED_MD);
});

describe('GET /api/skills/export/[slug]', () => {
  it('returns markdown file for existing skill', async () => {
    const res = await GET(makeRequest('my-skill'), makeContext('my-skill'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/markdown');
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="my-skill.skill.md"');
    const text = await res.text();
    expect(text).toBe(GENERATED_MD);
  });

  it('returns 404 when skill not found', async () => {
    mockGetSkillBySlug.mockResolvedValue(null);
    const res = await GET(makeRequest('nonexistent'), makeContext('nonexistent'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Skill not found');
  });

  it('includes optional frontmatter fields when present', async () => {
    await GET(makeRequest('my-skill'), makeContext('my-skill'));

    expect(mockGenerateSkillMd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Skill',
        description: 'A test skill',
        version: '1.0.0',
        author: 'Alice',
        license: 'MIT',
        tags: ['test'],
        'allowed-tools': ['bash'],
        'argument-hint': 'hint',
        'invocation-mode': 'agent',
      }),
      'Do the thing.'
    );
  });

  it('omits optional frontmatter fields when absent', async () => {
    mockGetSkillBySlug.mockResolvedValue({
      ...SKILL,
      version: null,
      author: null,
      license: null,
      tags: [],
      allowed_tools: [],
      argument_hint: null,
      invocation_mode: 'user',
    } as never);

    await GET(makeRequest('my-skill'), makeContext('my-skill'));

    const callArg = mockGenerateSkillMd.mock.calls[0][0];
    expect(callArg).not.toHaveProperty('version');
    expect(callArg).not.toHaveProperty('author');
    expect(callArg).not.toHaveProperty('license');
    expect(callArg).not.toHaveProperty('tags');
    expect(callArg).not.toHaveProperty('allowed-tools');
    expect(callArg).not.toHaveProperty('argument-hint');
    expect(callArg).not.toHaveProperty('invocation-mode');
  });
});
