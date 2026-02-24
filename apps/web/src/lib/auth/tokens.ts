import CryptoJS from 'crypto-js';
import { createClient } from '@/lib/supabase/server';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'siza-dev-key-change-in-production';

function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export interface ProviderTokens {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
  scopes?: string[];
}

export async function saveProviderToken(userId: string, provider: string, tokens: ProviderTokens) {
  const supabase = await createClient();

  const { error } = await supabase.from('user_provider_tokens').upsert(
    {
      user_id: userId,
      provider,
      access_token: encrypt(tokens.accessToken),
      refresh_token: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      expires_at: tokens.expiresAt,
      scopes: tokens.scopes ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,provider' }
  );

  if (error) throw error;
}

export async function getProviderToken(
  userId: string,
  provider: string
): Promise<ProviderTokens | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_provider_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();

  if (error || !data) return null;

  return {
    accessToken: decrypt(data.access_token),
    refreshToken: data.refresh_token ? decrypt(data.refresh_token) : null,
    expiresAt: data.expires_at,
    scopes: data.scopes,
  };
}

export async function hasProviderConnection(userId: string, provider: string): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('user_provider_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function deleteProviderToken(userId: string, provider: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_provider_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) throw error;
}
