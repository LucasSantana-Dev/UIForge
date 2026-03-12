import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { getMetricsReport, parseWindowDays } from '@/lib/services/metrics.service';

function toErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to load metrics';
  if (message.includes('configuration missing')) {
    return NextResponse.json({ error: 'Metrics service is not configured' }, { status: 503 });
  }
  return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const user = await verifyAdmin(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const windowDays = parseWindowDays(url.searchParams.get('windowDays'));
    const report = await getMetricsReport(windowDays);
    return NextResponse.json(report);
  } catch (error) {
    return toErrorResponse(error);
  }
}
