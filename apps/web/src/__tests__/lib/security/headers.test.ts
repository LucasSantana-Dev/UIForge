import { securityHeaders } from '@/lib/security/headers';

describe('securityHeaders', () => {
  it('returns all required security headers', () => {
    const headers = securityHeaders();
    expect(headers['Content-Security-Policy']).toBeDefined();
    expect(headers['Strict-Transport-Security']).toContain(
      'max-age=31536000'
    );
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-DNS-Prefetch-Control']).toBe('off');
    expect(headers['Referrer-Policy']).toBe(
      'strict-origin-when-cross-origin'
    );
    expect(headers['Permissions-Policy']).toContain('camera=()');
  });

  it('CSP allows self for default-src', () => {
    const headers = securityHeaders();
    expect(headers['Content-Security-Policy']).toContain(
      "default-src 'self'"
    );
  });

  it('CSP allows unsafe-inline for styles (Tailwind)', () => {
    const headers = securityHeaders();
    expect(headers['Content-Security-Policy']).toContain(
      "style-src 'self' 'unsafe-inline'"
    );
  });

  it('CSP allows Stripe scripts', () => {
    const headers = securityHeaders();
    expect(headers['Content-Security-Policy']).toContain(
      'https://js.stripe.com'
    );
  });

  it('CSP allows Supabase connections', () => {
    const headers = securityHeaders();
    expect(headers['Content-Security-Policy']).toContain(
      'https://*.supabase.co'
    );
  });

  it('CSP allows Sentry connections', () => {
    const headers = securityHeaders();
    expect(headers['Content-Security-Policy']).toContain(
      'https://*.sentry.io'
    );
  });

  it('CSP denies frame-ancestors', () => {
    const headers = securityHeaders();
    expect(headers['Content-Security-Policy']).toContain(
      "frame-ancestors 'none'"
    );
  });

  it('HSTS includes preload', () => {
    const headers = securityHeaders();
    expect(headers['Strict-Transport-Security']).toContain(
      'preload'
    );
  });
});
