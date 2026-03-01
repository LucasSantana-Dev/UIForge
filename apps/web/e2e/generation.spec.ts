import { test, expect } from './fixtures';

test.describe('Component Generation', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  let projectId: string;

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/projects/new');
    await page.getByLabel('Project Name *').fill('Generation Test Project');
    await page.getByLabel('Framework *').selectOption('react');
    await page.getByRole('button', { name: 'Create Project' }).click();

    const url = page.url();
    const match = url.match(/\/projects\/([a-f0-9-]+)/);
    if (match) {
      projectId = match[1];
    }
  });

  test('should display generation page with project context', async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Check page title
    await expect(page.getByRole('heading', { name: 'Generate Component' })).toBeVisible();
    await expect(page.getByText(/describe your component/i)).toBeVisible();

    // Check all three panels are visible
    await expect(page.getByText('Component Name')).toBeVisible();
    await expect(page.getByText('Code Editor')).toBeVisible();
    await expect(page.getByText('Live Preview')).toBeVisible();
  });

  test('should show error when no project is selected', async ({ authenticatedPage: page }) => {
    await page.goto('/generate');

    // Should show error message
    await expect(page.getByText(/no project selected/i)).toBeVisible();
    await expect(page.getByText(/select a project/i)).toBeVisible();
  });

  test('should generate a component', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Fill out generation form
    await page.getByLabel('Component Name *').fill('TestButton');
    await page
      .getByLabel(/describe your component/i)
      .fill(
        'Create a modern button component with primary and secondary variants, hover effects, and a loading state'
      );

    // Check options
    await page.getByLabel(/include tailwind styles/i).check();

    // Submit generation
    await page.getByRole('button', { name: /generate component/i }).click();

    // Should show generating state
    await expect(page.getByText(/generating/i)).toBeVisible();

    // Wait for generation to complete (max 30 seconds)
    await expect(page.getByText(/generating/i)).not.toBeVisible({ timeout: 30000 });

    // Code editor should have generated code
    const codeEditor = page.locator('.monaco-editor').or(page.locator('[class*="editor"]'));
    await expect(codeEditor).toBeVisible();

    // Should contain component name in code
    await expect(page.locator('text=/TestButton/')).toBeVisible();
  });

  test('should validate component name format', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Try invalid component names
    const invalidNames = ['123Invalid', 'invalid-name', 'invalid name', 'invalid.name'];

    for (const name of invalidNames) {
      await page.getByLabel('Component Name *').fill(name);
      await page
        .getByLabel(/describe your component/i)
        .fill('Test description that is long enough');
      await page.getByRole('button', { name: /generate component/i }).click();

      // Should show validation error
      await expect(
        page.getByText(/valid.*identifier/i).or(page.getByText(/invalid.*name/i))
      ).toBeVisible();

      await page.getByLabel('Component Name *').clear();
    }
  });

  test('should validate prompt length', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    await page.getByLabel('Component Name *').fill('ValidName');

    // Too short prompt
    await page.getByLabel(/describe your component/i).fill('Short');
    await page.getByRole('button', { name: /generate component/i }).click();

    await expect(page.getByText(/at least.*characters/i)).toBeVisible();
  });

  test('should copy generated code', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Generate a component first
    await page.getByLabel('Component Name *').fill('CopyTest');
    await page
      .getByLabel(/describe your component/i)
      .fill('A simple test component for copy functionality');
    await page.getByRole('button', { name: /generate component/i }).click();

    await expect(page.getByText(/generating/i)).not.toBeVisible({ timeout: 30000 });

    // Click copy button
    await page.getByRole('button', { name: /copy/i }).click();

    // Should show "Copied" confirmation
    await expect(page.getByText('Copied')).toBeVisible();
  });

  test('should download generated code', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Generate a component first
    await page.getByLabel('Component Name *').fill('DownloadTest');
    await page
      .getByLabel(/describe your component/i)
      .fill('A test component for download functionality');
    await page.getByRole('button', { name: /generate component/i }).click();

    await expect(page.getByText(/generating/i)).not.toBeVisible({ timeout: 30000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.getByRole('button', { name: /download/i }).click();

    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.tsx?$/);
  });

  test('should handle generation with tests option', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    await page.getByLabel('Component Name *').fill('TestWithTests');
    await page
      .getByLabel(/describe your component/i)
      .fill('Component with test generation enabled');

    // Enable test generation
    await page.getByLabel(/generate tests/i).check();

    await page.getByRole('button', { name: /generate component/i }).click();
    await expect(page.getByText(/generating/i)).not.toBeVisible({ timeout: 30000 });

    // Generated code should include tests
    await expect(page.locator('text=/describe|it|test|expect/')).toBeVisible();
  });

  test('should handle rate limiting', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Make multiple rapid requests
    for (let i = 0; i < 12; i++) {
      await page.getByLabel('Component Name *').fill(`RateLimit${i}`);
      await page
        .getByLabel(/describe your component/i)
        .fill(`Test component number ${i} for rate limiting`);
      await page.getByRole('button', { name: /generate component/i }).click();

      // Don't wait for completion, just fire requests
      await page.waitForTimeout(100);
    }

    // Should eventually show rate limit error
    await expect(
      page.getByText(/too many requests/i).or(page.getByText(/rate limit/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should edit generated code in Monaco editor', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Generate a component
    await page.getByLabel('Component Name *').fill('EditTest');
    await page.getByLabel(/describe your component/i).fill('Component for testing code editing');
    await page.getByRole('button', { name: /generate component/i }).click();

    await expect(page.getByText(/generating/i)).not.toBeVisible({ timeout: 30000 });

    // Click in Monaco editor and type
    const editor = page.locator('.monaco-editor textarea').first();
    if ((await editor.count()) > 0) {
      await editor.click();
      await editor.press('Control+A');
      await editor.type('// Modified code');

      // Verify code was modified
      await expect(page.locator('text=/Modified code/')).toBeVisible();
    }
  });

  test('should refresh live preview', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Generate a component
    await page.getByLabel('Component Name *').fill('PreviewTest');
    await page.getByLabel(/describe your component/i).fill('Component for testing preview refresh');
    await page.getByRole('button', { name: /generate component/i }).click();

    await expect(page.getByText(/generating/i)).not.toBeVisible({ timeout: 30000 });

    // Find and click refresh button in preview panel
    const refreshButton = page.getByRole('button', { name: /refresh/i }).last();
    await refreshButton.click();

    // Should show refreshing state briefly
    await expect(refreshButton).toBeDisabled();
    await expect(refreshButton).toBeEnabled({ timeout: 2000 });
  });

  test('should show tips section', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=${projectId}&framework=react`);

    // Check tips are visible
    await expect(page.getByText('Tips:')).toBeVisible();
    await expect(page.getByText(/be specific about styling/i)).toBeVisible();
    await expect(page.getByText(/mention any props/i)).toBeVisible();
  });

  test('should handle generation errors gracefully', async ({ authenticatedPage: page }) => {
    await page.goto(`/generate?projectId=invalid-uuid&framework=react`);

    await page.getByLabel('Component Name *').fill('ErrorTest');
    await page.getByLabel(/describe your component/i).fill('Test error handling in generation');
    await page.getByRole('button', { name: /generate component/i }).click();

    // Should show error message
    await expect(page.getByText(/error/i).or(page.getByText(/failed/i))).toBeVisible({
      timeout: 10000,
    });
  });
});
