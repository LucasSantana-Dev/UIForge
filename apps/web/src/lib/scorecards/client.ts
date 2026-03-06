import type { ProjectScorecard, ScorecardHistoryParams } from './types';

export async function fetchLatestScorecard(projectId: string): Promise<ProjectScorecard | null> {
  const res = await fetch(`/api/scorecards?projectId=${projectId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.scorecard ?? null;
}

export async function fetchScorecardHistory(
  params: ScorecardHistoryParams
): Promise<ProjectScorecard[]> {
  const qs = new URLSearchParams({
    projectId: params.projectId,
    history: 'true',
    ...(params.limit ? { limit: String(params.limit) } : {}),
  });

  const res = await fetch(`/api/scorecards?${qs}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.scorecards ?? [];
}
