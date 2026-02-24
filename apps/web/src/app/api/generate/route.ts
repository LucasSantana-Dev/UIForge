import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { generateComponentStream } from '@/lib/services/gemini';
import { runAllGates } from '@/lib/quality/gates';
import { enrichPromptWithContext } from '@/lib/services/context-enrichment';
import { storeGenerationEmbedding } from '@/lib/services/embeddings';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const generateSchema = z.object({
  description: z.string().min(10).max(2000),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']).default('react'),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean().optional(),
  userApiKey: z.string().min(1).optional(),
  useRag: z.boolean().optional(),
  imageBase64: z.string().max(MAX_IMAGE_SIZE, 'Image too large (max ~5MB)').optional(),
  imageMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']).optional(),
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

    const { user } = await verifySession();

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

    const {
      description,
      framework,
      componentLibrary,
      style,
      typescript,
      userApiKey,
      useRag,
      imageBase64,
      imageMimeType,
    } = parsed.data;

    let contextAddition = '';
    if (useRag !== false) {
      try {
        const enrichment = await enrichPromptWithContext(description, {
          framework,
          apiKey: userApiKey,
        });
        contextAddition = enrichment.systemPromptAddition;
      } catch {
        // RAG enrichment is best-effort
      }
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let generationId: string | null = null;

        try {
          const supabase = await createClient();
          const { data: gen } = await supabase
            .from('generations')
            .insert({
              user_id: user.id,
              prompt: description,
              framework,
              status: 'processing',
              ai_provider: 'google' as const,
              model_used: 'gemini-2.0-flash',
            })
            .select('id')
            .single();
          generationId = gen?.id ?? null;

          let fullCode = '';

          for await (const event of generateComponentStream({
            prompt: description,
            framework,
            componentLibrary,
            style,
            typescript,
            apiKey: userApiKey,
            contextAddition,
            imageBase64,
            imageMimeType,
          })) {
            if (event.type === 'chunk' && event.content) {
              fullCode += event.content;
            }

            if (event.type === 'complete') {
              const qualityReport = runAllGates(fullCode);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'quality',
                    report: qualityReport,
                    timestamp: Date.now(),
                  })}\n\n`
                )
              );

              if (generationId) {
                await supabase
                  .from('generations')
                  .update({
                    status: 'completed',
                    generated_code: fullCode,
                  })
                  .eq('id', generationId);

                storeGenerationEmbedding(generationId, description, userApiKey).catch(() => {});
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    ...event,
                    code: fullCode,
                    generationId,
                    totalLength: fullCode.length,
                    qualityPassed: qualityReport.passed,
                    ragEnriched: contextAddition.length > 0,
                  })}\n\n`
                )
              );
              continue;
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
        } catch (error) {
          if (generationId) {
            const supabase = await createClient();
            await supabase
              .from('generations')
              .update({
                status: 'failed',
                error_message: error instanceof Error ? error.message : 'Generation failed',
              })
              .eq('id', generationId);
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: error instanceof Error ? error.message : 'Stream failed',
                timestamp: Date.now(),
              })}\n\n`
            )
          );
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
      version: '3.0.0',
      status: 'active',
      provider: 'gemini-2.0-flash',
      features: ['rag', 'quality-gates', 'streaming', 'image-input'],
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
