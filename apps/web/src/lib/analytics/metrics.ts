export const METRICS_WINDOW_OPTIONS = [7, 30, 90] as const;

export type MetricsWindowDays = (typeof METRICS_WINDOW_OPTIONS)[number];

export interface MetricsUsers {
  total: number;
  last7d: number;
  last30d: number;
  active: number;
}

export interface MetricsGenerations {
  total: number;
  last24h: number;
  last7d: number;
  successRate: number;
}

export interface MetricsProjects {
  total: number;
}

export interface MetricsQuality {
  windowDays: MetricsWindowDays;
  totalGenerations: number;
  revisionRate: number;
  satisfactionRate: number | null;
  satisfactionVotes: number;
  mcpCoverage: number;
}

export interface MetricsReport {
  timestamp: string;
  users: MetricsUsers;
  generations: MetricsGenerations;
  projects: MetricsProjects;
  quality: MetricsQuality;
}
