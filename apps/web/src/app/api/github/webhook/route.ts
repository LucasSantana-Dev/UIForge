import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!signature || !verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = request.headers.get('x-github-event');
  const payload = JSON.parse(body);
  const supabase = await createClient();

  if (event === 'installation') {
    if (payload.action === 'created') {
      await supabase.from('github_installations').upsert(
        {
          installation_id: payload.installation.id,
          user_id: payload.sender.id.toString(),
          account_login: payload.installation.account.login,
          account_type: payload.installation.account.type,
          permissions: payload.installation.permissions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'installation_id' }
      );
    }

    if (payload.action === 'deleted') {
      await supabase
        .from('github_installations')
        .delete()
        .eq('installation_id', payload.installation.id);
    }

    if (payload.action === 'suspend') {
      await supabase
        .from('github_installations')
        .update({ suspended_at: new Date().toISOString() })
        .eq('installation_id', payload.installation.id);
    }

    if (payload.action === 'unsuspend') {
      await supabase
        .from('github_installations')
        .update({ suspended_at: null })
        .eq('installation_id', payload.installation.id);
    }
  }

  if (event === 'installation_repositories') {
    const { data: inst } = await supabase
      .from('github_installations')
      .select('id')
      .eq('installation_id', payload.installation.id)
      .single();

    if (inst) {
      if (payload.repositories_added?.length) {
        const repos = payload.repositories_added.map((r: { id: number; full_name: string }) => ({
          installation_id: inst.id,
          github_repo_id: r.id,
          full_name: r.full_name,
        }));
        await supabase.from('github_repos').upsert(repos, {
          onConflict: 'github_repo_id',
        });
      }

      if (payload.repositories_removed?.length) {
        const ids = payload.repositories_removed.map((r: { id: number }) => r.id);
        await supabase.from('github_repos').delete().in('github_repo_id', ids);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
