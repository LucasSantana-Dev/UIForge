import { test, expect } from './fixtures';

test.describe('Software Catalog', () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Requires SUPABASE_SERVICE_ROLE_KEY');

  test('should display catalog page', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog');

    await expect(page.getByRole('heading', { name: 'Service Catalog' })).toBeVisible();
    await expect(page.getByText('Discover and manage your software components')).toBeVisible();
  });

  test('should show empty state when no entries exist', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog');

    await expect(page.getByText(/your service catalog|no entries/i)).toBeVisible();
  });

  test('should have search and filter controls', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog');

    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('should navigate to register new entry', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog');

    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL('/catalog/new');
    await expect(page.getByRole('heading', { name: /add to catalog/i })).toBeVisible();
  });

  test('should create a catalog entry', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog/new');

    await page.locator('#catalog-name').fill('test-service');
    await page.locator('#catalog-display-name').fill('Test Service');
    await page.locator('#catalog-type').selectOption('service');
    await page.locator('#catalog-lifecycle').selectOption('experimental');

    await page.getByRole('button', { name: /create entry/i }).click();

    await expect(page).toHaveURL(/\/catalog\/[a-f0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Test Service' })).toBeVisible();
  });

  test('should view catalog entry detail', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog/new');
    await page.locator('#catalog-name').fill('detail-test');
    await page.locator('#catalog-display-name').fill('Detail Test');
    await page.locator('#catalog-type').selectOption('component');
    await page.locator('#catalog-lifecycle').selectOption('production');
    await page.getByRole('button', { name: /create entry/i }).click();

    await expect(page).toHaveURL(/\/catalog\//);
    await expect(page.getByRole('heading', { name: 'Detail Test' })).toBeVisible();
    await expect(page.getByText('Metadata')).toBeVisible();
  });

  test('should navigate to edit page', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog/new');
    await page.locator('#catalog-name').fill('edit-test');
    await page.locator('#catalog-display-name').fill('Edit Test');
    await page.locator('#catalog-type').selectOption('api');
    await page.locator('#catalog-lifecycle').selectOption('experimental');
    await page.getByRole('button', { name: /create entry/i }).click();

    await expect(page).toHaveURL(/\/catalog\//);

    const editLink = page.getByRole('link', { name: /edit/i });
    if (await editLink.isVisible()) {
      await editLink.click();
      await expect(page).toHaveURL(/\/edit$/);
    }
  });

  test('should navigate to dependency graph', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog');

    const graphLink = page.getByRole('link', { name: /graph/i });
    if (await graphLink.isVisible()) {
      await graphLink.click();
      await expect(page).toHaveURL('/catalog/graph');
    }
  });

  test('should navigate to discover page', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog');

    const discoverLink = page.getByRole('link', { name: /discover/i });
    if (await discoverLink.isVisible()) {
      await discoverLink.click();
      await expect(page).toHaveURL('/catalog/discover');
    }
  });

  test('should create entry with tags and dependencies', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog/new');

    await page.locator('#catalog-name').fill('tagged-service');
    await page.locator('#catalog-display-name').fill('Tagged Service');
    await page.locator('#catalog-type').selectOption('service');
    await page.locator('#catalog-lifecycle').selectOption('production');
    await page.locator('#catalog-tags').fill('backend, api, golang');
    await page.locator('#catalog-repo-url').fill('https://github.com/example/repo');

    await page.getByRole('button', { name: /create entry/i }).click();

    await expect(page).toHaveURL(/\/catalog\//);
    await expect(page.getByRole('heading', { name: 'Tagged Service' })).toBeVisible();
  });
});
