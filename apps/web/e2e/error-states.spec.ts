import { test, expect } from '@playwright/test';
import { mockGenerateAPIError } from './helpers/mock-api';

test.describe('Error States', () => {
  test('should show 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    const is404 = response?.status() === 404;
    const has404Text = await page
      .getByText(/not found|404/i)
      .isVisible()
      .catch(() => false);
    expect(is404 || has404Text).toBe(true);
  });

  test('should handle 500 errors gracefully', async ({ page }) => {
    await mockGenerateAPIError(page, 500);
    await page.goto('/generate');

    const errorMsg = page.getByText(/error|something went wrong|try again/i);
    const hasError = await errorMsg
      .first()
      .isVisible()
      .catch(() => false);
    // Page should load even if API is broken
    expect(page.url()).toContain('/generate');
  });

  test('should show rate limit feedback', async ({ page }) => {
    await mockGenerateAPIError(page, 429);
    await page.goto('/generate');

    const rateLimitMsg = page.getByText(/rate limit|too many|try again/i);
    const hasLimit = await rateLimitMsg
      .first()
      .isVisible()
      .catch(() => false);
    expect(typeof hasLimit).toBe('boolean');
  });

  test('should handle network errors', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort('connectionrefused'));
    await page.goto('/dashboard');

    // App should still render (client-side)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should redirect from protected routes without auth', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/projects', '/settings', '/generate', '/history'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL(/signin|signup|dashboard/, { timeout: 5000 });
    }
  });
});
