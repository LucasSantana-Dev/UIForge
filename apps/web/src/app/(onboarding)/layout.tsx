import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { isLocalAuthBypassEnabled } from '@/lib/auth/local-auth-bypass';
import { AppProviders } from '@/components/providers/app-providers';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  if (isLocalAuthBypassEnabled()) {
    return (
      <AppProviders>
        <main className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
          {children}
        </main>
      </AppProviders>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed_at) {
    redirect('/projects');
  }

  return (
    <AppProviders>
      <main className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
        {children}
      </main>
    </AppProviders>
  );
}
