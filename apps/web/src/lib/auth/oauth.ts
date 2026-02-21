import { createClient } from '@/lib/supabase/client';

export interface OAuthProvider {
  name: string;
  provider: 'google' | 'github';
  icon: string;
}

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    name: 'Google',
    provider: 'google',
    icon: 'google',
  },
  {
    name: 'GitHub',
    provider: 'github',
    icon: 'github',
  },
];

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = createClient();

  // SSR-safe base URL
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  return signInWithOAuth('google');
}

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub() {
  return signInWithOAuth('github');
}
