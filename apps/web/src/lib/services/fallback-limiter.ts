const MAX_DAILY_FALLBACKS = 50;

let fallbackCount = 0;
let currentDate = '';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function canUseFallback(): boolean {
  const date = today();
  if (date !== currentDate) {
    currentDate = date;
    fallbackCount = 0;
  }
  return fallbackCount < MAX_DAILY_FALLBACKS;
}

export function recordFallback(): void {
  const date = today();
  if (date !== currentDate) {
    currentDate = date;
    fallbackCount = 0;
  }
  fallbackCount++;
}

export function getFallbackUsage(): { used: number; limit: number } {
  const date = today();
  if (date !== currentDate) return { used: 0, limit: MAX_DAILY_FALLBACKS };
  return { used: fallbackCount, limit: MAX_DAILY_FALLBACKS };
}
