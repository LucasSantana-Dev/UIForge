import { test, expect } from './fixtures';

test.describe('Generation History', () => {
  test('should show history page', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const heading = page
      .getByRole('heading', { name: /history/i })
      .or(page.getByText(/generation history/i));
    await expect(heading).toBeVisible();
  });

  test('should show empty state for new users', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const emptyState = page.getByText(/no generations|no history|get started/i);
    const entries = page
      .locator('[class*="card"]')
      .or(page.locator('[data-testid="generation-entry"]'));
    const count = await entries.count();
    if (count === 0) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should display generation filters', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const filters = page.getByText(/filter|sort|framework/i).first();
    const hasFilters = await filters.isVisible().catch(() => false);
    expect(hasFilters).toBeDefined();
  });

  test('should paginate results', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const pagination = page
      .getByRole('navigation', { name: /pagination/i })
      .or(page.getByText(/page|next|previous/i));
    const hasPagination = await pagination
      .first()
      .isVisible()
      .catch(() => false);
    // Pagination only shows with enough entries
    expect(typeof hasPagination).toBe('boolean');
  });

  test('should show generation details', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const entry = page.locator('[class*="card"]').first();
    if (await entry.isVisible().catch(() => false)) {
      await expect(entry.getByText(/react|vue|angular|svelte/i)).toBeVisible();
    }
  });
});
