import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { parseWindowDays } from '@/lib/services/metrics.service';
import { getSecurityTelemetryReport } from '@/lib/services/security-telemetry.service';

function resolveFailureStatus(error: unknown): 503 | 500 {
  if (error instanceof Error && error.message.includes('configuration missing')) {
    return 503;
  }
  return 500;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const windowDays = parseWindowDays(url.searchParams.get('windowDays'));
  const supabase = await createClient();
  const adminUser = await verifyAdmin(supabase);
  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const report = await getSecurityTelemetryReport(windowDays);
    return NextResponse.json(report);
  } catch (error) {
    const status = resolveFailureStatus(error);
    const message =
      status === 503
        ? 'Security telemetry service is not configured'
        : 'Failed to load security telemetry';
    return NextResponse.json({ error: message }, { status });
  }
}
