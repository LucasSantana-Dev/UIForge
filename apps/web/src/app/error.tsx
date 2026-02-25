'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Lightweight error reporting via Sentry Envelope API
      const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
      try {
        const url = new URL(dsn);
        const projectId = url.pathname.replace('/', '');
        const host = url.hostname;
        const publicKey = url.username;
        const eventId = crypto.randomUUID().replace(/-/g, '');
        const envelope = [
          JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString(), dsn }),
          JSON.stringify({ type: 'event' }),
          JSON.stringify({
            event_id: eventId,
            timestamp: Date.now() / 1000,
            platform: 'javascript',
            level: 'error',
            environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',
            exception: { values: [{ type: error.name, value: error.message }] },
          }),
        ].join('\n');
        fetch(\`https://\${host}/api/\${projectId}/envelope/\`, {
          method: 'POST',
          body: envelope,
        }).catch(() => {});
      } catch {}
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Image src="/siza-icon.png" alt="Siza" width={40} height={40} className="flex-shrink-0" />
          <span className="text-2xl font-bold">Siza</span>
        </Link>

        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">Something went wrong!</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          We encountered an unexpected error. Please try again or contact support if the problem
          persists.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-8 border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm font-mono text-destructive break-all">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={reset} size="lg">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          If this problem persists, please{' '}
          <a href="mailto:support@siza.dev" className="text-primary hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default AppError;
