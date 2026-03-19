'use client';

import { useEffect } from 'react';
import { forgeTokens } from '@/styles/design-tokens';

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
  }, [error]);

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          margin: 0,
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: forgeTokens.bg,
            color: forgeTokens.text,
          }}
        >
          <h2
            style={{
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              fontSize: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            Something went wrong
          </h2>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <p
              style={{
                fontSize: '0.875rem',
                color: forgeTokens.textMuted,
                marginTop: '0.5rem',
                marginBottom: '1rem',
                maxWidth: '32rem',
                textAlign: 'center',
              }}
            >
              {error.message}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: forgeTokens.primary,
              color: 'white',
              border: 'none',
              borderRadius: forgeTokens.radiusMd,
              cursor: 'pointer',
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
