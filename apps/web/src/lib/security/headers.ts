const ALLOWED_CONNECT_DOMAINS = [
  "'self'",
  'https://*.supabase.co',
  'https://*.sentry.io',
  'https://ingest.sentry.io',
  'https://js.stripe.com',
  'https://api.stripe.com',
];

function buildCSP(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    'connect-src ' + ALLOWED_CONNECT_DOMAINS.join(' '),
    "frame-src 'self' https://js.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    'form-action ' + "'self'",
    'upgrade-insecure-requests',
  ];
  return directives.join('; ');
}

export function securityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': buildCSP(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-DNS-Prefetch-Control': 'off',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  };
}
