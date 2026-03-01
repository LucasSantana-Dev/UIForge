'use client';

import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
        const url = new URL(dsn);
        const projectId = url.pathname.replace('/', '');
        const host = url.hostname;
        const eventId = crypto.randomUUID().replace(/-/g, '');
        const envelope = [
          JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString(), dsn }),
          JSON.stringify({ type: 'event' }),
          JSON.stringify({
            event_id: eventId,
            timestamp: Date.now() / 1000,
            platform: 'javascript',
            level: 'fatal',
            environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',
            exception: { values: [{ type: error.name, value: error.message }] },
            tags: { handler: 'global-error' },
          }),
        ].join('\n');
        fetch(`https://${host}/api/${projectId}/envelope/`, {
          method: 'POST',
          body: envelope,
        }).catch(() => {});
      } catch {
        // Sentry reporting is best-effort
      }
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError title="Something went wrong" statusCode={500} withDarkMode={true} />
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
