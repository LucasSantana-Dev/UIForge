import {
  captureLeadAttributionFromCurrentUrl,
  getStoredLeadAttribution,
  LEAD_ATTRIBUTION_STORAGE_KEY,
} from '@/lib/analytics/lead-attribution';

describe('lead-attribution', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('captures first-touch attribution from URL params', () => {
    const payload = captureLeadAttributionFromCurrentUrl(
      new URL(
        'https://siza.forgespace.co/?utm_source=google&utm_medium=cpc&utm_campaign=siza_test&utm_term=ai%20app&gclid=test-gclid'
      )
    );

    expect(payload.utm_source).toBe('google');
    expect(payload.utm_medium).toBe('cpc');
    expect(payload.utm_campaign).toBe('siza_test');
    expect(payload.utm_term).toBe('ai app');
    expect(payload.gclid).toBe('test-gclid');
    expect(payload.landing_path).toBe('/');
    expect(typeof payload.first_seen_at).toBe('string');
    expect(localStorage.getItem(LEAD_ATTRIBUTION_STORAGE_KEY)).not.toBeNull();
  });

  it('does not overwrite first-touch attribution after initial capture', () => {
    const first = captureLeadAttributionFromCurrentUrl(
      new URL('https://siza.forgespace.co/?utm_source=google&utm_medium=cpc&utm_campaign=first')
    );

    const second = captureLeadAttributionFromCurrentUrl(
      new URL(
        'https://siza.forgespace.co/signup?utm_source=linkedin&utm_medium=paid&utm_campaign=second'
      )
    );

    expect(second.utm_source).toBe('google');
    expect(second.utm_campaign).toBe('first');
    expect(second.first_seen_at).toBe(first.first_seen_at);
  });

  it('returns null for invalid payload in storage', () => {
    localStorage.setItem(LEAD_ATTRIBUTION_STORAGE_KEY, '{"invalid":true}');
    expect(getStoredLeadAttribution()).toBeNull();
  });
});
