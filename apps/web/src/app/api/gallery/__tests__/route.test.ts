import { NextRequest } from 'next/server';
import { GET } from '../route';

const mockResult = {
  data: [] as any[],
  count: 0,
  error: null as any,
};

const chainable: any = {};
chainable.select = jest.fn(() => chainable);
chainable.eq = jest.fn(() => chainable);
chainable.order = jest.fn(() => chainable);
chainable.range = jest.fn(() => Promise.resolve(mockResult));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => chainable),
  })),
}));

const mockGenerations = [
  {
    id: 'g1',
    prompt: 'Build a login form',
    component_name: 'LoginForm',
    generated_code: '<form>...</form>',
    framework: 'react',
    quality_score: 0.9,
    created_at: '2026-03-08',
  },
  {
    id: 'g2',
    prompt: 'Build a navbar',
    component_name: 'Navbar',
    generated_code: '<nav>...</nav>',
    framework: 'vue',
    quality_score: 0.85,
    created_at: '2026-03-07',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  chainable.select.mockReturnValue(chainable);
  chainable.eq.mockReturnValue(chainable);
  chainable.order.mockReturnValue(chainable);
  mockResult.data = mockGenerations;
  mockResult.count = 2;
  mockResult.error = null;
  chainable.range.mockResolvedValue({ ...mockResult });
});

describe('GET /api/gallery', () => {
  it('returns featured generations', async () => {
    const req = new NextRequest('http://localhost/api/gallery');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.generations).toHaveLength(2);
    expect(body.pagination.total).toBe(2);
    expect(body.pagination.page).toBe(1);
  });

  it('supports pagination', async () => {
    const req = new NextRequest('http://localhost/api/gallery?page=2&limit=6');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(6);
  });

  it('supports framework filter', async () => {
    const req = new NextRequest('http://localhost/api/gallery?framework=react');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(chainable.eq).toHaveBeenCalledWith('framework', 'react');
  });

  it('returns empty array when no featured', async () => {
    chainable.range.mockResolvedValue({ data: [], count: 0, error: null });

    const req = new NextRequest('http://localhost/api/gallery');
    const res = await GET(req);
    const body = await res.json();

    expect(body.generations).toHaveLength(0);
    expect(body.pagination.total).toBe(0);
    expect(body.pagination.totalPages).toBe(0);
  });

  it('returns 500 on database error', async () => {
    chainable.range.mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'DB error' },
    });

    const req = new NextRequest('http://localhost/api/gallery');
    const res = await GET(req);

    expect(res.status).toBe(500);
  });

  it('defaults to page 1 and limit 12', async () => {
    const req = new NextRequest('http://localhost/api/gallery');
    const res = await GET(req);
    const body = await res.json();

    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(12);
  });
});
