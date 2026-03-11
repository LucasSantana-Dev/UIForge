import { test, expect } from './fixtures';

type MockSseEvent = {
  type: 'start' | 'chunk' | 'complete' | 'error';
  content?: string;
  message?: string;
  generationId?: string;
  totalLength?: number;
  qualityPassed?: boolean;
};

function buildSseBody(events: MockSseEvent[]): string {
  return events
    .map((event) => {
      const payload = { ...event, timestamp: Date.now() };
      return `data: ${JSON.stringify(payload)}\n\n`;
    })
    .join('');
}

test.describe('Component Generation (mocked)', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');
  test.setTimeout(90000);

  let projectId: string;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/projects/new');
    await page.getByLabel(/project name/i).fill('Generation Test Project');
    await page.getByLabel(/framework/i).selectOption('react');
    await page.getByRole('button', { name: /create project/i }).click();

    await page.waitForURL(/\/projects\/[a-f0-9-]+/);
    const match = page.url().match(/\/projects\/([a-f0-9-]+)/);
    if (!match) {
      throw new Error(`Could not parse project id from URL: ${page.url()}`);
    }
    projectId = match[1];
  });

  test('shows generate workspace and panels', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    await expect(page.getByLabel(/component name/i)).toBeVisible();
    await expect(page.getByLabel(/describe your component/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^preview$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^code$/i })).toBeVisible();
    await expect(page.getByText(/ready to generate/i)).toBeVisible();
  });

  test('shows empty-state message when no project is selected', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/generate');

    await expect(page.getByText(/no project selected/i)).toBeVisible();
    await expect(page.getByText(/create a project/i)).toBeVisible();
  });

  test('validates prompt length client-side', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    await page.getByLabel(/component name/i).fill('ValidName');
    await page
      .getByLabel(/describe your component/i)
      .first()
      .fill('Short');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/at least 10 characters/i)).toBeVisible();
  });

  test('generates code from mocked SSE and refreshes preview', async ({
    authenticatedPage: page,
  }) => {
    const generatedCode = [
      "'use client';",
      "import React from 'react';",
      '',
      'export default function SizaMockButton() {',
      '  return <button className="px-4 py-2 rounded bg-violet-600 text-white">Mock</button>;',
      '}',
    ].join('\n');

    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'start' },
          { type: 'chunk', content: generatedCode },
          {
            type: 'complete',
            generationId: 'gen-mock-1',
            totalLength: generatedCode.length,
            qualityPassed: true,
          },
        ]),
      });
    });

    await page.goto(`/generate?projectId=${projectId}&framework=react`);
    await page.getByLabel(/component name/i).fill('SizaMockButton');
    await page
      .getByLabel(/describe your component/i)
      .first()
      .fill('Create a compact CTA button with primary style and loading state.');

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/generation complete/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /copy code/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download code/i })).toBeVisible();

    await page.getByRole('button', { name: /^preview$/i }).click();
    const previewFrame = page.locator('iframe[title="Component Preview"]');
    await expect(previewFrame).toBeVisible();

    const srcDoc = await previewFrame.getAttribute('srcdoc');
    expect(srcDoc).toContain('SizaMockButton');

    const refreshButton = page.getByRole('button', { name: /refresh preview/i });
    await refreshButton.click();
    await expect(refreshButton).toBeDisabled();
    await expect(refreshButton).toBeEnabled({ timeout: 2000 });
  });

  test('downloads generated code from mocked result', async ({ authenticatedPage: page }) => {
    const generatedCode = 'export default function DownloadMock(){return <div>download</div>}';

    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'start' },
          { type: 'chunk', content: generatedCode },
          { type: 'complete', generationId: 'gen-mock-2', totalLength: generatedCode.length },
        ]),
      });
    });

    await page.goto(`/generate?projectId=${projectId}&framework=react`);
    await page.getByLabel(/component name/i).fill('DownloadMock');
    await page
      .getByLabel(/describe your component/i)
      .first()
      .fill('Build a tiny component for download verification.');

    await page.locator('form button[type="submit"]').click();
    await expect(page.getByRole('button', { name: /download code/i })).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download code/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.tsx?$/);
  });

  test('renders API stream errors', async ({ authenticatedPage: page }) => {
    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'start' },
          {
            type: 'error',
            message: 'AI provider capacity reached. Please add a BYOK key and retry.',
          },
        ]),
      });
    });

    await page.goto(`/generate?projectId=${projectId}&framework=react`);
    await page.getByLabel(/component name/i).fill('ErrorMock');
    await page
      .getByLabel(/describe your component/i)
      .first()
      .fill('Trigger stream error rendering for capacity guidance.');

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/error details/i)).toBeVisible();
    await expect(page.getByText(/ai capacity reached/i).first()).toBeVisible();
  });
});
