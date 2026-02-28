const PRODUCTION_ORIGINS = ['https://siza.forgespace.co', 'https://dev.forgespace.co'];

export function getAllowedOrigins(): string[] {
  const extra = process.env.CORS_ALLOWED_ORIGINS;
  if (extra) {
    return [...PRODUCTION_ORIGINS, ...extra.split(',').map((o) => o.trim())];
  }
  if (process.env.NODE_ENV === 'development') {
    return [...PRODUCTION_ORIGINS, 'http://localhost:3000'];
  }
  return PRODUCTION_ORIGINS;
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin);
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowed = isOriginAllowed(origin);

  return {
    'Access-Control-Allow-Origin': allowed ? origin! : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
