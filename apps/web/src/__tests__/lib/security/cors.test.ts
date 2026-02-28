import {
  getAllowedOrigins,
  isOriginAllowed,
  corsHeaders,
} from '@/lib/security/cors';

describe('getAllowedOrigins', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('includes production origins', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true });
    const origins = getAllowedOrigins();
    expect(origins).toContain('https://siza.forgespace.co');
    expect(origins).toContain('https://dev.forgespace.co');
  });

  it('includes localhost in development', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true });
    const origins = getAllowedOrigins();
    expect(origins).toContain('http://localhost:3000');
  });

  it('includes custom origins from env', () => {
    process.env.CORS_ALLOWED_ORIGINS =
      'https://custom.example.com, https://other.example.com';
    const origins = getAllowedOrigins();
    expect(origins).toContain('https://custom.example.com');
    expect(origins).toContain('https://other.example.com');
  });
});

describe('isOriginAllowed', () => {
  it('returns false for null origin', () => {
    expect(isOriginAllowed(null)).toBe(false);
  });

  it('returns true for production origin', () => {
    expect(
      isOriginAllowed('https://siza.forgespace.co')
    ).toBe(true);
  });

  it('returns false for unknown origin', () => {
    expect(
      isOriginAllowed('https://evil.example.com')
    ).toBe(false);
  });
});

describe('corsHeaders', () => {
  it('returns allowed origin when request origin is valid', () => {
    const request = new Request('https://siza.forgespace.co/api', {
      headers: { origin: 'https://siza.forgespace.co' },
    });
    const headers = corsHeaders(request);
    expect(headers['Access-Control-Allow-Origin']).toBe(
      'https://siza.forgespace.co'
    );
    expect(headers['Vary']).toBe('Origin');
  });

  it('returns empty origin when request origin is invalid', () => {
    const request = new Request('https://siza.forgespace.co/api', {
      headers: { origin: 'https://evil.example.com' },
    });
    const headers = corsHeaders(request);
    expect(headers['Access-Control-Allow-Origin']).toBe('');
  });

  it('includes standard CORS methods', () => {
    const request = new Request('https://siza.forgespace.co/api', {
      headers: { origin: 'https://siza.forgespace.co' },
    });
    const headers = corsHeaders(request);
    expect(headers['Access-Control-Allow-Methods']).toContain(
      'POST'
    );
    expect(headers['Access-Control-Allow-Methods']).toContain(
      'GET'
    );
  });
});
