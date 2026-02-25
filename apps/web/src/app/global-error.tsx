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
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error);
      });
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
