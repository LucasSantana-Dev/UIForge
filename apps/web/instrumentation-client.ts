const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      sendDefaultPii: false,
    });
  });
}

export const onRouterTransitionStart = SENTRY_DSN
  ? (...args: unknown[]) => {
      import('@sentry/nextjs').then((Sentry) => {
        (Sentry.captureRouterTransitionStart as (...a: unknown[]) => void)(...args);
      });
    }
  : undefined;
