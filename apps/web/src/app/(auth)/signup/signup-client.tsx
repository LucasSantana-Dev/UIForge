'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { OAuthButton } from '@/components/auth/oauth-button';
import { trackEvent, trackGoogleAdsConversion } from '@/components/analytics/AnalyticsProvider';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth/oauth';
import { getStoredLeadAttribution } from '@/lib/analytics/lead-attribution';
import { AuthSplitShell } from '@/components/migration/migration-primitives';

export function SignUpClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const attribution = getStoredLeadAttribution();
    const leadSource = attribution?.utm_source ?? 'direct';

    trackEvent({
      action: 'lead_signup_started',
      category: 'Lead',
      label: `email:${leadSource}`,
    });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: attribution ? { marketing_attribution: attribution } : undefined,
      },
    });

    if (error) {
      trackEvent({
        action: 'lead_signup_error',
        category: 'Lead',
        label: 'email',
      });
      setError(error.message);
      setLoading(false);
    } else {
      trackEvent({
        action: 'lead_signup_success',
        category: 'Lead',
        label: `email:${leadSource}`,
      });
      trackGoogleAdsConversion('signup');
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setOAuthLoading('google');
    setError(null);
    const attribution = getStoredLeadAttribution();
    const leadSource = attribution?.utm_source ?? 'direct';

    trackEvent({
      action: 'lead_signup_oauth_start',
      category: 'Lead',
      label: `google:${leadSource}`,
    });

    const { error } = await signInWithGoogle();

    if (error) {
      trackEvent({
        action: 'lead_signup_error',
        category: 'Lead',
        label: 'oauth_google',
      });
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  const handleGitHubSignUp = async () => {
    setOAuthLoading('github');
    setError(null);
    const attribution = getStoredLeadAttribution();
    const leadSource = attribution?.utm_source ?? 'direct';

    trackEvent({
      action: 'lead_signup_oauth_start',
      category: 'Lead',
      label: `github:${leadSource}`,
    });

    const { error } = await signInWithGitHub();

    if (error) {
      trackEvent({
        action: 'lead_signup_error',
        category: 'Lead',
        label: 'oauth_github',
      });
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendSuccess(true);
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <AuthSplitShell>
        <div className="w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
              <span className="text-2xl font-display font-bold">Siza</span>
            </Link>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Account confirmation
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve sent you a confirmation link to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Click the link in the email to confirm your account and start using Siza.
            </p>

            {resendSuccess ? (
              <p className="text-center text-sm text-green-600">Verification email resent!</p>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-alt disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            )}

            <Link
              href="/signin"
              className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-hover"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthSplitShell>
    );
  }

  return (
    <AuthSplitShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
            <span className="text-2xl font-display font-bold">Siza</span>
          </Link>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Start your workspace
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start generating beautiful UI components with AI
          </p>
        </div>

        <div>
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_28px_rgba(124,58,237,0.3)] disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <OAuthButton
              provider="google"
              onClick={handleGoogleSignUp}
              disabled={oauthLoading === 'google'}
            />
            <OAuthButton
              provider="github"
              onClick={handleGitHubSignUp}
              disabled={oauthLoading === 'github'}
            />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-violet-400 hover:text-violet-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitShell>
  );
}
