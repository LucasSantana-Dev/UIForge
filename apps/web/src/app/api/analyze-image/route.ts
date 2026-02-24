import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { analyzeDesignImage } from '@/lib/services/image-analysis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const analyzeSchema = z.object({
  imageBase64: z.string().min(1).max(MAX_IMAGE_SIZE, 'Image too large (max ~5MB)'),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  userApiKey: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, 10, 60000);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again shortly.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await verifySession();

    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: parsed.error.issues[0]?.message || 'Invalid request',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64, mimeType, userApiKey } = parsed.data;
    const analysis = await analyzeDesignImage(imageBase64, mimeType, userApiKey);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    const status = message === 'Authentication required' ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
