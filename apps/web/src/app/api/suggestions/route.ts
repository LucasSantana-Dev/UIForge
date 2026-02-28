import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { successResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError } from '@/lib/api/errors';
import { captureServerError } from '@/lib/sentry/server';

interface Suggestion {
  text: string;
  source: 'history' | 'template';
  framework?: string;
  createdAt?: string;
}

const ALLOWED_FRAMEWORKS = ['react', 'vue', 'angular', 'svelte', 'html', 'nextjs'] as const;

function sanitizeIlike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 60, 60_000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 60);
      return response;
    }

    const { user } = await verifySession();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const framework = searchParams.get('framework');
    const limit = Math.min(parseInt(searchParams.get('limit') || '8', 10), 20);

    if (
      framework &&
      !ALLOWED_FRAMEWORKS.includes(framework as (typeof ALLOWED_FRAMEWORKS)[number])
    ) {
      return errorResponse('Invalid framework parameter', 400);
    }

    if (!query || query.length < 3) {
      return successResponse({ suggestions: [] });
    }

    const supabase = await createClient();
    const suggestions: Suggestion[] = [];

    const [historyResult, templateResult] = await Promise.all([
      supabase
        .from('generations')
        .select('prompt, framework, created_at')
        .eq('user_id', user.id)
        .ilike('prompt', `%${sanitizeIlike(query)}%`)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('templates')
        .select('name, description, framework, created_at')
        .or(`name.ilike.%${sanitizeIlike(query)}%,description.ilike.%${sanitizeIlike(query)}%`)
        .limit(limit),
    ]);

    if (historyResult.data) {
      const seen = new Set<string>();
      for (const row of historyResult.data) {
        if (framework && row.framework !== framework) continue;
        const key = row.prompt.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push({
          text: row.prompt,
          source: 'history',
          framework: row.framework,
          createdAt: row.created_at,
        });
      }
    }

    if (templateResult.data) {
      for (const row of templateResult.data) {
        if (framework && row.framework !== framework) continue;
        suggestions.push({
          text: row.description || row.name,
          source: 'template',
          framework: row.framework,
          createdAt: row.created_at,
        });
      }
    }

    suggestions.sort((a, b) => {
      const aLower = a.text.toLowerCase();
      const qLower = query.toLowerCase();
      const aPrefix = aLower.startsWith(qLower) ? 0 : 1;
      const bLower = b.text.toLowerCase();
      const bPrefix = bLower.startsWith(qLower) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      if (a.source !== b.source) {
        return a.source === 'history' ? -1 : 1;
      }
      return 0;
    });

    const response = successResponse({
      suggestions: suggestions.slice(0, limit),
    });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 60);
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, 401);
    }
    captureServerError(error, { route: '/api/suggestions' });
    return errorResponse('Internal server error', 500);
  }
}
