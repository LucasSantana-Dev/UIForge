export const dynamic = 'force-dynamic';

import { DashboardClient } from './dashboard-client';
import { createClient } from '@/lib/supabase/server';
import { getCoreFlowUserProgress } from '@/lib/services/core-flow-activation.service';

export default async function DashboardPage() {
  let initialActivationProgress = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      initialActivationProgress = await getCoreFlowUserProgress(user.id);
    }
  } catch {
    initialActivationProgress = null;
  }

  return <DashboardClient initialActivationProgress={initialActivationProgress} />;
}
