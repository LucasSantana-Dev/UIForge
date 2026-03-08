import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { createdResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError, ValidationError } from '@/lib/api/errors';
import { findGoldenPathById } from '@/lib/repositories/golden-path.repo';
import { createClient } from '@/lib/supabase/server';
import { captureServerError } from '@/lib/sentry/server';

interface ParameterDef {
  name: string;
  type: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
}

const FRAMEWORK_MAP: Record<string, string> = {
  'next.js': 'nextjs',
  'node.js': 'react',
  fastapi: 'html',
  cloudflare: 'html',
};

const LIFECYCLE_MAP: Record<string, string> = {
  draft: 'experimental',
  beta: 'experimental',
  ga: 'production',
  deprecated: 'deprecated',
};

function mapFramework(framework: string): string {
  return FRAMEWORK_MAP[framework] ?? framework;
}

function mapLifecycle(lifecycle: string): string {
  return LIFECYCLE_MAP[lifecycle] ?? lifecycle;
}

function resolveParameters(
  defs: ParameterDef[],
  values: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const def of defs) {
    const value = values[def.name] ?? def.default;
    if (def.required && value === undefined) {
      throw new ValidationError(`Parameter "${def.name}" is required`, {
        parameter: def.name,
      });
    }
    if (def.type === 'select' && def.options && value !== undefined) {
      if (!def.options.includes(String(value))) {
        throw new ValidationError(
          `Parameter "${def.name}" must be one of: ${def.options.join(', ')}`
        );
      }
    }
    if (value !== undefined) resolved[def.name] = value;
  }
  return resolved;
}

const scaffoldSchema = z.object({
  golden_path_id: z.string().uuid(),
  project_name: z.string().min(1).max(100),
  parameters: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { allowed, remaining, resetAt } = await checkRateLimit(request, 10, 60_000);
    if (!allowed) {
      const response = errorResponse('Rate limit exceeded', 429);
      setRateLimitHeaders(response, { allowed, remaining, resetAt }, 10);
      return response;
    }

    const { user } = await verifySession();

    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    const parseResult = scaffoldSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid scaffold request', parseResult.error.flatten());
    }

    const { golden_path_id, project_name, parameters: paramValues } = parseResult.data;

    const goldenPath = await findGoldenPathById(golden_path_id);
    if (!goldenPath) {
      return errorResponse('Golden path not found', 404);
    }

    const resolvedParams = resolveParameters(goldenPath.parameters || [], paramValues || {});

    const description = resolvedParams.description
      ? String(resolvedParams.description)
      : `Scaffolded from ${goldenPath.display_name}`;

    const supabase = await createClient();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: project_name,
        description,
        framework: mapFramework(
          resolvedParams.framework ? String(resolvedParams.framework) : goldenPath.framework
        ),
        user_id: user.id,
      })
      .select()
      .single();

    if (projectError) {
      captureServerError(projectError, {
        route: '/api/golden-paths/scaffold',
      });
      return errorResponse('Failed to create project', 500);
    }

    const { error: catalogError } = await supabase.from('catalog_entries').insert({
      name: project_name.toLowerCase().replace(/\s+/g, '-'),
      display_name: project_name,
      type: goldenPath.catalog_type,
      lifecycle: mapLifecycle(goldenPath.catalog_lifecycle),
      owner_id: user.id,
      project_id: project.id,
      tags: goldenPath.tags,
      metadata: {
        golden_path: goldenPath.name,
        parameters: resolvedParams,
      },
    });

    if (catalogError) {
      captureServerError(catalogError, {
        route: '/api/golden-paths/scaffold',
        extra: { step: 'catalog_registration' },
      });
    }

    await supabase
      .from('golden_path_templates')
      .update({ usage_count: goldenPath.usage_count + 1 })
      .eq('id', golden_path_id);

    const response = createdResponse({
      data: {
        project,
        catalog_registered: !catalogError,
        golden_path: goldenPath.display_name,
        parameters: resolvedParams,
      },
    });
    setRateLimitHeaders(response, { allowed, remaining, resetAt }, 10);
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ValidationError) {
      return errorResponse(error.message, error.statusCode);
    }
    captureServerError(error, { route: '/api/golden-paths/scaffold' });
    return errorResponse('Internal server error', 500);
  }
}
