import { test, expect } from '@playwright/test';

test.describe('Marketing Pages', () => {
  test.describe('About Page', () => {
    test('should render about page', async ({ page }) => {
      await page.goto('/about');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should have navigation back to home', async ({ page }) => {
      await page.goto('/about');
      const homeLink = page.getByRole('link', { name: /siza|home/i }).first();
      await expect(homeLink).toBeVisible();
    });
  });

  test.describe('Roadmap Page', () => {
    test('should render roadmap page', async ({ page }) => {
      await page.goto('/roadmap');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should display phase cards', async ({ page }) => {
      await page.goto('/roadmap');
      const phases = page.locator('[data-testid="phase-card"], .phase-card, article');
      const count = await phases.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Pricing Page', () => {
    test('should render pricing page', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should show plan options', async ({ page }) => {
      await page.goto('/pricing');
      await expect(page.getByText(/free|pro|team/i).first()).toBeVisible();
    });
  });
});
