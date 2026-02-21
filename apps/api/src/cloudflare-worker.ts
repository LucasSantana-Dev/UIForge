/**
 * Cloudflare Workers API
 * Full UIForge API implementation for Cloudflare Workers
 */

import { streamComponentGeneration } from './services/gemini';
import { logger } from './utils/logger';

// Environment interface for Cloudflare Workers
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY: string;
  NODE_ENV?: string;
}

// Request validation schemas
const generateSchema = {
  framework: ['react', 'vue', 'angular', 'svelte'],
  componentLibrary: ['tailwind', 'mui', 'chakra', 'shadcn', 'none'],
  description: { type: 'string', minLength: 10, maxLength: 1000 },
  style: ['modern', 'minimal', 'colorful'],
  typescript: { type: 'boolean' },
};

// Rate limiting (simple in-memory for Workers)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(
  request: Request,
  limit: number,
  windowMs: number
): { allowed: boolean; resetAt?: number } {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= limit) {
    return { allowed: false, resetAt: record.resetTime };
  }

  record.count++;
  return { allowed: true };
}

// Health check implementation
async function handleHealth(env: Env): Promise<Response> {
  try {
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'disconnected' as 'disconnected' | 'connected',
        gemini: env.GEMINI_API_KEY ? 'available' : ('not_configured' as const),
        mcp: 'not_implemented' as const,
        websocket: 'not_implemented' as const,
      },
      version: '0.1.0',
    };

    // Check Supabase connection
    try {
      const response = await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
      });
      health.services.supabase = response.ok ? 'connected' : 'disconnected';
      if (!response.ok) {
        health.status = 'degraded';
      }
    } catch {
      health.services.supabase = 'disconnected';
      health.status = 'degraded';
    }

    // Determine overall status
    if (health.services.supabase === 'disconnected') {
      health.status = 'unhealthy';
    } else if (!env.GEMINI_API_KEY) {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(health), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Generate component endpoint
async function handleGenerate(request: Request, env: Env): Promise<Response> {
  try {
    // Rate limiting
    const rateResult = checkRateLimit(request, 10, 60000); // 10 requests per minute
    if (!rateResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retry_after: Math.ceil((rateResult.resetAt! - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateResult.resetAt! - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    const body = (await request.json()) as any;

    // Validate request
    if (
      !body.description ||
      typeof body.description !== 'string' ||
      body.description.length < 10 ||
      body.description.length > 1000
    ) {
      return new Response(
        JSON.stringify({
          error: 'Invalid description. Must be between 10 and 1000 characters.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!generateSchema.framework.includes(body.framework)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid framework. Must be one of: ' + generateSchema.framework.join(', '),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Set up environment for Gemini service
    (globalThis as any).process = {
      env: {
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        NODE_ENV: env.NODE_ENV || 'development',
      },
    };

    // Stream component generation
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamComponentGeneration(body)) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    logger.error('Generate endpoint error', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Main fetch handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS handling
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Route handling
    try {
      if (url.pathname === '/health' && request.method === 'GET') {
        return await handleHealth(env);
      }

      if (url.pathname === '/api/generate' && request.method === 'POST') {
        return await handleGenerate(request, env);
      }

      if (url.pathname === '/api' && request.method === 'GET') {
        return new Response(
          JSON.stringify({
            message: 'UIForge API is running on Cloudflare Workers',
            version: '0.1.0',
            endpoints: ['/health', '/api/generate'],
            environment: env.NODE_ENV || 'development',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // 404 for unknown routes
      return new Response(
        JSON.stringify({
          error: 'Not Found',
          message: 'The requested endpoint was not found',
          available_endpoints: ['/health', '/api/generate', '/api'],
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      logger.error('Worker error', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
