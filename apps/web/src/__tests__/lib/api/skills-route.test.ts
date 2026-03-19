import { GET } from '@/app/api/skills/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/services/skill.service', () => ({
  listSkills: jest.fn(),
}));

import { listSkills } from '@/lib/services/skill.service';
const mockListSkills = listSkills as jest.MockedFunction<typeof listSkills>;

const SKILLS_RESULT = [
  { slug: 'test-skill', name: 'Test Skill', category: 'testing', source_type: 'user' },
  { slug: 'deploy-skill', name: 'Deploy Skill', category: 'deployment', source_type: 'community' },
];

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/skills');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockListSkills.mockResolvedValue(SKILLS_RESULT as never);
});

describe('GET /api/skills', () => {
  it('returns skill list with no filters', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(mockListSkills).toHaveBeenCalledWith({});
  });

  it('passes category filter to service', async () => {
    await GET(makeRequest({ category: 'testing' }));
    expect(mockListSkills).toHaveBeenCalledWith({ category: 'testing' });
  });

  it('passes sourceType filter to service', async () => {
    await GET(makeRequest({ sourceType: 'community' }));
    expect(mockListSkills).toHaveBeenCalledWith({ sourceType: 'community' });
  });

  it('passes framework filter to service', async () => {
    await GET(makeRequest({ framework: 'react' }));
    expect(mockListSkills).toHaveBeenCalledWith({ framework: 'react' });
  });

  it('passes search filter to service', async () => {
    await GET(makeRequest({ search: 'deploy' }));
    expect(mockListSkills).toHaveBeenCalledWith({ search: 'deploy' });
  });

  it('passes tag filter to service', async () => {
    await GET(makeRequest({ tag: 'ci' }));
    expect(mockListSkills).toHaveBeenCalledWith({ tag: 'ci' });
  });

  it('passes multiple filters together', async () => {
    await GET(makeRequest({ category: 'testing', framework: 'react', search: 'unit' }));
    expect(mockListSkills).toHaveBeenCalledWith({
      category: 'testing',
      framework: 'react',
      search: 'unit',
    });
  });

  it('returns empty array when no skills found', async () => {
    mockListSkills.mockResolvedValue([]);
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(0);
  });
});
