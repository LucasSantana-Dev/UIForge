import { verifyAdmin } from '@/lib/api/admin';

jest.mock('@/lib/auth/local-auth-bypass', () => ({
  isLocalAuthBypassEnabled: () => false,
  getLocalAuthBypassUser: jest.fn(),
}));

describe('verifyAdmin', () => {
  it('returns null when no authenticated user is present', async () => {
    const supabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: jest.fn(),
    } as any;

    const result = await verifyAdmin(supabase);
    expect(result).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns null when profile is not admin', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    const single = jest.fn().mockResolvedValue({
      data: { role: 'user' },
    });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    const supabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user },
        }),
      },
      from,
    } as any;

    const result = await verifyAdmin(supabase);
    expect(result).toBeNull();
  });

  it('returns user when role is admin', async () => {
    const user = { id: 'admin-1', email: 'admin@example.com' };
    const single = jest.fn().mockResolvedValue({
      data: { role: 'admin' },
    });
    const eq = jest.fn().mockReturnValue({ single });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });

    const supabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user },
        }),
      },
      from,
    } as any;

    const result = await verifyAdmin(supabase);
    expect(result).toEqual(user);
    expect(from).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith('role');
    expect(eq).toHaveBeenCalledWith('id', user.id);
  });
});
