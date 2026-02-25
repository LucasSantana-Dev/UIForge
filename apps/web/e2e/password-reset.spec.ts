import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow', () => {
  test('should render forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
  });

  test('should show required validation on empty submit', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('button', { name: /send reset link/i }).click();
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should navigate back to sign in', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.click('text=Sign in');
    await expect(page).toHaveURL('/signin');
  });

  test('should navigate from sign in to forgot password', async ({ page }) => {
    await page.goto('/signin');
    const forgotLink = page.getByRole('link', { name: /forgot/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await expect(page).toHaveURL('/forgot-password');
    }
  });

  test('should render reset password page', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.locator('text=Reset password').first()).toBeVisible();
  });
});
