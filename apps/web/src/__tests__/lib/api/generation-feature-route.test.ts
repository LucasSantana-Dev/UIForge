import { PATCH } from '@/app/api/generations/[id]/feature/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));

const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockFetchSingle = jest.fn();
const mockFetchEq = jest.fn(() => ({ single: mockFetchSingle }));
const mockFetchSelect = jest.fn(() => ({ eq: mockFetchEq }));

const mockFrom = jest.fn((table: string) => {
  if (table === 'generations') {
    return {
      select: mockFetchSelect,
      update: mockUpdate,
    };
  }
  return {};
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;

const GEN = { id: 'gen-1', user_id: 'u1', is_featured: false };

function makeRequest(id = 'gen-1') {
  return new NextRequest(`http://localhost/api/generations/${id}/feature`, { method: 'PATCH' });
}

async function resolveParams(id = 'gen-1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);
  mockFetchSingle.mockResolvedValue({ data: GEN, error: null });
  mockFetchEq.mockReturnValue({ single: mockFetchSingle });
  mockUpdateEq.mockResolvedValue({ error: null });
});

describe('PATCH /api/generations/[id]/feature', () => {
  it('toggles is_featured from false to true', async () => {
    const { params } = await resolveParams();
    const res = await PATCH(makeRequest(), { params });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.is_featured).toBe(true); // was false, toggled
    expect(mockUpdate).toHaveBeenCalledWith({ is_featured: true });
  });

  it('toggles is_featured from true to false', async () => {
    mockFetchSingle.mockResolvedValue({ data: { ...GEN, is_featured: true }, error: null });
    const { params } = await resolveParams();
    const res = await PATCH(makeRequest(), { params });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.is_featured).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith({ is_featured: false });
  });

  it('returns 404 when generation not found', async () => {
    mockFetchSingle.mockResolvedValue({ data: null, error: null });
    const { params } = await resolveParams();
    const res = await PATCH(makeRequest(), { params });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/not found/i);
  });

  it('returns 403 when generation belongs to another user', async () => {
    mockFetchSingle.mockResolvedValue({
      data: { ...GEN, user_id: 'other-user' },
      error: null,
    });
    const { params } = await resolveParams();
    const res = await PATCH(makeRequest(), { params });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toMatch(/own generations/i);
  });

  it('returns 500 when update fails', async () => {
    mockUpdateEq.mockResolvedValue({ error: { message: 'db error' } });
    const { params } = await resolveParams();
    const res = await PATCH(makeRequest(), { params });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/failed to update/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new Error('Unauthorized'));
    const { params } = await resolveParams();
    const res = await PATCH(makeRequest(), { params });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });
});
