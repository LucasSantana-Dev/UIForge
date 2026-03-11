import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getLocalAuthBypassUser, isLocalAuthBypassEnabled } from '@/lib/auth/local-auth-bypass';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { TourProvider } from '@/components/tour/TourProvider';
import { AppProviders } from '@/components/providers/app-providers';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const bypassEnabled = isLocalAuthBypassEnabled();
  let user: User | null = null;
  let isAdmin = false;
  let tourCompleted = true;

  if (bypassEnabled) {
    user = getLocalAuthBypassUser();
    isAdmin = true;
  } else {
    const supabase = await createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    if (!sessionUser) {
      redirect('/signin');
    }

    user = sessionUser;
    let profile: Record<string, unknown> | null = null;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, onboarding_completed_at, tour_completed_at')
      .eq('id', sessionUser.id)
      .single();

    if (profileError) {
      const { data: fallback } = await supabase
        .from('profiles')
        .select('role, onboarding_completed_at')
        .eq('id', sessionUser.id)
        .single();
      profile = fallback;
    } else {
      profile = profileData;
    }

    isAdmin = profile?.role === 'admin';

    if (!profile?.onboarding_completed_at) {
      redirect('/onboarding');
    }
    tourCompleted = !!profile?.tour_completed_at;
  }

  return (
    <AppProviders>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar user={user} isAdmin={isAdmin} />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8"
          >
            <TourProvider tourCompleted={tourCompleted}>
              <DashboardShell>{children}</DashboardShell>
            </TourProvider>
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
