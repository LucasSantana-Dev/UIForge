/**
 * Unit Tests for Authentication Helpers
 */

import { verifySession, getSession, verifyOwnership } from '../auth';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('Authentication Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifySession', () => {
    it('should return session for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any);

      const session = await verifySession();

      expect(session.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedError when no user', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any);

      await expect(verifySession()).rejects.toThrow(UnauthorizedError);
      await expect(verifySession()).rejects.toThrow('Authentication required');
    });

    it('should throw UnauthorizedError on auth error', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Auth failed'),
          }),
        },
      } as any);

      await expect(verifySession()).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getSession', () => {
    it('should return session for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any);

      const session = await getSession();

      expect(session).not.toBeNull();
      expect(session?.user).toEqual(mockUser);
    });

    it('should return null when no user', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any);

      const session = await getSession();

      expect(session).toBeNull();
    });

    it('should return null on error', async () => {
      mockCreateClient.mockRejectedValue(new Error('Connection failed'));

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe('verifyOwnership', () => {
    it('should not throw when user owns resource', () => {
      expect(() => verifyOwnership('user-123', 'user-123')).not.toThrow();
    });

    it('should throw ForbiddenError when user does not own resource', () => {
      expect(() => verifyOwnership('user-123', 'user-456')).toThrow(ForbiddenError);
      expect(() => verifyOwnership('user-123', 'user-456')).toThrow('You do not own this resource');
    });
  });
});
