import { POST } from '@/app/api/skills/import/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/skills/parser', () => ({
  parseSkillMd: jest.fn(),
}));
jest.mock('@/lib/repositories/skill.repo', () => ({
  upsertSkill: jest.fn(),
}));

const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ auth: { getUser: mockGetUser } })),
}));

import { parseSkillMd } from '@/lib/skills/parser';
import { upsertSkill } from '@/lib/repositories/skill.repo';
const mockParseSkillMd = parseSkillMd as jest.MockedFunction<typeof parseSkillMd>;
const mockUpsertSkill = upsertSkill as jest.MockedFunction<typeof upsertSkill>;

const PARSED_SKILL = {
  frontmatter: {
    name: 'My Skill',
    description: 'A test skill',
    version: '1.0.0',
    author: 'Alice',
    license: 'MIT',
    tags: ['test'],
    'allowed-tools': ['bash'],
    'argument-hint': 'my-arg',
    'invocation-mode': 'user',
  },
  instructions: 'Do the thing.',
  rawFrontmatter: '---\nname: My Skill\n---',
};

const UPSERTED_SKILL = { id: 'skill-1', slug: 'my-skill', name: 'My Skill' };

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/skills/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
  mockParseSkillMd.mockReturnValue(PARSED_SKILL as never);
  mockUpsertSkill.mockResolvedValue(UPSERTED_SKILL as never);
});

describe('POST /api/skills/import', () => {
  it('imports a skill successfully', async () => {
    const res = await POST(
      makeRequest({ content: '---\nname: My Skill\n---\nDo the thing.', slug: 'my-skill' })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.skill).toEqual(UPSERTED_SKILL);
    expect(mockParseSkillMd).toHaveBeenCalled();
    expect(mockUpsertSkill).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'my-skill',
        name: 'My Skill',
        source_type: 'user',
        created_by: 'u1',
        is_active: true,
        category: 'custom',
      })
    );
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(makeRequest({ content: 'some content', slug: 'my-skill' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 400 when content is missing', async () => {
    const res = await POST(makeRequest({ slug: 'my-skill' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing content or slug/i);
  });

  it('returns 400 when slug is missing', async () => {
    const res = await POST(makeRequest({ content: '---\nname: Test\n---\nInstructions.' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing content or slug/i);
  });

  it('passes optional frontmatter fields to upsertSkill', async () => {
    await POST(makeRequest({ content: 'some md', slug: 'test-slug' }));

    expect(mockUpsertSkill).toHaveBeenCalledWith(
      expect.objectContaining({
        version: '1.0.0',
        author: 'Alice',
        license: 'MIT',
        tags: ['test'],
        allowed_tools: ['bash'],
        argument_hint: 'my-arg',
        invocation_mode: 'user',
      })
    );
  });
});
