const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      tracesSampleRate: 0.1,
    });
  });
}
