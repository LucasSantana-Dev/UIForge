import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.code || !body.language) {
      return new Response(JSON.stringify({ error: 'Code and language are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward to Cloudflare Workers API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.siza.workers.dev';

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutMs = 10000; // 10 seconds

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(`${apiUrl}/api/generate/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('authorization') && {
            Authorization: request.headers.get('authorization')!,
          }),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

      let data;
      let contentType = 'application/json';

      try {
        data = await response.json();
      } catch {
        // Fallback to text if JSON parsing fails
        data = await response.text();
        contentType = 'text/plain';
      }

      return new Response(typeof data === 'string' ? data : JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': contentType },
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Request timeout' }), {
          status: 408,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.error('Validation error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (outerError) {
    console.error('Outer validation error:', outerError);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
