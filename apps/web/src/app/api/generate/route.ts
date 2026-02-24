import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { generateComponentStream } from '@/lib/services/gemini';
import { runAllGates } from '@/lib/quality/gates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const generateSchema = z.object({
  description: z.string().min(10).max(2000),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']).default('react'),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean().optional(),
  userApiKey: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, 15, 60000);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Try again shortly.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await verifySession();

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: parsed.error.issues[0]?.message || 'Invalid request',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { description, framework, componentLibrary, style, typescript, userApiKey } = parsed.data;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullCode = '';

          for await (const event of generateComponentStream({
            prompt: description,
            framework,
            componentLibrary,
            style,
            typescript,
            apiKey: userApiKey,
          })) {
            if (event.type === 'chunk' && event.content) {
              fullCode += event.content;
            }

            if (event.type === 'complete') {
              const qualityReport = runAllGates(fullCode);
              const qualityEvent = {
                type: 'quality',
                report: qualityReport,
                timestamp: Date.now(),
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(qualityEvent)}\n\n`)
              );

              const completeEvent = {
                ...event,
                code: fullCode,
                totalLength: fullCode.length,
                qualityPassed: qualityReport.passed,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`)
              );
              continue;
            }

            const sseData = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
        } catch (error) {
          const errorEvent = {
            type: 'error',
            message: error instanceof Error ? error.message : 'Stream failed',
            timestamp: Date.now(),
          };
          const errData = `data: ${JSON.stringify(errorEvent)}\n\n`;
          controller.enqueue(encoder.encode(errData));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Authentication required' ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'UI Generation API',
      version: '2.0.0',
      status: 'active',
      provider: 'gemini-2.0-flash',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
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
