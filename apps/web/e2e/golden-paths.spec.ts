import { test, expect } from './fixtures';

test.describe('Golden Path Templates', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('should display golden paths page', async ({ authenticatedPage: page }) => {
    await page.goto('/golden-paths');

    await expect(page.getByRole('heading', { name: 'Golden Paths' })).toBeVisible();
    await expect(page.getByText(/production-ready project scaffolds/i)).toBeVisible();
  });

  test('should show empty state or template list', async ({ authenticatedPage: page }) => {
    await page.goto('/golden-paths');

    const hasTemplates = await page
      .getByText(/scaffold project/i)
      .first()
      .isVisible()
      .catch(() => false);
    if (!hasTemplates) {
      await expect(page.getByText(/no golden paths yet/i)).toBeVisible();
    }
  });

  test('should have search and filter controls', async ({ authenticatedPage: page }) => {
    await page.goto('/golden-paths');

    await expect(page.getByPlaceholder(/search golden paths/i)).toBeVisible();
  });

  test('should filter by stack', async ({ authenticatedPage: page }) => {
    await page.goto('/golden-paths');

    const stackFilter = page.locator('select').filter({ hasText: /all stacks/i });
    if (await stackFilter.isVisible()) {
      await stackFilter.selectOption({ index: 1 });
    }
  });

  test('should filter by language', async ({ authenticatedPage: page }) => {
    await page.goto('/golden-paths');

    const langFilter = page.locator('select').filter({ hasText: /all languages/i });
    if (await langFilter.isVisible()) {
      await langFilter.selectOption({ index: 1 });
    }
  });

  test('should search golden paths', async ({ authenticatedPage: page }) => {
    await page.goto('/golden-paths');

    const searchInput = page.getByPlaceholder(/search golden paths/i);
    await searchInput.fill('next');

    await page.waitForTimeout(500);
  });

  test('should toggle scaffold form on template card', async ({ authenticatedPage: page }) => {
    await page.goto('/golden-paths');

    const scaffoldButton = page.getByRole('button', { name: /scaffold project/i }).first();
    if (await scaffoldButton.isVisible().catch(() => false)) {
      await scaffoldButton.click();

      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

      await page.getByRole('button', { name: /cancel/i }).click();
    }
  });
});
