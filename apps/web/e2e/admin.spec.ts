import { test, expect } from '@playwright/test';
import { cleanupTestData, setUserRole, setupAuthenticatedUser } from './helpers/auth';

test.describe('Admin panel', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('shows admin navigation and admin page to admin users', async ({ page }) => {
    const user = await setupAuthenticatedUser(page);
    try {
      await setUserRole(user.id, 'admin');

      await page.goto('/projects');
      await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();

      await page.goto('/admin');
      await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
      await expect(page.getByText('Feature flags', { exact: true }).first()).toBeVisible();
    } finally {
      await cleanupTestData(user.id);
    }
  });

  test('redirects non-admin users away from admin page', async ({ page }) => {
    const user = await setupAuthenticatedUser(page);
    try {
      await page.goto('/admin');
      await expect(page).toHaveURL('/projects');
    } finally {
      await cleanupTestData(user.id);
    }
  });
});
