import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client for API routes
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to get user from server
export async function getServerUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

// Helper function to verify user session
export async function verifySession(sessionToken: string) {
  try {
    const { data, error } = await supabaseServer.auth.getUser(sessionToken);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Enhanced error handling wrapper
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);

  // Return user-friendly error messages
  if (error?.code === 'PGRST116') {
    return { error: 'Resource not found', code: 'NOT_FOUND' };
  }

  if (error?.code === 'PGRST301') {
    return { error: 'Unauthorized access', code: 'UNAUTHORIZED' };
  }

  if (error?.code === '23505') {
    return { error: 'Resource already exists', code: 'CONFLICT' };
  }

  return { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' };
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

// Database connection health check
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const { error } = await supabaseServer
      .from('profiles')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      return {
        healthy: false,
        latency,
        error: error.message,
      };
    }

    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      error: (error as Error).message,
    };
  }
}

// Transaction helper for complex operations
export async function createTransaction<T>(
  operations: (() => Promise<any>)[]
): Promise<{ data: T[] | null; error: any }> {
  const results: any[] = [];
  const errors: any[] = [];

  for (const operation of operations) {
    try {
      const result = await operation();
      results.push(result);
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    return { data: null, error: errors };
  }

  return { data: results as T[], error: null };
}

// Pagination helper
export function createPaginationParams(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { offset, limit };
}

// Search helper
export function createSearchQuery(searchTerm: string, columns: string[]) {
  if (!searchTerm.trim()) {
    return {};
  }

  const searchConditions = columns.map(column =>
    `${column}.ilike.%${searchTerm}%`
  );

  return {
    or: searchConditions.join(','),
  };
}
