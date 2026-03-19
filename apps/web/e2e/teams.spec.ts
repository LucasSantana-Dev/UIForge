import crypto from 'node:crypto';
import { test, expect } from './fixtures';
import { createAdminClient } from './helpers/admin-client';

test.describe('Teams Management', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  // Unique suffix per describe-run to prevent slug collisions in parallel runs
  const runId = crypto.randomBytes(4).toString('hex');

  test.afterEach(async () => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    try {
      const admin = createAdminClient();
      // Delete teams whose slug contains our runId (created by this run)
      await admin.from('teams').delete().like('slug', `%-${runId}`);
    } catch {
      // Cleanup is best-effort; do not fail the test
    }
  });

  test('should display teams page', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible();
    await expect(page.getByText(/manage teams and permissions/i)).toBeVisible();
  });

  test('should show empty state when no teams exist', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/no teams yet/i)).toBeVisible();
  });

  test('should toggle create team form', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /new team/i }).click();

    await expect(page.locator('#team-name')).toBeVisible();
    await expect(page.locator('#team-desc')).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.locator('#team-name')).not.toBeVisible();
  });

  test('should create a team', async ({ authenticatedPage: page }) => {
    const name = `Test Team ${runId}`;
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill(name);
    await page.locator('#team-desc').fill('A team for E2E testing');

    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(new RegExp(`/teams/test-team-${runId}`));
    await expect(page.getByRole('heading', { name: name })).toBeVisible();
  });

  test('should view team detail with members', async ({ authenticatedPage: page }) => {
    const name = `Detail Team ${runId}`;
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill(name);
    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(new RegExp(`/teams/detail-team-${runId}`));
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/members/i)).toBeVisible();
  });

  test('should show auto-generated slug', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill(`My Great Team ${runId}`);

    // Wait for the slug to be computed and rendered
    const slugLocator = page.getByText(`my-great-team-${runId}`);
    await expect(slugLocator).toBeVisible({ timeout: 5000 });
  });

  test('should navigate back from team detail', async ({ authenticatedPage: page }) => {
    const name = `Nav Team ${runId}`;
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill(name);
    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(new RegExp(`/teams/nav-team-${runId}`));
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: /teams/i }).first().click();
    await expect(page).toHaveURL('/teams');
  });

  test('should show owner as first member', async ({ authenticatedPage: page }) => {
    const name = `Owner Team ${runId}`;
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill(name);
    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(new RegExp(`/teams/owner-team-${runId}`));
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/owner/i)).toBeVisible();
  });

  test('should validate required team name', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /new team/i }).click();

    await page.getByRole('button', { name: /^create$/i }).click();

    // Form stays open with the name field still visible (validation prevents submission)
    const nameInput = page.locator('#team-name');
    await expect(nameInput).toBeVisible();
    // Ensure we are still on the teams page (form not submitted)
    await expect(page).toHaveURL('/teams');
  });
});
