import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendReengagementEmail } from '@/lib/email/auth-emails';

const MIN_AGE_DAYS = 3;
const MAX_BATCH = 100;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Service role not configured');
  return createClient(url, key);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const cutoff = new Date(Date.now() - MIN_AGE_DAYS * 86_400_000).toISOString();

  // Users who have at least one generation
  const { data: activeUsers } = await supabase
    .from('generations')
    .select('user_id')
    .not('user_id', 'is', null);

  const activeIds = (activeUsers ?? []).map((r) => r.user_id as string);

  // Auth users created before the cutoff window
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: MAX_BATCH });
  const candidates = (authData?.users ?? []).filter(
    (u) =>
      u.email &&
      u.email_confirmed_at &&
      new Date(u.created_at) < new Date(cutoff) &&
      !activeIds.includes(u.id)
  );

  if (candidates.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No eligible users' });
  }

  const results = await Promise.allSettled(
    candidates.map((u) => {
      const firstName = (u.user_metadata?.full_name as string | undefined)?.split(' ')[0];
      return sendReengagementEmail(u.email!, firstName);
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({ sent, failed, total: candidates.length });
}
