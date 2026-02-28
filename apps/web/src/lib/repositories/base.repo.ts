import { createClient } from '@/lib/supabase/server';
import { captureServerError } from '@/lib/sentry/server';

export type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getClient(): Promise<SupabaseClient> {
  return createClient();
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function paginationRange(
  page = 1,
  limit = 20
): { from: number; to: number } {
  const from = (page - 1) * limit;
  return { from, to: from + limit - 1 };
}

export function handleRepoError(
  error: unknown,
  context: string
): never {
  captureServerError(error, { extra: { repository: context } });
  throw error;
}
