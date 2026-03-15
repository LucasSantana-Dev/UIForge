import { GET as getInstall } from '@/app/api/github/install/route';
import { POST as postPush } from '@/app/api/github/push/route';
import { POST as postLink } from '@/app/api/github/repos/link/route';
import { POST as postUnlink } from '@/app/api/github/repos/unlink/route';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/api/auth', () => ({ verifySession: jest.fn() }));
jest.mock('@/lib/github/client', () => ({ getAppInstallUrl: jest.fn() }));
jest.mock('@/lib/services/github.service', () => ({ createPRFromGeneration: jest.fn() }));
jest.mock('@/lib/quality/gates', () => ({ runAllGates: jest.fn() }));
jest.mock('@/lib/github/pipeline', () => ({
  linkRepoToProject: jest.fn(),
  unlinkRepo: jest.fn(),
}));

import { verifySession } from '@/lib/api/auth';
import { getAppInstallUrl } from '@/lib/github/client';
import { createPRFromGeneration } from '@/lib/services/github.service';
import { runAllGates } from '@/lib/quality/gates';
import { linkRepoToProject, unlinkRepo } from '@/lib/github/pipeline';

const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockGetAppInstallUrl = getAppInstallUrl as jest.MockedFunction<typeof getAppInstallUrl>;
const mockCreatePR = createPRFromGeneration as jest.MockedFunction<typeof createPRFromGeneration>;
const mockRunAllGates = runAllGates as jest.MockedFunction<typeof runAllGates>;
const mockLinkRepo = linkRepoToProject as jest.MockedFunction<typeof linkRepoToProject>;
const mockUnlinkRepo = unlinkRepo as jest.MockedFunction<typeof unlinkRepo>;

const USER = { id: 'u1', email: 'user@test.com' };
const GATES_PASS = { passed: true, score: 95, gates: [] };
const GATES_FAIL = { passed: false, score: 40, gates: [{ name: 'complexity', passed: false }] };
const PR_RESULT = { number: 42, url: 'https://github.com/org/repo/pull/42', title: 'Add Button' };

// Capture redirects — use a stub that avoids Next.js absolute-URL validation
const redirectUrls: string[] = [];
jest.spyOn(NextResponse, 'redirect').mockImplementation((url: string | URL) => {
  redirectUrls.push(String(url));
  // Return a minimal 307 response without calling Next's real redirect
  return new Response(null, { status: 307, headers: { location: String(url) } }) as never;
});

function makeRequest(url: string, body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method: 'POST',
    ...(body
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  redirectUrls.length = 0;
  mockVerifySession.mockResolvedValue({ user: USER } as never);
  mockGetAppInstallUrl.mockReturnValue('https://github.com/apps/siza/installations/new');
  mockRunAllGates.mockReturnValue(GATES_PASS as never);
  mockCreatePR.mockResolvedValue(PR_RESULT as never);
  mockLinkRepo.mockResolvedValue(undefined);
  mockUnlinkRepo.mockResolvedValue(undefined);
});

// ── GET /api/github/install ───────────────────────────────────────────────────
describe('GET /api/github/install', () => {
  it('redirects to GitHub App install URL when authenticated', async () => {
    const res = await getInstall();

    expect(res.status).toBe(307);
    expect(redirectUrls[0]).toContain('github.com/apps/siza');
  });

  it('redirects to login when not authenticated', async () => {
    mockVerifySession.mockRejectedValue(new Error('Unauthorized'));

    const res = await getInstall();

    expect(res.status).toBe(307);
    expect(redirectUrls[0]).toContain('/auth/login');
  });
});

// ── POST /api/github/push ─────────────────────────────────────────────────────
describe('POST /api/github/push', () => {
  const VALID_BODY = {
    projectId: 'p1',
    generationId: 'g1',
    componentName: 'MyButton',
    code: 'export default function MyButton() { return <button>Click</button>; }',
    prompt: 'A clickable button',
    model: 'gemini-2.5-flash',
  };

  it('creates a PR and returns it', async () => {
    const res = await postPush(makeRequest('http://localhost/api/github/push', VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pr).toEqual(PR_RESULT);
    expect(mockRunAllGates).toHaveBeenCalledWith(VALID_BODY.code);
    expect(mockCreatePR).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER.id, projectId: 'p1', componentName: 'MyButton' })
    );
  });

  it('uses tsx extension when code contains the word React', async () => {
    // Route checks: code.includes('tsx') || code.includes('React')
    // Must have literal 'React' or 'tsx' in the string
    await postPush(
      makeRequest('http://localhost/api/github/push', {
        ...VALID_BODY,
        code: "import React from 'react'; export default function MyButton() { return <button/>; }",
      })
    );

    expect(mockCreatePR).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [expect.objectContaining({ path: 'src/components/my-button.tsx' })],
      })
    );
  });

  it('converts camelCase component name to kebab-case file path', async () => {
    await postPush(
      makeRequest('http://localhost/api/github/push', {
        ...VALID_BODY,
        componentName: 'UserProfileCard',
        code: 'export default function UserProfileCard() {}',
      })
    );

    expect(mockCreatePR).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [expect.objectContaining({ path: 'src/components/user-profile-card.ts' })],
      })
    );
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await postPush(
      makeRequest('http://localhost/api/github/push', {
        projectId: 'p1',
        // missing componentName and code
      })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing required fields/i);
  });

  it('returns 422 when quality gates fail', async () => {
    mockRunAllGates.mockReturnValue(GATES_FAIL as never);

    const res = await postPush(makeRequest('http://localhost/api/github/push', VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toMatch(/Quality gates failed/i);
    expect(body.report).toEqual(GATES_FAIL);
  });

  it('returns 404 when no GitHub repo linked', async () => {
    mockCreatePR.mockRejectedValue(new Error('No GitHub repo linked to this project'));

    const res = await postPush(makeRequest('http://localhost/api/github/push', VALID_BODY));
    void (await res.json());

    expect(res.status).toBe(404);
  });

  it('returns 500 on unexpected error', async () => {
    mockCreatePR.mockRejectedValue(new Error('GitHub API timeout'));

    const res = await postPush(makeRequest('http://localhost/api/github/push', VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('GitHub API timeout');
  });
});

// ── POST /api/github/repos/link ───────────────────────────────────────────────
describe('POST /api/github/repos/link', () => {
  it('links repo to project', async () => {
    const res = await postLink(
      makeRequest('http://localhost/api/github/repos/link', {
        repoId: 'repo-1',
        projectId: 'p1',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockLinkRepo).toHaveBeenCalledWith('repo-1', 'p1');
  });

  it('returns 400 when repoId is missing', async () => {
    const res = await postLink(
      makeRequest('http://localhost/api/github/repos/link', {
        projectId: 'p1',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing repoId or projectId/i);
  });

  it('returns 400 when projectId is missing', async () => {
    const res = await postLink(
      makeRequest('http://localhost/api/github/repos/link', {
        repoId: 'repo-1',
      })
    );

    expect(res.status).toBe(400);
  });

  it('returns 500 on service error', async () => {
    mockLinkRepo.mockRejectedValue(new Error('DB error'));

    const res = await postLink(
      makeRequest('http://localhost/api/github/repos/link', {
        repoId: 'repo-1',
        projectId: 'p1',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('DB error');
  });
});

// ── POST /api/github/repos/unlink ─────────────────────────────────────────────
describe('POST /api/github/repos/unlink', () => {
  it('unlinks repo from project', async () => {
    const res = await postUnlink(
      makeRequest('http://localhost/api/github/repos/unlink', {
        projectId: 'p1',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockUnlinkRepo).toHaveBeenCalledWith('p1');
  });

  it('returns 400 when projectId is missing', async () => {
    const res = await postUnlink(makeRequest('http://localhost/api/github/repos/unlink', {}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Missing projectId/i);
  });

  it('returns 500 on service error', async () => {
    mockUnlinkRepo.mockRejectedValue(new Error('Repo not found'));

    const res = await postUnlink(
      makeRequest('http://localhost/api/github/repos/unlink', {
        projectId: 'p1',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Repo not found');
  });
});
