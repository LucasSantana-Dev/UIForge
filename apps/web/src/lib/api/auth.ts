/**
 * API Authentication Helpers
 * Session verification and authentication utilities
 */

import { createClient } from '@/lib/supabase/server';
import { UnauthorizedError, ForbiddenError } from './errors';
import type { User } from '@supabase/supabase-js';

export interface Session {
  user: User;
}

/**
 * Verify user session from request
 * @throws {UnauthorizedError} if session is invalid
 */
export async function verifySession(): Promise<Session> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError('Authentication required');
  }

  return { user };
}

/**
 * Get optional session (won't throw if not authenticated)
 */
export async function getSession(): Promise<Session | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return { user };
  } catch {
    return null;
  }
}

/**
 * Verify user owns resource by user_id
 */
export function verifyOwnership(userId: string, resourceUserId: string): void {
  if (userId !== resourceUserId) {
    throw new ForbiddenError('You do not own this resource');
  }
}
