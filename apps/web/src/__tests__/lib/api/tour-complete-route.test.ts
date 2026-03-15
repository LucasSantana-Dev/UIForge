import { POST } from '@/app/api/tour/complete/route';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));

const mockEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);
  mockEq.mockResolvedValue({ error: null });
});

describe('POST /api/tour/complete', () => {
  it('marks tour complete and returns success', async () => {
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.completed).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ tour_completed_at: expect.any(String) })
    );
    expect(mockEq).toHaveBeenCalledWith('id', 'u1');
  });

  it('returns 500 when update fails', async () => {
    mockEq.mockResolvedValue({ error: { message: 'db error' } });
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/failed to save tour completion/i);
  });

  it('returns 401 when unauthenticated', async () => {
    mockVerifySession.mockRejectedValue(new Error('not authenticated'));
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });
});
