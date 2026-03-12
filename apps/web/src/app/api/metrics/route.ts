import { NextResponse } from 'next/server';
import { getMetricsReport, parseWindowDays } from '@/lib/services/metrics.service';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.METRICS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Metrics endpoint not configured' }, { status: 503 });
  }

  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const windowDays = parseWindowDays(url.searchParams.get('windowDays'));
    const report = await getMetricsReport(windowDays);
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load metrics';
    const status = message.includes('configuration missing') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
