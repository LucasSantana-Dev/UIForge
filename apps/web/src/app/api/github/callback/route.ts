import { verifySession } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');

  if (!installationId || setupAction !== 'install') {
    return NextResponse.redirect(`${origin}/dashboard?error=github_install_failed`);
  }

  try {
    const { user } = await verifySession();
    const supabase = await createClient();

    const { error } = await supabase.from('github_installations').upsert(
      {
        user_id: user.id,
        installation_id: parseInt(installationId, 10),
        account_login: user.user_metadata?.user_name ?? 'unknown',
        account_type: 'User',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'installation_id' }
    );

    if (error) throw error;

    return NextResponse.redirect(`${origin}/dashboard?github=connected`);
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?error=github_install_failed`);
  }
}
