import { expect, test } from '@playwright/test';

test.describe('Production Public Smoke', () => {
  test('loads gallery page', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: /generation gallery/i })).toBeVisible();
  });

  test('loads sign in page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: /sign in to siza/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('loads sign up page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('loads forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('roadmap has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/roadmap');
    await expect(page.getByRole('heading', { name: /roadmap/i })).toBeVisible();
    const phaseCard = page.locator('[data-testid="roadmap-phase-card"], [id^="phase-"]').first();
    await expect(phaseCard).toBeVisible();

    const hasPageOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth > 2;
    });
    expect(hasPageOverflow).toBe(false);

    const hasCardOverflow = await page.evaluate(() => {
      const card =
        document.querySelector('[data-testid="roadmap-phase-card"]') ||
        document.querySelector('[id^="phase-"]');
      if (!card) return true;
      return card.scrollWidth - card.clientWidth > 2;
    });
    expect(hasCardOverflow).toBe(false);
  });
});
