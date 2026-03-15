import { GET } from '@/app/api/gallery/route';
import { NextRequest } from 'next/server';

// Mock chain – individual steps are reassignable per test
const mockRange = jest.fn();
const mockOrder2 = jest.fn(() => ({ range: mockRange }));
const mockOrder = jest.fn(() => ({ order: mockOrder2, range: mockRange }));
const mockEqFramework = jest.fn(() => ({ order: mockOrder }));
const mockEqStatus = jest.fn(() => ({ order: mockOrder, eq: mockEqFramework }));
const mockEqFeatured = jest.fn(() => ({ eq: mockEqStatus }));
const mockSelect = jest.fn(() => ({ eq: mockEqFeatured }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/gallery');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

const sampleGenerations = [
  { id: 'gen-1', prompt: 'A button', framework: 'react', quality_score: 90 },
  { id: 'gen-2', prompt: 'A card', framework: 'vue', quality_score: 85 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockRange.mockResolvedValue({ data: sampleGenerations, count: 2, error: null });
  mockOrder.mockReturnValue({ order: mockOrder2, range: mockRange });
  mockOrder2.mockReturnValue({ range: mockRange });
  mockEqStatus.mockReturnValue({ order: mockOrder, eq: mockEqFramework });
  mockEqFeatured.mockReturnValue({ eq: mockEqStatus });
  mockEqFramework.mockReturnValue({ order: mockOrder });
});

describe('GET /api/gallery', () => {
  it('returns featured generations with default pagination', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.generations).toHaveLength(2);
    expect(body.pagination).toEqual({ page: 1, limit: 12, total: 2, totalPages: 1 });
    expect(body.message).toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith('generations');
  });

  it('applies framework filter', async () => {
    await GET(makeRequest({ framework: 'react' }));
    expect(mockEqFramework).toHaveBeenCalledWith('framework', 'react');
  });

  it('calculates correct offset for page 2', async () => {
    mockRange.mockResolvedValue({ data: [], count: 25, error: null });
    const res = await GET(makeRequest({ page: '2', limit: '12' }));
    const body = await res.json();
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.totalPages).toBe(3);
    expect(mockRange).toHaveBeenCalledWith(12, 23);
  });

  it('adds empty state message when total is 0', async () => {
    mockRange.mockResolvedValue({ data: [], count: 0, error: null });
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.generations).toHaveLength(0);
    expect(body.message).toBe('No featured generations available yet.');
  });

  it('returns 500 on database error', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: { message: 'connection lost' } });
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe('Failed to fetch gallery');
  });
});
