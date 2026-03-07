import type { NextRequest } from 'next/server';
import {
  verifySession,
  successResponse,
  errorResponse,
  apiErrorResponse,
  type APIError,
} from '@/lib/api';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { getInstallationOctokit } from '@/lib/github/client';

const RATE_LIMIT = 60;
const RATE_WINDOW = 60000;

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  branch: string;
  commit_message: string;
  html_url: string;
  run_started_at: string | null;
  updated_at: string;
  duration_ms: number | null;
}

function parseRepo(repo: string): { owner: string; name: string } | null {
  const match = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/.exec(repo);
  if (!match) return null;
  return { owner: match[1], name: match[2] };
}

function transformRun(run: Record<string, unknown>): WorkflowRun {
  const startedAt = run.run_started_at as string | null;
  const updatedAt = run.updated_at as string;
  let durationMs: number | null = null;

  if (startedAt && run.status === 'completed') {
    durationMs = new Date(updatedAt).getTime() - new Date(startedAt).getTime();
  }

  return {
    id: run.id as number,
    name: (run.name as string) || (run.display_title as string) || 'Unknown',
    status: run.status as string,
    conclusion: (run.conclusion as string) || null,
    branch: (run.head_branch as string) || '',
    commit_message: ((run.head_commit as Record<string, unknown>)
      ?.message as string) || '',
    html_url: run.html_url as string,
    run_started_at: startedAt,
    updated_at: updatedAt,
    duration_ms: durationMs,
  };
}

async function fetchWithInstallation(
  owner: string,
  name: string,
  userId: string
): Promise<WorkflowRun[] | null> {
  try {
    const supabase = await createClient();
    const { data: repos } = await supabase
      .from('github_repos')
      .select('installation_id')
      .eq('full_name', `${owner}/${name}`)
      .limit(1);

    if (!repos?.length) return null;

    const installationId = repos[0].installation_id;
    const { data: installation } = await supabase
      .from('github_installations')
      .select('id')
      .eq('installation_id', installationId)
      .eq('user_id', userId)
      .limit(1);

    if (!installation?.length) return null;

    const octokit = await getInstallationOctokit(installationId);
    const response = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo: name,
      per_page: 10,
    });

    return response.data.workflow_runs.map((r) =>
      transformRun(r as unknown as Record<string, unknown>)
    );
  } catch {
    return null;
  }
}

async function fetchPublic(
  owner: string,
  name: string
): Promise<WorkflowRun[]> {
  const url =
    `https://api.github.com/repos/${owner}/${name}` +
    `/actions/runs?per_page=10`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Siza-IDP/1.0' },
    signal: controller.signal,
  });

  clearTimeout(timer);

  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status}`);
  }

  const data = await res.json();
  return (data.workflow_runs || []).map(
    (r: Record<string, unknown>) => transformRun(r)
  );
}

export async function GET(request: NextRequest) {
  try {
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse('Rate limit exceeded', 429, {
        retry_after: Math.ceil(
          (rateResult.resetAt - Date.now()) / 1000
        ),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    const session = await verifySession();

    const repo = request.nextUrl.searchParams.get('repo');
    if (!repo) {
      return setRateLimitHeaders(
        errorResponse('Missing repo parameter', 400),
        rateResult,
        RATE_LIMIT
      );
    }

    const parsed = parseRepo(repo);
    if (!parsed) {
      return setRateLimitHeaders(
        errorResponse('Invalid repo format, expected owner/repo', 400),
        rateResult,
        RATE_LIMIT
      );
    }

    const { owner, name } = parsed;
    const userId = session.user.id;

    let runs = await fetchWithInstallation(owner, name, userId);
    if (runs === null) {
      runs = await fetchPublic(owner, name);
    }

    const response = successResponse(runs);
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse('Failed to fetch workflow runs', 502);
  }
}
