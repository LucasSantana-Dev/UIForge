import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { checkGenerationQuota } from '@/lib/usage/limits';
import { captureServerError } from '@/lib/sentry/server';
import { getFeatureFlag } from '@/lib/features/flags';
import { isMcpConfigured } from '@/lib/mcp/client';
import { generateSchema } from '@/lib/api/validation/generate';
import { APIError } from '@/lib/api/errors';
import { validateConversation } from '@/lib/services/conversation.service';
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
  type ConversationContext,
} from '@/lib/services/generation.service';
import { routeGeneration } from '@/lib/services/provider-router';

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

    const input = parsed.data;
    const isRefinement = !!(
      input.parentGenerationId && input.refinementPrompt
    );

    if (isRefinement) {
      await validateConversation(input.parentGenerationId!);
    }

    const designContext = buildDesignContext(input);
    const enrichedDescription = input.description + designContext;
    const contextAddition =
      input.useRag !== false
        ? await enrichWithRag(enrichedDescription, {
            framework: input.framework,
            apiKey: input.userApiKey,
          })
        : '';

    const mcpEnabled = shouldUseMcpGateway();
    const activeProvider = mcpEnabled ? 'mcp-gateway' : input.provider;
    const activeModel = mcpEnabled
      ? 'mcp-specialist'
      : input.model || 'gemini-2.0-flash';
    const conversationCtx: ConversationContext | undefined =
      isRefinement && input.previousCode
        ? {
            previousCode: input.previousCode,
            refinementPrompt: input.refinementPrompt!,
          }
        : undefined;

    const encoder = new TextEncoder();
    const streamPrompt = buildStreamPrompt(
      enrichedDescription,
      conversationCtx
    );

    const stream = new ReadableStream({
      async start(controller) {
        let generationId: string | null = null;
        try {
          generationId = await createGenerationRecord({
            userId: user.id,
            prompt: isRefinement
              ? input.refinementPrompt!
              : input.description,
            framework: input.framework,
            provider: activeProvider,
            model: activeModel,
            parentGenerationId: input.parentGenerationId,
          });

          let fullCode = '';
          for await (const event of routeGeneration({
            mcpEnabled,
            prompt: streamPrompt,
            framework: input.framework,
            componentLibrary: input.componentLibrary,
            style: input.style,
            typescript: input.typescript,
            userApiKey: input.userApiKey,
            contextAddition,
            imageBase64: input.imageBase64,
            imageMimeType: input.imageMimeType,
            provider: input.provider,
            model: input.model || 'gemini-2.0-flash',
          })) {
            if (event.type === 'chunk' && event.content) {
              fullCode += event.content;
            }
            controller.enqueue(
              encoder.encode(createSseEvent(event))
            );
          }

          const qualityReport = runQualityGates(fullCode);
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
            await completeGeneration(
              generationId,
              fullCode,
              activeProvider,
              qualityReport.score
            );
            void postGenerationTasks(
              generationId,
              input.description,
              user.id,
              input.userApiKey
            );
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
                parentGenerationId:
                  input.parentGenerationId || null,
                timestamp: Date.now(),
              })
            )
          );
        } catch (error) {
          if (generationId) {
            await failGeneration(
              generationId,
              error instanceof Error
                ? error.message
                : 'Generation failed'
            );
          }
          captureServerError(error, {
            route: '/api/generate',
            userId: user.id,
          });
          controller.enqueue(
            encoder.encode(
              createSseEvent({
                type: 'error',
                message:
                  error instanceof Error
                    ? error.message
                    : 'Stream failed',
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
    if (error instanceof APIError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: error.statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    captureServerError(error, { route: '/api/generate' });
    const message =
      error instanceof Error
        ? error.message
        : 'Internal server error';
    const status =
      message === 'Authentication required' ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  const mcpEnabled = shouldUseMcpGateway();
  const conversationEnabled = getFeatureFlag(
    'ENABLE_CONVERSATION_MODE'
  );
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

export async function OPTIONS(request: NextRequest) {
  const { corsHeaders } = await import('@/lib/security/cors');
  return new Response(null, {
    status: 200,
    headers: corsHeaders(request),
  });
}
