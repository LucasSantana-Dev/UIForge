'use client';

import { useQuery } from '@tanstack/react-query';

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface Usage {
  generations_count: number;
  tokens_used: number;
  projects_count: number;
  generations_limit: number;
  projects_limit: number;
}

interface UsageResponse {
  usage: Usage;
  subscription: Subscription;
}

async function fetchUsageData(): Promise<UsageResponse> {
  const res = await fetch('/api/usage/current');
  if (!res.ok) throw new Error('Failed to fetch usage data');
  return res.json();
}

export function useSubscription() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-usage'],
    queryFn: fetchUsageData,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    subscription: data?.subscription ?? null,
    usage: data?.usage ?? null,
    isLoading,
    error,
    refetch,
    isPro: data?.subscription?.plan === 'pro',
    isEnterprise: data?.subscription?.plan === 'enterprise',
  };
}
