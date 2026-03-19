import { GET as getRepos } from '@/app/api/github/repos/route';
import { GET as getPRs } from '@/app/api/github/prs/route';
import { GET as getCallback } from '@/app/api/github/callback/route';
import { POST as postWebhook } from '@/app/api/github/webhook/route';
import { NextRequest, NextResponse } from 'next/server';

// Capture redirect URLs — NextResponse.redirect's Location header is unreliable in Jest
const redirectUrls: string[] = [];
const originalRedirect = NextResponse.redirect.bind(NextResponse);
jest.spyOn(NextResponse, 'redirect').mockImplementation((url: string | URL) => {
  redirectUrls.push(String(url));
  return originalRedirect(url);
});

// ── Auth mock ────────────────────────────────────────────────────────────────
jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));

// ── GitHub service mocks ──────────────────────────────────────────────────────
jest.mock('@/lib/github/operations', () => ({ listRepos: jest.fn() }));
jest.mock('@/lib/services/github.service', () => ({ getProjectPRs: jest.fn() }));
jest.mock('@/lib/repositories/github.repo', () => ({ updatePRState: jest.fn() }));

// ── Supabase mock (multi-table) ───────────────────────────────────────────────
const mockUpsert = jest.fn().mockResolvedValue({ error: null });
const mockDelete = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn().mockResolvedValue({ error: null });
const mockInstSingle = jest.fn();
const mockRepoSingle = jest.fn();
const mockInIsNull = jest.fn().mockResolvedValue({ data: [], error: null });

const mockFrom = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ from: mockFrom })),
}));

import { verifySession } from '@/lib/api/auth';
import { listRepos } from '@/lib/github/operations';
import { getProjectPRs } from '@/lib/services/github.service';
import { updatePRState } from '@/lib/repositories/github.repo';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockListRepos = listRepos as jest.MockedFunction<typeof listRepos>;
const mockGetProjectPRs = getProjectPRs as jest.MockedFunction<typeof getProjectPRs>;
const mockUpdatePRState = updatePRState as jest.MockedFunction<typeof updatePRState>;

const USER = { id: 'u1', email: 'user@test.com', user_metadata: { user_name: 'alice' } };

beforeEach(() => {
  jest.clearAllMocks();
  redirectUrls.length = 0;
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockListRepos.mockResolvedValue([]);
  mockGetProjectPRs.mockResolvedValue([]);
  mockUpdatePRState.mockResolvedValue(undefined);
});

// ── GET /api/github/repos ─────────────────────────────────────────────────────
describe('GET /api/github/repos', () => {
  it('returns empty repos when no installations', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ is: mockInIsNull })) })),
    });

    const res = await getRepos();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.repos).toEqual([]);
    expect(body.installations).toEqual([]);
  });

  it('returns repos from all active installations', async () => {
    const installations = [
      { id: 'inst-1', installation_id: 101, account_login: 'alice', account_type: 'User' },
    ];
    mockInIsNull.mockResolvedValue({ data: installations, error: null });
    mockListRepos.mockResolvedValue([{ id: 1, full_name: 'alice/repo1' }] as never);
    mockFrom.mockReturnValue({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ is: mockInIsNull })) })),
    });

    const res = await getRepos();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.repos).toHaveLength(1);
    expect(body.repos[0].full_name).toBe('alice/repo1');
    expect(body.repos[0].installationId).toBe('inst-1');
  });

  it('returns 500 on db error', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          is: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        })),
      })),
    });

    const res = await getRepos();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('DB error');
  });
});

// ── GET /api/github/prs ───────────────────────────────────────────────────────
describe('GET /api/github/prs', () => {
  function makeRequest(params: Record<string, string> = {}) {
    const url = new URL('http://localhost/api/github/prs');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return new NextRequest(url.toString());
  }

  it('returns PRs for project', async () => {
    const prs = [{ number: 1, title: 'Fix bug', state: 'open' }];
    mockGetProjectPRs.mockResolvedValue(prs as never);

    const res = await getPRs(makeRequest({ projectId: 'p1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.prs).toEqual(prs);
    expect(mockGetProjectPRs).toHaveBeenCalledWith('u1', 'p1');
  });

  it('returns 400 when projectId is missing', async () => {
    const res = await getPRs(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing projectId/i);
  });

  it('returns 500 on service error', async () => {
    mockGetProjectPRs.mockRejectedValue(new Error('GitHub API error'));

    const res = await getPRs(makeRequest({ projectId: 'p1' }));
    void (await res.json());

    expect(res.status).toBe(500);
  });
});

// ── GET /api/github/callback ──────────────────────────────────────────────────
describe('GET /api/github/callback', () => {
  function makeRequest(params: Record<string, string> = {}) {
    const url = new URL('http://localhost/api/github/callback');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return new NextRequest(url.toString());
  }

  beforeEach(() => {
    mockFrom.mockReturnValue({ upsert: mockUpsert });
  });

  it('redirects to dashboard with github=connected on success', async () => {
    const res = await getCallback(
      makeRequest({ installation_id: '12345', setup_action: 'install' })
    );

    expect(res.status).toBe(307);
    expect(redirectUrls[0]).toContain('github=connected');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ installation_id: 12345, user_id: 'u1' }),
      { onConflict: 'installation_id' }
    );
  });

  it('redirects with error when installation_id is missing', async () => {
    const res = await getCallback(makeRequest({ setup_action: 'install' }));

    expect(res.status).toBe(307);
    expect(redirectUrls[0]).toContain('error=github_install_failed');
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('redirects with error when setup_action is not install', async () => {
    const res = await getCallback(makeRequest({ installation_id: '123', setup_action: 'update' }));

    expect(res.status).toBe(307);
    expect(redirectUrls[0]).toContain('error=github_install_failed');
  });

  it('redirects with error on upsert failure', async () => {
    mockUpsert.mockResolvedValue({ error: new Error('DB error') });

    const res = await getCallback(makeRequest({ installation_id: '123', setup_action: 'install' }));

    expect(res.status).toBe(307);
    expect(redirectUrls[0]).toContain('error=github_install_failed');
  });
});

// ── POST /api/github/webhook ──────────────────────────────────────────────────
describe('POST /api/github/webhook', () => {
  const WEBHOOK_SECRET = 'test-secret';

  function makeSig(body: string) {
    const crypto = require('crypto');
    return 'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
  }

  function makeWebhookRequest(event: string, payload: Record<string, unknown>) {
    const body = JSON.stringify(payload);
    return new NextRequest('http://localhost/api/github/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': event,
        'x-hub-signature-256': makeSig(body),
      },
      body,
    });
  }

  beforeEach(() => {
    process.env.GITHUB_APP_WEBHOOK_SECRET = WEBHOOK_SECRET;
    mockFrom.mockReturnValue({
      upsert: mockUpsert,
      delete: jest.fn(() => ({ eq: mockDelete })),
      update: jest.fn(() => ({ eq: mockUpdate })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ single: mockInstSingle })),
      })),
    });
    mockInstSingle.mockResolvedValue({ data: { id: 'db-inst-1' }, error: null });
  });

  afterEach(() => {
    delete process.env.GITHUB_APP_WEBHOOK_SECRET;
  });

  it('returns 500 when webhook secret is not configured', async () => {
    delete process.env.GITHUB_APP_WEBHOOK_SECRET;
    const req = new NextRequest('http://localhost/api/github/webhook', {
      method: 'POST',
      body: '{}',
    });
    const res = await postWebhook(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 401 for invalid signature', async () => {
    // Provide a 64-hex-char wrong hash (same length as real sha256, but wrong value)
    const wrongSig = 'sha256=' + '0'.repeat(64);
    const req = new NextRequest('http://localhost/api/github/webhook', {
      method: 'POST',
      headers: { 'x-hub-signature-256': wrongSig, 'x-github-event': 'ping' },
      body: '{"action":"ping"}',
    });
    const res = await postWebhook(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/Invalid signature/i);
  });

  it('returns 401 when signature header is missing', async () => {
    const req = new NextRequest('http://localhost/api/github/webhook', {
      method: 'POST',
      headers: { 'x-github-event': 'ping' },
      body: '{"action":"ping"}',
    });
    const res = await postWebhook(req);
    expect(res.status).toBe(401);
  });

  it('handles installation created event', async () => {
    const payload = {
      action: 'created',
      installation: {
        id: 999,
        account: { login: 'alice', type: 'User' },
        permissions: { contents: 'read' },
      },
      sender: { id: 42 },
    };
    const res = await postWebhook(makeWebhookRequest('installation', payload));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ installation_id: 999, account_login: 'alice' }),
      { onConflict: 'installation_id' }
    );
  });

  it('handles installation deleted event', async () => {
    const payload = { action: 'deleted', installation: { id: 999 }, sender: { id: 42 } };
    const res = await postWebhook(makeWebhookRequest('installation', payload));

    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith('installation_id', 999);
  });

  it('handles pull_request opened event', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'github_repos') {
        return { select: jest.fn(() => ({ eq: jest.fn(() => ({ single: mockRepoSingle })) })) };
      }
      return {
        upsert: mockUpsert,
        delete: jest.fn(() => ({ eq: mockDelete })),
        update: jest.fn(() => ({ eq: mockUpdate })),
      };
    });
    mockRepoSingle.mockResolvedValue({ data: { id: 'repo-db-1' }, error: null });

    const payload = {
      action: 'opened',
      pull_request: { number: 42 },
      repository: { id: 101 },
    };
    const res = await postWebhook(makeWebhookRequest('pull_request', payload));

    expect(res.status).toBe(200);
    expect(mockUpdatePRState).toHaveBeenCalledWith('repo-db-1', 42, 'open');
  });

  it('handles unknown event type gracefully', async () => {
    const payload = { action: 'ping' };
    const res = await postWebhook(makeWebhookRequest('ping', payload));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });
});
