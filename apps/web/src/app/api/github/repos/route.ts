import { verifySession } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { listRepos } from '@/lib/github/operations';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { user } = await verifySession();
    const supabase = await createClient();

    const { data: installations, error } = await supabase
      .from('github_installations')
      .select('*')
      .eq('user_id', user.id)
      .is('suspended_at', null);

    if (error) throw error;
    if (!installations?.length) {
      return NextResponse.json({ repos: [], installations: [] });
    }

    const allRepos = await Promise.all(
      installations.map(async (inst) => {
        const repos = await listRepos(inst.installation_id);
        return repos.map((r) => ({
          ...r,
          installationId: inst.id,
          accountLogin: inst.account_login,
        }));
      })
    );

    return NextResponse.json({
      repos: allRepos.flat(),
      installations: installations.map((i) => ({
        id: i.id,
        installationId: i.installation_id,
        accountLogin: i.account_login,
        accountType: i.account_type,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list repos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
