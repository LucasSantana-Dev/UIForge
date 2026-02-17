import type { NextRequest } from 'next/server';

// Next.js App Router exports for SSE streaming
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const generateSchema = {
  framework: ['react', 'vue', 'angular', 'svelte'],
  componentLibrary: ['tailwind', 'mui', 'chakra', 'shadcn', 'none'],
  style: ['modern', 'minimal', 'colorful'],
  typescript: 'boolean',
  description: 'string',
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate basic structure
    if (!body.description || typeof body.description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Cloudflare Workers API with SSE
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.uiforge.workers.dev';

    const response = await fetch(`${apiUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
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

      return new Response(
        typeof errorData === 'string' ? errorData : JSON.stringify(errorData),
        {
          status: response.status,
          headers: { 'Content-Type': contentType }
        }
      );
    }

    // Stream the SSE response
    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(
        JSON.stringify({ error: 'No response body' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
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
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      }
    );

  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
