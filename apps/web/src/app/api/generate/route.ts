import type { NextRequest } from 'next/server';

// Next.js App Router exports for SSE streaming
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate basic structure
    if (!body.description || typeof body.description !== 'string') {
      return new Response(JSON.stringify({ error: 'Description is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward to Cloudflare Workers API with SSE
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.uiforge.workers.dev';

    const response = await fetch(`${apiUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth header if present
        ...(request.headers.get('authorization') && {
          Authorization: request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      let contentType = 'application/json';

      try {
        errorData = await response.json();
      } catch {
        // Fallback to text if JSON parsing fails
        errorData = await response.text();
        contentType = 'text/plain';
      }

      return new Response(typeof errorData === 'string' ? errorData : JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': contentType },
      });
    }

    // Stream the SSE response
    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: 'No response body' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                controller.close();
                break;
              }

              const chunk = decoder.decode(value);
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          } finally {
            reader.releaseLock();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      }
    );
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'UI Generation API',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        'POST /api/generate': {
          description: 'Generate UI components with AI',
          method: 'POST',
          contentType: 'application/json',
          parameters: {
            description: 'string (required) - Description of the component to generate',
            framework: 'string (optional) - Target framework (react, vue, angular, svelte)',
            componentLibrary:
              'string (optional) - Component library (tailwind, mui, chakra, shadcn, none)',
            style: 'string (optional) - Style preference (modern, minimal, colorful)',
            typescript: 'boolean (optional) - Generate TypeScript code',
          },
          example: {
            description: 'A responsive navigation bar with logo and menu items',
            framework: 'react',
            componentLibrary: 'tailwind',
            typescript: true,
          },
        },
        'POST /api/generate/validate': {
          description: 'Validate generated code',
          method: 'POST',
          contentType: 'application/json',
          parameters: {
            code: 'string (required) - Code to validate',
            language: 'string (required) - Programming language',
          },
        },
      },
      notes: [
        'This API provides Server-Sent Events (SSE) streaming for real-time generation',
        'Authentication is required via Authorization header',
        'Rate limits may apply based on subscription tier',
      ],
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
