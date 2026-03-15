import { PATCH, DELETE } from '@/app/api/features/[id]/route';

jest.mock('@/lib/api/admin', () => ({ verifyAdmin: jest.fn() }));

const mockSingle = jest.fn();
const mockSelectEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockSelectEq }));
const mockUpdateEqSelectSingle = jest.fn();
const mockUpdateEqSelect = jest.fn(() => ({ single: mockUpdateEqSelectSingle }));
const mockUpdateEq = jest.fn(() => ({ select: mockUpdateEqSelect }));
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect, update: mockUpdate, delete: mockDelete }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifyAdmin } from '@/lib/api/admin';

const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;

const ADMIN_USER = { id: 'admin-1', email: 'admin@test.com' };
const FLAG = { id: 'flag-1', key: 'ENABLE_FEATURE', enabled: true };

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/features/flag-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(id = 'flag-1') {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyAdmin.mockResolvedValue(ADMIN_USER as never);
  mockSingle.mockResolvedValue({ data: FLAG, error: null });
  mockUpdateEqSelectSingle.mockResolvedValue({ data: { ...FLAG, enabled: false }, error: null });
});

describe('PATCH /api/features/[id]', () => {
  it('updates enabled field', async () => {
    const res = await PATCH(makeRequest({ enabled: false }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(body.data).toMatchObject({ enabled: false });
  });

  it('updates description field', async () => {
    mockUpdateEqSelectSingle.mockResolvedValue({
      data: { ...FLAG, description: 'New desc' },
      error: null,
    });

    const res = await PATCH(makeRequest({ description: 'New desc' }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ description: 'New desc' }));
  });

  it('updates multiple fields at once', async () => {
    await PATCH(makeRequest({ enabled: true, category: 'billing', scope: 'user' }), makeParams());
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true, category: 'billing', scope: 'user' })
    );
  });

  it('returns 403 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValue(null);

    const res = await PATCH(makeRequest({ enabled: false }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('returns 400 when no fields to update', async () => {
    const res = await PATCH(makeRequest({}), makeParams());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/No fields to update/i);
  });

  it('returns 400 on db error', async () => {
    mockUpdateEqSelectSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const res = await PATCH(makeRequest({ enabled: false }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('DB error');
  });

  it('returns 500 on unexpected error', async () => {
    mockVerifyAdmin.mockRejectedValue(new Error('Unexpected'));

    const res = await PATCH(makeRequest({ enabled: false }), makeParams());
    const body = await res.json();

    expect(res.status).toBe(500);
  });

  it('only updates known fields', async () => {
    await PATCH(
      makeRequest({ enabled: true, unknown_field: 'ignored', enabled_for_users: ['u1'] }),
      makeParams()
    );
    const updateArg = (mockUpdate.mock.calls as unknown as Array<[Record<string, unknown>]>)[0][0];
    expect(updateArg).not.toHaveProperty('unknown_field');
    expect(updateArg).toHaveProperty('enabled', true);
    expect(updateArg).toHaveProperty('enabled_for_users', ['u1']);
  });
});

describe('DELETE /api/features/[id]', () => {
  it('deletes feature flag', async () => {
    const res = await DELETE(new Request('http://localhost/api/features/flag-1'), makeParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('Deleted');
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'flag-1');
  });

  it('returns 403 when not admin', async () => {
    mockVerifyAdmin.mockResolvedValue(null);

    const res = await DELETE(new Request('http://localhost/api/features/flag-1'), makeParams());
    const body = await res.json();

    expect(res.status).toBe(403);
  });

  it('returns 400 on db error', async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: 'Cannot delete' } });

    const res = await DELETE(new Request('http://localhost/api/features/flag-1'), makeParams());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Cannot delete');
  });

  it('returns 500 on unexpected error', async () => {
    mockVerifyAdmin.mockRejectedValue(new Error('Unexpected'));

    const res = await DELETE(new Request('http://localhost/api/features/flag-1'), makeParams());
    expect(res.status).toBe(500);
  });
});
