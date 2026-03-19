import { NextResponse } from 'next/server';
import { getCoreFlowValidationReport } from '@/lib/services/core-flow-validation.service';
import { buildInternalCoreFlowValidationReport } from '@/lib/services/core-flow-validation-report.service';
import {
  authorizeInternalValidationRequest,
  toInternalValidationErrorResponse,
} from '@/app/api/internal/validation/shared';

export async function GET(request: Request) {
  const auth = authorizeInternalValidationRequest(
    request,
    'Validation report endpoint is not configured'
  );
  if (auth.response) {
    return auth.response;
  }

  try {
    const report = await getCoreFlowValidationReport();
    return NextResponse.json(buildInternalCoreFlowValidationReport(report));
  } catch (error) {
    return toInternalValidationErrorResponse(
      error,
      'Validation report endpoint is not configured',
      'Failed to load validation report'
    );
  }
}
