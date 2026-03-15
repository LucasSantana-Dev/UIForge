import { POST, GET } from '@/app/api/wireframe/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/sentry/server', () => ({ captureServerError: jest.fn() }));

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/wireframe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  framework: 'react',
  componentType: 'web',
  description: 'A web dashboard with charts and navigation',
  style: 'high-fidelity',
  outputFormat: 'json',
};

describe('GET /api/wireframe', () => {
  it('returns API info', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('Wireframe API');
    expect(body.version).toBeDefined();
    expect(body.endpoints).toBeDefined();
  });
});

describe('POST /api/wireframe', () => {
  it('generates wireframe for valid request', async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.wireframe).toBeDefined();
    expect(body.wireframe.width).toBe(1200);
    expect(body.wireframe.height).toBe(800);
    expect(body.metadata.framework).toBe('react');
    expect(body.metadata.componentType).toBe('web');
    expect(body.metadata.outputFormat).toBe('json');
  });

  it('generates login elements when description includes login', async () => {
    const res = await POST(
      makePostRequest({
        ...VALID_BODY,
        description: 'A login screen with email and password',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    const elementIds = body.wireframe.elements.map((e: { id: string }) => e.id);
    expect(elementIds).toContain('email-input');
    expect(elementIds).toContain('password-input');
    expect(elementIds).toContain('login-button');
  });

  it('generates header elements when description includes header', async () => {
    const res = await POST(
      makePostRequest({
        ...VALID_BODY,
        description: 'A header navigation component for the site',
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    const elementIds = body.wireframe.elements.map((e: { id: string }) => e.id);
    expect(elementIds).toContain('header');
  });

  it('returns default elements when no specific pattern matched', async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    const elementIds = body.wireframe.elements.map((e: { id: string }) => e.id);
    expect(elementIds).toContain('title');
    expect(elementIds).toContain('content');
  });

  it('uses correct dimensions for mobile', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, componentType: 'mobile' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.wireframe.width).toBe(375);
    expect(body.wireframe.height).toBe(812);
  });

  it('uses correct dimensions for tablet', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, componentType: 'tablet' }));
    const body = await res.json();

    expect(body.wireframe.width).toBe(768);
    expect(body.wireframe.height).toBe(1024);
  });

  it('uses correct dimensions for desktop', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, componentType: 'desktop' }));
    const body = await res.json();

    expect(body.wireframe.width).toBe(1440);
    expect(body.wireframe.height).toBe(900);
  });

  it('returns 400 when description is missing', async () => {
    const { description: _, ...bodyWithout } = VALID_BODY;
    const res = await POST(makePostRequest(bodyWithout));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Description is required/i);
  });

  it('returns 400 when description is too short', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, description: 'Short' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/at least 10 characters/i);
  });

  it('returns 400 for invalid framework', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, framework: 'ember' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid framework/i);
  });

  it('returns 400 for invalid componentType', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, componentType: 'tv' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid component type/i);
  });

  it('returns 400 for invalid style', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, style: 'sketch' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid style/i);
  });

  it('returns 400 for invalid outputFormat', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, outputFormat: 'pdf' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid output format/i);
  });

  it('applies wireframe style for low-fidelity', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, style: 'low-fidelity' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.wireframe.styles.theme).toBe('wireframe');
    expect(body.wireframe.styles.colors).toEqual(['#000000', '#ffffff']);
  });

  it('applies prototype style', async () => {
    const res = await POST(makePostRequest({ ...VALID_BODY, style: 'prototype' }));
    const body = await res.json();

    expect(body.wireframe.styles.theme).toBe('interactive');
  });

  it('includes generatedAt timestamp in metadata', async () => {
    const res = await POST(makePostRequest(VALID_BODY));
    const body = await res.json();

    expect(body.metadata.generatedAt).toBeDefined();
    expect(() => new Date(body.metadata.generatedAt)).not.toThrow();
  });
});
