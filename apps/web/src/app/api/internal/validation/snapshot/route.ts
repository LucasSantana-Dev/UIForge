import { NextResponse } from 'next/server';
import { captureCoreFlowValidationSnapshot } from '@/lib/services/core-flow-validation.service';
import {
  authorizeInternalValidationRequest,
  toInternalValidationErrorResponse,
} from '@/app/api/internal/validation/shared';

export async function POST(request: Request) {
  const auth = authorizeInternalValidationRequest(request, 'Snapshot endpoint is not configured');
  if (auth.response) {
    return auth.response;
  }

  try {
    const report = await captureCoreFlowValidationSnapshot();
    return NextResponse.json({
      message: 'Snapshot captured',
      capturedSnapshotDate: report.capturedSnapshotDate,
      gate: report.gate,
      current: report.current,
    });
  } catch (error) {
    return toInternalValidationErrorResponse(
      error,
      'Snapshot endpoint is not configured',
      'Failed to capture snapshot'
    );
  }
}
