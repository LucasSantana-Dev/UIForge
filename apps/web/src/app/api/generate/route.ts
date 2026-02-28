import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { generateComponentStream } from '@/lib/services/gemini';
import { generateWithProvider } from '@/lib/services/generation';
import type { AIProvider } from '@/lib/encryption';
import { checkGenerationQuota } from '@/lib/usage/limits';
import { captureServerError } from '@/lib/sentry/server';
import { getFeatureFlag } from '@/lib/features/flags';
import { isMcpConfigured, generateComponent } from '@/lib/mcp/client';
import { generateSchema } from '@/lib/api/validation/generate';
import {
  buildDesignContext,
  enrichWithRag,
  createGenerationRecord,
  completeGeneration,
  failGeneration,
  runQualityGates,
  postGenerationTasks,
  createSseEvent,
  buildStreamPrompt,
} from '@/lib/services/generation.service';
import { validateConversation } from '@/lib/services/conversation.service';

export const dynamic = 'force-dynamic';

function shouldUseMcpGateway(): boolean {
  return getFeatureFlag('ENABLE_MCP_GATEWAY') && isMcpConfigured();
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, 15, 60000);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again shortly.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { user } = await verifySession();

    const quota = await checkGenerationQuota(user.id);
    if (!quota.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Generation quota exceeded',
          quota: { current: quota.current, limit: quota.limit, remaining: quota.remaining },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message || 'Invalid request' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = parsed.data;
    const isRefinement = !!(data.parentGenerationId && data.refinementPrompt);

    if (isRefinement) {
      await validateConversation(data.parentGenerationId!);
    }

    const designContext = buildDesignContext(data);
    const enrichedDescription = data.description + designContext;
    const contextAddition =
      data.useRag !== false
        ? await enrichWithRag(enrichedDescription, {
            framework: data.framework,
            apiKey: data.userApiKey,
          })
        : '';

    const mcpEnabled = shouldUseMcpGateway();
    const activeProvider = mcpEnabled ? 'mcp-gateway' : data.provider;
    const activeModel = mcpEnabled ? 'mcp-specialist' : data.model || 'gemini-2.0-flash';

    const conversationCtx =
      isRefinement && data.previousCode
        ? { previousCode: data.previousCode, refinementPrompt: data.refinementPrompt! }
        : undefined;
    const streamPrompt = buildStreamPrompt(enrichedDescription, conversationCtx);

    const generationOpts = {
      framework: data.framework,
      componentLibrary: data.componentLibrary,
      style: data.style,
      typescript: data.typescript,
      apiKey: data.userApiKey,
      contextAddition,
      imageBase64: data.imageBase64,
      imageMimeType: data.imageMimeType,
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let generationId: string | null = null;
        try {
          generationId = await createGenerationRecord({
            userId: user.id,
            prompt: isRefinement ? data.refinementPrompt! : data.description,
            framework: data.framework,
            provider: activeProvider,
            model: activeModel,
            parentGenerationId: data.parentGenerationId,
          });

          let fullCode = '';

          if (mcpEnabled) {
            controller.enqueue(
              encoder.encode(createSseEvent({ type: 'start', timestamp: Date.now() }))
            );
            try {
              fullCode = await generateComponent({ prompt: streamPrompt, ...generationOpts });
            } catch (mcpError) {
              captureServerError(mcpError, {
                route: '/api/generate',
                extra: { fallback: 'mcp-to-gemini' },
              });
              fullCode = '';
            }

            if (fullCode) {
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
          }

          if (!mcpEnabled || !fullCode) {
            const generator = mcpEnabled
              ? generateComponentStream({ prompt: streamPrompt, ...generationOpts })
              : generateWithProvider({
                  provider: data.provider as AIProvider,
                  model: data.model || 'gemini-2.0-flash',
                  prompt: streamPrompt,
                  ...generationOpts,
                });

            for await (const event of generator) {
              if (event.type === 'chunk' && event.content) {
                fullCode += event.content;
              }
              if (event.type === 'complete') break;
              controller.enqueue(encoder.encode(createSseEvent(event)));
            }
          }

          const qualityReport = runQualityGates(fullCode);
          controller.enqueue(
            encoder.encode(
              createSseEvent({ type: 'quality', report: qualityReport, timestamp: Date.now() })
            )
          );

          if (generationId) {
            await completeGeneration(
              generationId, fullCode, activeProvider, qualityReport.score
            );
            postGenerationTasks(generationId, data.description, user.id, data.userApiKey);
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
                parentGenerationId: data.parentGenerationId || null,
                timestamp: Date.now(),
              })
            )
          );
        } catch (error) {
          if (generationId) {
            await failGeneration(
              generationId,
              error instanceof Error ? error.message : 'Generation failed'
            );
          }
          captureServerError(error, { route: '/api/generate', userId: user.id });
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
  const conversationEnabled = getFeatureFlag('ENABLE_CONVERSATION_MODE');
  return new Response(
    JSON.stringify({
      message: 'UI Generation API',
      version: '4.0.0',
      status: 'active',
      provider: 'gemini-2.0-flash',
      features: [
        'rag',
        'quality-gates',
        'streaming',
        'image-input',
        ...(mcpEnabled ? ['mcp-gateway'] : []),
        ...(conversationEnabled ? ['conversation-mode'] : []),
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
