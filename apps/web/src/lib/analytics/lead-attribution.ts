export interface LeadAttributionPayload {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  landing_path: string;
  first_seen_at: string;
}

export const LEAD_ATTRIBUTION_STORAGE_KEY = 'siza_lead_first_touch_v1';

function normalizeParam(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isLeadAttributionPayload(value: unknown): value is LeadAttributionPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;

  return (
    (typeof payload.utm_source === 'string' || payload.utm_source === null) &&
    (typeof payload.utm_medium === 'string' || payload.utm_medium === null) &&
    (typeof payload.utm_campaign === 'string' || payload.utm_campaign === null) &&
    (typeof payload.utm_term === 'string' || payload.utm_term === null) &&
    (typeof payload.utm_content === 'string' || payload.utm_content === null) &&
    (typeof payload.gclid === 'string' || payload.gclid === null) &&
    (typeof payload.gbraid === 'string' || payload.gbraid === null) &&
    (typeof payload.wbraid === 'string' || payload.wbraid === null) &&
    typeof payload.landing_path === 'string' &&
    typeof payload.first_seen_at === 'string'
  );
}

function createAttributionPayload(currentUrl: URL): LeadAttributionPayload {
  const params = currentUrl.searchParams;

  return {
    utm_source: normalizeParam(params.get('utm_source')),
    utm_medium: normalizeParam(params.get('utm_medium')),
    utm_campaign: normalizeParam(params.get('utm_campaign')),
    utm_term: normalizeParam(params.get('utm_term')),
    utm_content: normalizeParam(params.get('utm_content')),
    gclid: normalizeParam(params.get('gclid')),
    gbraid: normalizeParam(params.get('gbraid')),
    wbraid: normalizeParam(params.get('wbraid')),
    landing_path: currentUrl.pathname || '/',
    first_seen_at: new Date().toISOString(),
  };
}

export function getStoredLeadAttribution(): LeadAttributionPayload | null {
  if (!canUseStorage()) return null;

  const storedValue = window.localStorage.getItem(LEAD_ATTRIBUTION_STORAGE_KEY);
  if (!storedValue) return null;

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    return isLeadAttributionPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function captureLeadAttributionFromCurrentUrl(currentUrl: URL): LeadAttributionPayload {
  const existingAttribution = getStoredLeadAttribution();
  if (existingAttribution) return existingAttribution;

  const payload = createAttributionPayload(currentUrl);

  if (canUseStorage()) {
    window.localStorage.setItem(LEAD_ATTRIBUTION_STORAGE_KEY, JSON.stringify(payload));
  }

  return payload;
}
