import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import { createAdminClient } from './helpers/admin-client';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should display landing page', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/signin');
    await expect(page.getByRole('heading', { name: /sign in to siza/i })).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  });

  test('should show validation errors on empty sign in form', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show validation errors on empty sign up form', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should navigate between sign in and sign up pages', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');

    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/signin');
  });

  test('should sign in with disposable credentials', async ({ page }) => {
    test.setTimeout(60000);
    test.fixme(
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        /127\.0\.0\.1|localhost/.test(process.env.NEXT_PUBLIC_SUPABASE_URL),
      'Covered by onboarding lead flow; local disposable sign-in is flaky.'
    );

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      test.skip(true, 'Missing SUPABASE_SERVICE_ROLE_KEY for authenticated E2E tests');
    }

    const adminSupabase = createAdminClient();
    const email = `test-${crypto.randomUUID()}@example.com`;
    const password = crypto.randomBytes(16).toString('hex');
    let userId: string | undefined = undefined;

    try {
      const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError || !createdUser.user) {
        throw new Error(`Failed to create test user: ${createError?.message || 'unknown'}`);
      }

      userId = createdUser.user.id;

      await page.goto('/signin', { waitUntil: 'domcontentloaded' });
      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/password/i).fill(password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/(projects|dashboard|generate|onboarding)/, {
        timeout: 30000,
      });
    } finally {
      if (userId) {
        await adminSupabase.from('components').delete().eq('user_id', userId);
        await adminSupabase.from('generations').delete().eq('user_id', userId);
        await adminSupabase.from('projects').delete().eq('user_id', userId);
        await adminSupabase.auth.admin.deleteUser(userId);
      }
    }
  });
});
