import { createClient } from '@/lib/supabase/server';
import { saveProviderToken } from '@/lib/auth/tokens';
import { sendWelcomeEmail } from '@/lib/email/auth-emails';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/projects';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const { session } = data;
      const isNewUser = session.user.created_at === session.user.updated_at;

      if (session.provider_token && session.user) {
        const tokenProvider = session.user.app_metadata?.provider ?? 'unknown';

        try {
          await saveProviderToken(session.user.id, tokenProvider, {
            accessToken: session.provider_token,
            refreshToken: session.provider_refresh_token,
          });
        } catch {
          // Token persistence is non-blocking
        }
      }

      const provider = session.user.app_metadata?.provider ?? 'unknown';
      const isEmailVerification = provider === 'email' && isNewUser;

      if (isNewUser && session.user.email) {
        sendWelcomeEmail(session.user.email).catch(() => {});
      }

      if (isNewUser) {
        const onboardingEnabled = process.env.NEXT_PUBLIC_ENABLE_ONBOARDING === 'true';
        const verifiedParam = isEmailVerification ? '?email_verified=1' : '';
        if (onboardingEnabled) {
          return NextResponse.redirect(`${origin}/onboarding${verifiedParam}`);
        }
        return NextResponse.redirect(`${origin}${next}${verifiedParam}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
