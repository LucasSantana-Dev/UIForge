'use client';

import NextError from 'next/error';

export default function GlobalError({
  _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <NextError title="Something went wrong" statusCode={500} withDarkMode={true} />
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
