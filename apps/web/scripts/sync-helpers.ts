import { createClient } from '@supabase/supabase-js';

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function resolveSupabaseUrl(context: string): string {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL;
  if (!supabaseUrl) {
    throw new Error(`Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL for ${context}.`);
  }
  return supabaseUrl;
}

export function createServiceRoleClient(context: string) {
  const supabaseUrl = resolveSupabaseUrl(context);
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
