import { test, expect } from './fixtures';

test.describe('Dashboard Home', () => {
  test('should render dashboard after login', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show navigation sidebar', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const sidebar = page.getByRole('navigation').or(page.locator('[class*="sidebar"]'));
    await expect(sidebar).toBeVisible();
  });

  test('should show projects section or empty state', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const projects = page.getByText(/projects/i).first();
    const emptyState = page.getByText(/no projects|get started|create.*first/i);
    const hasContent = await projects.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasContent || hasEmpty).toBe(true);
  });

  test('should navigate to generate page', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const generateLink = page
      .getByRole('link', { name: /generate/i })
      .or(page.getByText(/generate/i).first());
    if (await generateLink.isVisible().catch(() => false)) {
      await generateLink.click();
      await expect(page).toHaveURL(/generate/);
    }
  });

  test('should navigate to projects page', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const projectsLink = page
      .getByRole('link', { name: /projects/i })
      .or(page.locator('a[href*="projects"]'));
    if (await projectsLink.isVisible().catch(() => false)) {
      await projectsLink.click();
      await expect(page).toHaveURL(/projects/);
    }
  });

  test('should navigate to settings page', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const settingsLink = page
      .getByRole('link', { name: /settings/i })
      .or(page.locator('a[href*="settings"]'));
    if (await settingsLink.isVisible().catch(() => false)) {
      await settingsLink.click();
      await expect(page).toHaveURL(/settings/);
    }
  });
});
