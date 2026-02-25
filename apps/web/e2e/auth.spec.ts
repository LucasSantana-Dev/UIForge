import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/an ecosystem that enables/i)).toBeVisible();
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

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show validation errors on empty sign up form', async ({ page }) => {
    await page.goto('/signup');
    await page.click('button[type="submit"]');

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

  test('should redirect to dashboard when authenticated', async ({ page, context: _context }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Test user credentials not configured');

    await page.goto('/signin');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });
});
