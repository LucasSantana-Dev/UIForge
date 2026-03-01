import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should show sign up form with all fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
  });

  test('should validate email format on signup', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page
      .getByLabel(/password/i)
      .first()
      .fill('ValidPass123!');
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    const emailInput = page.getByLabel(/email/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show sign in form with all fields', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid|error|incorrect|failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('/signin');
    await page.getByText(/forgot.*password/i).click();
    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should show forgot password form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /reset|send/i })).toBeVisible();
  });

  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/signin|signup/, { timeout: 10000 });
    expect(page.url()).toMatch(/signin|signup/);
  });

  test('should navigate between auth pages', async ({ page }) => {
    await page.goto('/signin');
    await page.getByText(/sign up|create account/i).click();
    await expect(page).toHaveURL(/signup/);

    await page.getByText(/sign in|already have/i).click();
    await expect(page).toHaveURL(/signin/);
  });

  test('should show OAuth providers', async ({ page }) => {
    await page.goto('/signin');
    const googleBtn = page.getByRole('button', { name: /google/i });
    const githubBtn = page.getByRole('button', { name: /github/i });

    const hasGoogle = await googleBtn.isVisible().catch(() => false);
    const hasGitHub = await githubBtn.isVisible().catch(() => false);

    expect(hasGoogle || hasGitHub).toBe(true);
  });
});
