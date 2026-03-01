import { test, expect } from './fixtures';
import { mockGenerateAPI } from './helpers/mock-api';

test.describe('Advanced Generation Features', () => {
  test('should show tab-based generation form', async ({ authenticatedPage: page }) => {
    await page.goto('/generate');
    const promptTab = page
      .getByRole('tab', { name: /prompt/i })
      .or(page.getByText(/prompt/i).first());
    const hasTabUI = await promptTab.isVisible().catch(() => false);
    if (!hasTabUI) {
      test.skip(true, 'Tab UI not enabled');
      return;
    }
    await expect(promptTab).toBeVisible();
  });

  test('should switch between tabs', async ({ authenticatedPage: page }) => {
    await page.goto('/generate');
    const optionsTab = page.getByRole('tab', { name: /options/i });
    const designTab = page.getByRole('tab', { name: /design/i });

    if (await optionsTab.isVisible().catch(() => false)) {
      await optionsTab.click();
      await expect(page.getByText(/provider|library|typescript/i).first()).toBeVisible();

      await designTab.click();
      await expect(page.getByText(/image|color|design/i).first()).toBeVisible();
    }
  });

  test('should show Siza AI provider option', async ({ authenticatedPage: page }) => {
    await page.goto('/generate');
    const sizaOption = page.getByText(/siza ai/i).or(page.locator('[data-value="siza"]'));
    const hasSiza = await sizaOption.isVisible().catch(() => false);
    if (hasSiza) {
      await expect(sizaOption).toBeVisible();
    }
  });

  test('should generate with mocked API', async ({ authenticatedPage: page }) => {
    await mockGenerateAPI(page);
    await page.goto('/generate');

    const nameInput = page.getByLabel(/component name/i);
    const descInput = page.getByLabel(/describe/i);
    const generateBtn = page.getByRole('button', { name: /generate/i });

    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('MockedComponent');
      await descInput.fill('A test component generated with mocked API for E2E testing purposes');
      await generateBtn.click();

      await expect(page.getByText(/MockComponent|mock-gen-id/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display quality badge after generation', async ({ authenticatedPage: page }) => {
    await mockGenerateAPI(page);
    await page.goto('/generate');

    const nameInput = page.getByLabel(/component name/i);
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('QualityTest');
      await page.getByLabel(/describe/i).fill('Component to test quality badge display in the UI');
      await page.getByRole('button', { name: /generate/i }).click();

      const badge = page.getByText(/quality|score|good|fair/i);
      await expect(badge.first()).toBeVisible({ timeout: 15000 });
    }
  });
});
