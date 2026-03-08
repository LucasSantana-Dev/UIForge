import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { jsonResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError } from '@/lib/api/errors';
import { createClient } from '@/lib/supabase/server';
import { captureServerError } from '@/lib/sentry/server';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'project' | 'catalog' | 'golden-path' | 'template' | 'plugin';
  href: string;
  icon?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 30, 60_000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
      return response;
    }

    const { user } = await verifySession();

    const q = request.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
      return jsonResponse({ results: [] });
    }

    const supabase = await createClient();
    const pattern = `%${q}%`;

    const [projects, catalog, goldenPaths, templates, plugins] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, framework')
        .eq('user_id', user.id)
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('catalog_entries')
        .select('id, name, display_name, type, lifecycle')
        .or(`name.ilike.${pattern},display_name.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('golden_path_templates')
        .select('id, name, display_name, description, framework')
        .or(`name.ilike.${pattern},display_name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('templates')
        .select('id, name, description, category')
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5),
      supabase
        .from('plugins')
        .select('slug, name, description, category')
        .eq('enabled', true)
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5),
    ]);

    const results: SearchResult[] = [];

    for (const p of projects.data || []) {
      results.push({
        id: p.id,
        title: p.name,
        subtitle: p.framework,
        type: 'project',
        href: `/projects/${p.id}`,
      });
    }

    for (const c of catalog.data || []) {
      results.push({
        id: c.id,
        title: c.display_name,
        subtitle: `${c.type} · ${c.lifecycle}`,
        type: 'catalog',
        href: `/catalog?selected=${c.id}`,
      });
    }

    for (const g of goldenPaths.data || []) {
      results.push({
        id: g.id,
        title: g.display_name,
        subtitle: g.framework,
        type: 'golden-path',
        href: '/golden-paths',
      });
    }

    for (const t of templates.data || []) {
      results.push({
        id: t.id,
        title: t.name,
        subtitle: t.category,
        type: 'template',
        href: '/templates',
      });
    }

    for (const p of plugins.data || []) {
      results.push({
        id: p.slug,
        title: p.name,
        subtitle: p.category,
        type: 'plugin',
        href: '/plugins',
      });
    }

    const response = jsonResponse({ results });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 30);
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/search' });
    return errorResponse('Internal server error', 500);
  }
}
