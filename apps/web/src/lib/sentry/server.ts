/**
 * Lightweight server-side Sentry error reporting for Cloudflare Workers.
 * Uses the Sentry Envelope API directly — zero additional dependencies.
 * Bundle impact: ~0 KiB (no SDK added).
 */

interface SentryContext {
  route?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

interface ParsedDSN {
  publicKey: string;
  projectId: string;
  host: string;
}

function parseDSN(dsn: string): ParsedDSN | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace('/', '');
    const host = url.hostname;
    return { publicKey, projectId, host };
  } catch {
    return null;
  }
}

function buildEnvelope(error: Error, dsn: ParsedDSN, context: SentryContext): string {
  const eventId = crypto.randomUUID().replace(/-/g, '');
  const timestamp = Date.now() / 1000;

  const header = JSON.stringify({
    event_id: eventId,
    sent_at: new Date().toISOString(),
    dsn: `https://${dsn.publicKey}@${dsn.host}/${dsn.projectId}`,
  });

  const itemHeader = JSON.stringify({ type: 'event' });

  const payload = JSON.stringify({
    event_id: eventId,
    timestamp,
    platform: 'javascript',
    level: 'error',
    server_name: 'siza-web-worker',
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    exception: {
      values: [
        {
          type: error.name,
          value: error.message,
          stacktrace: error.stack
            ? {
                frames: error.stack
                  .split('\n')
                  .slice(1, 10)
                  .map((line: string) => ({ filename: line.trim() })),
              }
            : undefined,
        },
      ],
    },
    tags: {
      ...(context.route && { route: context.route }),
      runtime: 'cloudflare-workers',
    },
    user: context.userId ? { id: context.userId } : undefined,
    extra: context.extra,
  });

  return `${header}\n${itemHeader}\n${payload}`;
}

export function captureServerError(error: unknown, context: SentryContext = {}): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const parsed = parseDSN(dsn);
  if (!parsed) return;

  const err = error instanceof Error ? error : new Error(String(error));

  const envelope = buildEnvelope(err, parsed, context);
  const url = `https://${parsed.host}/api/${parsed.projectId}/envelope/`;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
    body: envelope,
  }).catch(() => {
    // Fire-and-forget: never block request on Sentry failure
  });
}
