'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { OAuthButton } from '@/components/auth/oauth-button';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth/oauth';
import { AuthCardShell } from '@/components/migration/migration-primitives';

export function SignInClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/projects');
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setOAuthLoading('google');
    setError(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setOAuthLoading('github');
    setError(null);

    const { error } = await signInWithGitHub();

    if (error) {
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  return (
    <AuthCardShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
            <span className="text-2xl font-display font-bold">Siza</span>
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-foreground">Sign in to Siza</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back to the premium AI coding platform
          </p>
        </div>

        <div>
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_28px_rgba(124,58,237,0.3)] disabled:opacity-50 transition-all"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <OAuthButton
              provider="google"
              onClick={handleGoogleSignIn}
              disabled={oauthLoading === 'google'}
            />
            <OAuthButton
              provider="github"
              onClick={handleGitHubSignIn}
              disabled={oauthLoading === 'github'}
            />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-violet-400 hover:text-violet-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthCardShell>
  );
}
