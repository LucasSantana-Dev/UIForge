import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { getCoreFlowValidationReport } from '@/lib/services/core-flow-validation.service';
import { parseWindowDays } from '@/lib/services/metrics.service';

function toErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to load validation metrics';
  if (message.includes('configuration missing')) {
    return NextResponse.json({ error: 'Core-flow validation is not configured' }, { status: 503 });
  }
  return NextResponse.json({ error: 'Failed to load validation metrics' }, { status: 500 });
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
    const report = await getCoreFlowValidationReport(new Date(), windowDays);
    return NextResponse.json(report);
  } catch (error) {
    return toErrorResponse(error);
  }
}
