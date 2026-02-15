import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page.locator('text=UIForge')).toBeVisible();
    await expect(page.locator('text=Generate Production-Ready')).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/signin');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('text=Create your account')).toBeVisible();
  });

  test('should show validation errors on empty sign in form', async ({ page }) => {
    await page.goto('/signin');
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show validation errors on empty sign up form', async ({ page }) => {
    await page.goto('/signup');
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should navigate between sign in and sign up pages', async ({ page }) => {
    await page.goto('/signin');
    await page.click('text=Sign up');
    await expect(page).toHaveURL('/signup');

    await page.click('text=Sign in');
    await expect(page).toHaveURL('/signin');
  });

  test('should redirect to dashboard when authenticated', async ({ page, context }) => {
    // This test requires a test user - skip in CI without test credentials
    test.skip(!process.env.TEST_USER_EMAIL, 'Test user credentials not configured');

    await page.goto('/signin');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });
});
