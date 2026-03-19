import { NextResponse } from 'next/server';

export function getInternalValidationToken() {
  return process.env.METRICS_SNAPSHOT_TOKEN;
}

export function getBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function authorizeInternalValidationRequest(request: Request, notConfiguredError: string) {
  const configuredToken = getInternalValidationToken();
  if (!configuredToken) {
    return {
      response: NextResponse.json({ error: notConfiguredError }, { status: 503 }),
    };
  }

  const bearerToken = getBearerToken(request.headers.get('authorization'));
  if (!bearerToken) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (bearerToken !== configuredToken) {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    response: null,
  };
}

export function toInternalValidationErrorResponse(
  error: unknown,
  notConfiguredError: string,
  defaultError: string
) {
  const message = error instanceof Error ? error.message : defaultError;
  if (message.includes('configuration missing')) {
    return NextResponse.json({ error: notConfiguredError }, { status: 503 });
  }
  return NextResponse.json({ error: defaultError }, { status: 500 });
}
