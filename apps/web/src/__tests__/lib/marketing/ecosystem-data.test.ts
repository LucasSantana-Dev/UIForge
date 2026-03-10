import { getEcosystemSnapshot, getFallbackEcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function toUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

describe('marketing ecosystem data', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
      return;
    }

    delete (globalThis as { fetch?: typeof fetch }).fetch;
  });

  it('maps GitHub metadata into normalized repo snapshot', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = toUrl(input);

      if (url.includes('/orgs/Forge-Space/repos')) {
        return jsonResponse([
          {
            name: 'core',
            html_url: 'https://github.com/Forge-Space/core',
            description: 'Core repo',
            updated_at: '2026-03-10T19:01:18Z',
          },
          {
            name: 'siza-desktop',
            html_url: 'https://github.com/Forge-Space/siza-desktop',
            description: 'Desktop',
            updated_at: '2026-02-28T04:27:04Z',
          },
        ]) as unknown as Response;
      }

      if (url.includes('/repos/Forge-Space/core/releases/latest')) {
        return jsonResponse({
          tag_name: 'v1.10.2',
          published_at: '2026-03-10T19:30:00Z',
        }) as unknown as Response;
      }

      if (url.includes('/repos/Forge-Space/siza-desktop/releases/latest')) {
        return jsonResponse({}, 404) as unknown as Response;
      }

      return jsonResponse({}, 404) as unknown as Response;
    });
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock as unknown as typeof fetch,
      writable: true,
      configurable: true,
    });

    const snapshot = await getEcosystemSnapshot();

    expect(snapshot.repoCount).toBe(11);
    expect(snapshot.releasedRepoCount).toBeGreaterThan(0);

    const core = snapshot.repos.find((repo) => repo.name === 'core');
    expect(core?.latestReleaseTag).toBe('v1.10.2');
    expect(core?.latestReleaseDate).toBe('2026-03-10T19:30:00Z');

    const desktop = snapshot.repos.find((repo) => repo.name === 'siza-desktop');
    expect(desktop?.latestReleaseTag).toBeNull();
  });

  it('falls back to static release metadata on release endpoint failure', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = toUrl(input);

      if (url.includes('/orgs/Forge-Space/repos')) {
        return jsonResponse([
          {
            name: 'core',
            html_url: 'https://github.com/Forge-Space/core',
            description: 'Core repo',
            updated_at: '2026-03-10T19:01:18Z',
          },
        ]) as unknown as Response;
      }

      if (url.includes('/repos/Forge-Space/core/releases/latest')) {
        return jsonResponse({}, 403) as unknown as Response;
      }

      return jsonResponse({}, 404) as unknown as Response;
    });
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock as unknown as typeof fetch,
      writable: true,
      configurable: true,
    });

    const snapshot = await getEcosystemSnapshot();
    const core = snapshot.repos.find((repo) => repo.name === 'core');

    expect(core?.latestReleaseTag).toBe('v1.10.1');
    expect(core?.latestReleaseDate).toBe('2026-03-08T16:24:14Z');
  });

  it('returns fallback snapshot if repo list request fails', async () => {
    const fetchMock = jest.fn(async () => jsonResponse({}, 500) as unknown as Response);
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock as unknown as typeof fetch,
      writable: true,
      configurable: true,
    });

    const snapshot = await getEcosystemSnapshot();
    const fallback = getFallbackEcosystemSnapshot();

    expect(snapshot.repoCount).toBe(11);
    expect(snapshot.lastSyncedAt).toBe(fallback.lastSyncedAt);
    expect(snapshot.repos[0].name).toBe(fallback.repos[0].name);
  });
});
