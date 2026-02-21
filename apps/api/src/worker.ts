/**
 * Cloudflare Workers Entry Point
 * Simple API for testing deployment
 */

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // Simple health check endpoint
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: env.NODE_ENV || 'development',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Simple API info endpoint
    if (url.pathname === '/api') {
      return new Response(
        JSON.stringify({
          message: 'UIForge API is running on Cloudflare Workers',
          version: '1.0.0',
          endpoints: ['/health', '/api'],
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Default response
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        message: 'The requested endpoint was not found',
        available_endpoints: ['/health', '/api'],
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
