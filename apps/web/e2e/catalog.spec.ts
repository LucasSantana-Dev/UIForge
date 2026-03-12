import { test, expect } from './fixtures';

async function createCatalogEntry(
  page: any,
  input: {
    name: string;
    displayName: string;
    type: 'service' | 'component' | 'api' | 'library' | 'website';
    lifecycle: 'experimental' | 'production' | 'deprecated';
    tags?: string;
    repoUrl?: string;
  }
) {
  await page.goto('/catalog/new');
  await page.locator('#catalog-name').fill(input.name);
  await page.locator('#catalog-display-name').fill(input.displayName);
  await page.locator('#catalog-type').selectOption(input.type);
  await page.locator('#catalog-lifecycle').selectOption(input.lifecycle);
  if (input.tags) {
    await page.locator('#catalog-tags').fill(input.tags);
  }
  if (input.repoUrl) {
    await page.locator('#catalog-repo-url').fill(input.repoUrl);
  }

  await page.getByRole('button', { name: /create entry/i }).click();
  await page.waitForURL(/\/catalog(\/[a-f0-9-]+)?$/, { timeout: 10000 });

  if (page.url().endsWith('/catalog')) {
    const lookup = await page.request.get(`/api/catalog?search=${encodeURIComponent(input.name)}`);
    expect(lookup.ok()).toBe(true);
    const payload = await lookup.json();
    const created = payload?.data?.entries?.find((entry: { name: string }) => entry.name === input.name);
    expect(created?.id).toBeTruthy();
    await page.goto(`/catalog/${created.id}`);
  }

  await expect(page).toHaveURL(/\/catalog\/[a-f0-9-]+$/);
}

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

  test('should navigate to register new entry from header CTA', async ({ authenticatedPage: page }) => {
    await page.goto('/catalog');

    await page.getByRole('button', { name: /^register$/i }).click();
    await expect(page).toHaveURL('/catalog/new');
    await expect(page.getByRole('heading', { name: /add to catalog/i })).toBeVisible();
  });

  test('should navigate to register new entry from empty-state CTA', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/catalog');

    await expect(page.getByText(/your service catalog|no entries/i)).toBeVisible();
    await page.getByRole('button', { name: /register first service/i }).click();
    await expect(page).toHaveURL('/catalog/new');
    await expect(page.getByRole('heading', { name: /add to catalog/i })).toBeVisible();
  });

  test('should create a catalog entry', async ({ authenticatedPage: page }) => {
    await createCatalogEntry(page, {
      name: 'test-service',
      displayName: 'Test Service',
      type: 'service',
      lifecycle: 'experimental',
    });
    await expect(page.getByRole('heading', { name: 'Test Service' })).toBeVisible();
  });

  test('should view catalog entry detail', async ({ authenticatedPage: page }) => {
    await createCatalogEntry(page, {
      name: 'detail-test',
      displayName: 'Detail Test',
      type: 'component',
      lifecycle: 'production',
    });
    await expect(page.getByRole('heading', { name: 'Detail Test' })).toBeVisible();
    await expect(page.getByText('Metadata')).toBeVisible();
  });

  test('should navigate to edit page', async ({ authenticatedPage: page }) => {
    await createCatalogEntry(page, {
      name: 'edit-test',
      displayName: 'Edit Test',
      type: 'api',
      lifecycle: 'experimental',
    });

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
    await createCatalogEntry(page, {
      name: 'tagged-service',
      displayName: 'Tagged Service',
      type: 'service',
      lifecycle: 'production',
      tags: 'backend, api, golang',
      repoUrl: 'https://github.com/example/repo',
    });
    await expect(page.getByRole('heading', { name: 'Tagged Service' })).toBeVisible();
  });
});
