import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.code || !body.language) {
      return new Response(
        JSON.stringify({ error: 'Code and language are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Express API
    const expressApiUrl = process.env.EXPRESS_API_URL || 'http://localhost:3001';

    const response = await fetch(`${expressApiUrl}/api/generate/format`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    let data;
    let contentType = 'application/json';

    try {
      data = await response.json();
    } catch {
      // Fallback to text if JSON parsing fails
      data = await response.text();
      contentType = 'text/plain';
    }

    return new Response(
      typeof data === 'string' ? data : JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': contentType } }
    );

  } catch (error) {
    console.error('Formatting error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
