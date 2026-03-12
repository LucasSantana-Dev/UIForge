import { NextResponse } from 'next/server';
import { getCoreFlowValidationReport } from '@/lib/services/core-flow-validation.service';
import { buildInternalCoreFlowValidationReport } from '@/lib/services/core-flow-validation-report.service';

function getSnapshotToken() {
  return process.env.METRICS_SNAPSHOT_TOKEN;
}

function getBearerToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

function toErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to load validation report';
  if (message.includes('configuration missing')) {
    return NextResponse.json(
      { error: 'Validation report endpoint is not configured' },
      { status: 503 }
    );
  }
  return NextResponse.json({ error: 'Failed to load validation report' }, { status: 500 });
}

export async function GET(request: Request) {
  const configuredToken = getSnapshotToken();
  if (!configuredToken) {
    return NextResponse.json(
      { error: 'Validation report endpoint is not configured' },
      { status: 503 }
    );
  }

  const bearerToken = getBearerToken(request.headers.get('authorization'));
  if (!bearerToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (bearerToken !== configuredToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const report = await getCoreFlowValidationReport();
    return NextResponse.json(buildInternalCoreFlowValidationReport(report));
  } catch (error) {
    return toErrorResponse(error);
  }
}
