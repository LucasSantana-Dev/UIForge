import { test, expect, type Page } from '@playwright/test';
import crypto from 'crypto';
import { createAdminClient } from './helpers/admin-client';

test.describe('Onboarding Wizard', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  let userId: string | undefined;

  test.afterEach(async () => {
    if (!userId) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return;

    const adminSupabase = createAdminClient();
    try {
      await adminSupabase.from('components').delete().eq('user_id', userId);
      await adminSupabase.from('generations').delete().eq('user_id', userId);
      await adminSupabase.from('projects').delete().eq('user_id', userId);
      await adminSupabase.auth.admin.deleteUser(userId);
    } catch {
      /* cleanup best-effort */
    }
  });

  async function createFreshUser(page: Page) {
    const adminSupabase = createAdminClient();

    const uniqueId = crypto.randomUUID();
    const email = `test-onboard-${uniqueId}@example.com`;
    const password = crypto.randomBytes(16).toString('hex');

    const { data } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    userId = data.user?.id;

    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL((url: URL) => !url.pathname.includes('/signin'), { timeout: 10000 });
  }

  test('should redirect new user to onboarding', async ({ page }) => {
    await createFreshUser(page);

    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('should display welcome step', async ({ page }) => {
    await createFreshUser(page);

    await expect(page.getByRole('heading', { name: /welcome to siza/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /skip/i })).toBeVisible();
  });

  test('should show step indicators', async ({ page }) => {
    await createFreshUser(page);

    await expect(page.getByRole('heading', { name: /welcome to siza/i })).toBeVisible();
    await expect(page.getByText('Project', { exact: true })).toBeVisible();
  });

  test('should advance to project step', async ({ page }) => {
    await createFreshUser(page);

    await page.getByRole('button', { name: /get started/i }).click();

    await expect(page.getByRole('heading', { name: /create your first project/i })).toBeVisible();
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('should skip onboarding entirely', async ({ page }) => {
    await createFreshUser(page);

    await page.getByRole('button', { name: /skip/i }).click();

    await expect(page).toHaveURL(/\/dashboard|\/projects|\/onboarding/);
  });

  test('should create project in onboarding', async ({ page }) => {
    await createFreshUser(page);

    await page.getByRole('button', { name: /get started/i }).click();

    await page.locator('#name').clear();
    await page.locator('#name').fill('My Onboarding Project');

    await page.getByRole('button', { name: /create project/i }).click();

    await expect(page.getByRole('heading', { name: /generate your first component/i })).toBeVisible(
      { timeout: 10000 }
    );
  });

  test('should show feature cards on welcome step', async ({ page }) => {
    await createFreshUser(page);

    await expect(page.getByText(/ai generation/i)).toBeVisible();
    await expect(page.getByText(/live preview/i)).toBeVisible();
    await expect(page.getByText(/iterate fast/i)).toBeVisible();
  });
});
