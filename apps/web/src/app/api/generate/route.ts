import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { generateComponentStream } from '@/lib/services/gemini';
import { generateWithProvider } from '@/lib/services/generation';
import type { AIProvider } from '@/lib/encryption';
import { runAllGates } from '@/lib/quality/gates';
import { enrichPromptWithContext } from '@/lib/services/context-enrichment';
import { storeGenerationEmbedding } from '@/lib/services/embeddings';
import { createClient } from '@/lib/supabase/server';
import { checkGenerationQuota } from '@/lib/usage/limits';
import { incrementGenerationCount } from '@/lib/usage/tracker';
import { captureServerError } from '@/lib/sentry/server';
import { getFeatureFlag } from '@/lib/features/flags';
import { isMcpConfigured, generateComponent } from '@/lib/mcp/client';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const generateSchema = z.object({
  description: z.string().min(10).max(2000),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']).default('react'),
  componentLibrary: z.enum(['tailwind', 'mui', 'chakra', 'shadcn', 'none']).optional(),
  style: z.enum(['modern', 'minimal', 'colorful']).optional(),
  typescript: z.boolean().optional(),
  userApiKey: z.string().min(1).optional(),
  provider: z.enum(['google', 'openai', 'anthropic']).default('google'),
  model: z.string().min(1).optional(),
  useRag: z.boolean().optional(),
  imageBase64: z.string().max(MAX_IMAGE_SIZE, 'Image too large (max ~5MB)').optional(),
  imageMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']).optional(),
  colorMode: z.enum(['dark', 'light', 'both']).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  animation: z.enum(['none', 'subtle', 'standard', 'rich']).optional(),
  spacing: z.enum(['compact', 'default', 'spacious']).optional(),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).optional(),
  typography: z.enum(['system', 'sans', 'serif', 'mono']).optional(),
});

function shouldUseMcpGateway(): boolean {
  return getFeatureFlag('ENABLE_MCP_GATEWAY') && isMcpConfigured();
}

function createSseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

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

    const quota = await checkGenerationQuota(user.id);
    if (!quota.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Generation quota exceeded',
          quota: {
            current: quota.current,
            limit: quota.limit,
            remaining: quota.remaining,
          },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
      provider: requestedProvider,
      model: requestedModel,
      useRag,
      imageBase64,
      imageMimeType,
      colorMode,
      primaryColor,
      secondaryColor,
      accentColor,
      animation,
      spacing,
      borderRadius,
      typography,
    } = parsed.data;

    const BORDER_RADIUS_PX: Record<string, string> = {
      none: '0',
      small: '4px',
      medium: '8px',
      large: '12px',
      full: '9999px',
    };

    let designContextBlock = '';
    if (colorMode || primaryColor) {
      const parts: string[] = [];
      if (colorMode) parts.push(colorMode + ' mode');
      if (primaryColor) parts.push('primary ' + primaryColor);
      if (secondaryColor) parts.push('secondary ' + secondaryColor);
      if (accentColor) parts.push('accent ' + accentColor);
      if (animation) parts.push(animation + ' animations');
      if (spacing && spacing !== 'default') parts.push(spacing + ' spacing');
      if (borderRadius) parts.push('border-radius ' + (BORDER_RADIUS_PX[borderRadius] || '8px'));
      if (typography && typography !== 'system') parts.push(typography + ' typography');
      designContextBlock = '\nDesign context: ' + parts.join(', ') + '.';
    }

    const enrichedDescription = description + designContextBlock;

    let contextAddition = '';
    if (useRag !== false) {
      try {
        const enrichment = await enrichPromptWithContext(enrichedDescription, {
          framework,
          apiKey: userApiKey,
        });
        contextAddition = enrichment.systemPromptAddition;
      } catch {
        // RAG enrichment is best-effort
      }
    }

    const encoder = new TextEncoder();
    const mcpEnabled = shouldUseMcpGateway();

    const stream = new ReadableStream({
      async start(controller) {
        let generationId: string | null = null;
        const activeProvider = mcpEnabled ? 'mcp-gateway' : requestedProvider;
        const activeModel = mcpEnabled ? 'mcp-specialist' : requestedModel || 'gemini-2.0-flash';

        try {
          const supabase = await createClient();
          const { data: gen } = await supabase
            .from('generations')
            .insert({
              user_id: user.id,
              prompt: description,
              framework,
              status: 'processing',
              ai_provider: activeProvider,
              model_used: activeModel,
            })
            .select('id')
            .single();
          generationId = gen?.id ?? null;

          let fullCode = '';

          if (mcpEnabled) {
            controller.enqueue(
              encoder.encode(createSseEvent({ type: 'start', timestamp: Date.now() }))
            );

            try {
              fullCode = await generateComponent({
                prompt: enrichedDescription,
                framework,
                componentLibrary,
                style,
                typescript,
                imageBase64,
                imageMimeType,
                contextAddition,
              });
            } catch (mcpError) {
              captureServerError(mcpError, {
                route: '/api/generate',
                extra: { fallback: 'mcp-to-gemini' },
              });
              fullCode = '';
            }

            if (!fullCode) {
              for await (const event of generateComponentStream({
                prompt: enrichedDescription,
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
                if (event.type !== 'complete') {
                  controller.enqueue(encoder.encode(createSseEvent(event)));
                }
              }
            } else {
              const chunkSize = 200;
              for (let i = 0; i < fullCode.length; i += chunkSize) {
                controller.enqueue(
                  encoder.encode(
                    createSseEvent({
                      type: 'chunk',
                      content: fullCode.slice(i, i + chunkSize),
                      timestamp: Date.now(),
                    })
                  )
                );
              }
            }
          } else {
            for await (const event of generateWithProvider({
              provider: requestedProvider as AIProvider,
              model: requestedModel || 'gemini-2.0-flash',
              prompt: enrichedDescription,
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
                break;
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            }
          }

          const qualityReport = runAllGates(fullCode);
          controller.enqueue(
            encoder.encode(
              createSseEvent({
                type: 'quality',
                report: qualityReport,
                timestamp: Date.now(),
              })
            )
          );

          if (generationId) {
            const supabase2 = await createClient();
            await supabase2
              .from('generations')
              .update({
                status: 'completed',
                generated_code: fullCode,
                ai_provider: fullCode ? activeProvider : 'google',
                quality_score: qualityReport.score,
              })
              .eq('id', generationId);

            storeGenerationEmbedding(generationId, description, userApiKey).catch(() => {});
            incrementGenerationCount(user.id).catch(() => {});
          }

          controller.enqueue(
            encoder.encode(
              createSseEvent({
                type: 'complete',
                code: fullCode,
                generationId,
                totalLength: fullCode.length,
                qualityPassed: qualityReport.passed,
                ragEnriched: contextAddition.length > 0,
                provider: activeProvider,
                timestamp: Date.now(),
              })
            )
          );
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
          captureServerError(error, {
            route: '/api/generate',
            userId: user.id,
          });
          controller.enqueue(
            encoder.encode(
              createSseEvent({
                type: 'error',
                message: error instanceof Error ? error.message : 'Stream failed',
                timestamp: Date.now(),
              })
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
    captureServerError(error, { route: '/api/generate' });
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Authentication required' ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  const mcpEnabled = shouldUseMcpGateway();
  return new Response(
    JSON.stringify({
      message: 'UI Generation API',
      version: '3.1.0',
      status: 'active',
      provider: 'gemini-2.0-flash',
      features: [
        'rag',
        'quality-gates',
        'streaming',
        'image-input',
        ...(mcpEnabled ? ['mcp-gateway'] : []),
      ],
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
