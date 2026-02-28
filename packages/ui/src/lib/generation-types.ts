export interface GenerationEvent {
  type: 'start' | 'chunk' | 'complete' | 'error';
  content?: string;
  totalLength?: number;
  message?: string;
  timestamp: number;
}

export interface QualityResult {
  gate: string;
  passed: boolean;
  severity: 'error' | 'warning';
  issues: string[];
}

export interface QualityReport {
  score: number;
  results: QualityResult[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}
