import { POST } from '@/app/api/onboarding/complete/route';
import { UnauthorizedError } from '@/lib/api/errors';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));

const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({
  upsert: mockUpsert,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifySession.mockResolvedValue({ user: { id: 'u1', email: 't@t.com' } } as never);
  mockUpsert.mockResolvedValue({ error: null });
});

describe('POST /api/onboarding/complete', () => {
  it('marks onboarding complete and returns success', async () => {
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.completed).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', onboarding_completed_at: expect.any(String) }),
      { onConflict: 'id' }
    );
  });

  it('returns 500 when upsert fails', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'constraint violation' } });
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.message).toMatch(/failed to complete onboarding/i);
  });

  it('returns 401 when unauthenticated', async () => {
    const err = new UnauthorizedError('Unauthorized');
    mockVerifySession.mockRejectedValue(err);
    const res = await POST();

    expect(res.status).toBe(401);
  });
});
