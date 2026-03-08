import { test, expect } from './fixtures';

test.describe('Teams Management', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('should display teams page', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');

    await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible();
    await expect(page.getByText(/manage teams and permissions/i)).toBeVisible();
  });

  test('should show empty state when no teams exist', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');

    await expect(page.getByText(/no teams yet/i)).toBeVisible();
  });

  test('should toggle create team form', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');

    await page.getByRole('button', { name: /new team/i }).click();

    await expect(page.locator('#team-name')).toBeVisible();
    await expect(page.locator('#team-desc')).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.locator('#team-name')).not.toBeVisible();
  });

  test('should create a team', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');

    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill('Test Team');
    await page.locator('#team-desc').fill('A team for E2E testing');

    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(/\/teams\/test-team/);
    await expect(page.getByRole('heading', { name: 'Test Team' })).toBeVisible();
  });

  test('should view team detail with members', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill('Detail Team');
    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(/\/teams\/detail-team/);
    await expect(page.getByText(/members/i)).toBeVisible();
  });

  test('should show auto-generated slug', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');

    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill('My Great Team');

    await expect(page.getByText('my-great-team')).toBeVisible();
  });

  test('should navigate back from team detail', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill('Nav Team');
    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(/\/teams\/nav-team/);

    await page.getByRole('link', { name: /teams/i }).first().click();
    await expect(page).toHaveURL('/teams');
  });

  test('should show owner as first member', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');
    await page.getByRole('button', { name: /new team/i }).click();
    await page.locator('#team-name').fill('Owner Team');
    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page).toHaveURL(/\/teams\/owner-team/);
    await expect(page.getByText(/owner/i)).toBeVisible();
  });

  test('should validate required team name', async ({ authenticatedPage: page }) => {
    await page.goto('/teams');

    await page.getByRole('button', { name: /new team/i }).click();

    await page.getByRole('button', { name: /^create$/i }).click();

    const nameInput = page.locator('#team-name');
    await expect(nameInput).toBeVisible();
  });
});
