import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchAuditEvents, fetchAuditSummary } from '@/lib/audit/client';
import { isLocalAuthBypassEnabled } from '@/lib/auth/local-auth-bypass';

async function requireAdmin(_req: NextRequest) {
  if (isLocalAuthBypassEnabled()) {
    console.warn('[SECURITY] Admin auth bypass active for audit endpoint');
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden');
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    const status = msg === 'Forbidden' ? 403 : 401;
    return NextResponse.json({ error: msg }, { status });
  }

  const { searchParams } = new URL(req.url);
  const summary = searchParams.get('summary');

  try {
    if (summary === 'true') {
      const data = await fetchAuditSummary();
      return NextResponse.json(data);
    }

    const data = await fetchAuditEvents({
      page: Number(searchParams.get('page') ?? 1),
      page_size: Number(searchParams.get('page_size') ?? 50),
      event_type: searchParams.get('event_type') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      user_id: searchParams.get('user_id') ?? undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Audit fetch failed';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
