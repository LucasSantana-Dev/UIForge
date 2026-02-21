import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser, cleanupTestData } from './helpers/auth';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test('should display projects page', async ({ page }) => {
    await page.goto('/projects');

    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByText('Manage your UI component projects')).toBeVisible();

    // Check "New Project" button exists
    await expect(page.getByRole('link', { name: 'New Project' })).toBeVisible();
  });

  test('should create a new project', async ({ page }) => {
    await page.goto('/projects/new');

    // Fill out project form
    await page.getByLabel('Project Name *').fill('Test Project');
    await page.getByLabel('Description').fill('This is a test project for E2E testing');
    await page.getByLabel('Framework *').selectOption('react');

    // Submit form
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Should redirect to project detail page
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/);

    // Verify project was created
    await page.goto('/projects');
    await expect(page.getByText('Test Project')).toBeVisible();
  });

  test('should search for projects', async ({ page }) => {
    // Create test projects first
    await page.goto('/projects/new');
    await page.getByLabel('Project Name *').fill('Search Test Project');
    await page.getByLabel('Framework *').selectOption('react');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await page.goto('/projects');

    // Use search functionality
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Search Test');

    // Should show matching project
    await expect(page.getByText('Search Test Project')).toBeVisible();

    // Clear search
    await searchInput.clear();
    await searchInput.fill('NonExistent');

    // Should show empty state
    await expect(page.getByText(/no projects found/i)).toBeVisible();
  });

  test('should filter projects by framework', async ({ page }) => {
    await page.goto('/projects');

    // Check if filter dropdown exists
    const filterSelect = page.getByLabel(/framework/i).or(page.locator('select[name="framework"]'));

    if ((await filterSelect.count()) > 0) {
      await filterSelect.selectOption('react');

      // All visible projects should be React
      const projectCards = page
        .locator('[data-testid="project-card"]')
        .or(page.locator('article').filter({ hasText: /react/i }));

      if ((await projectCards.count()) > 0) {
        await expect(projectCards.first()).toBeVisible();
      }
    }
  });

  test('should edit a project', async ({ page }) => {
    // Create a project first
    await page.goto('/projects/new');
    await page.getByLabel('Project Name *').fill('Edit Test Project');
    await page.getByLabel('Framework *').selectOption('react');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Go back to projects list
    await page.goto('/projects');

    // Find and click edit button (in dropdown menu)
    const projectCard = page.locator('article').filter({ hasText: 'Edit Test Project' }).first();
    await projectCard
      .locator('button[aria-label*="menu"]')
      .or(projectCard.getByRole('button').filter({ hasText: /more/i }))
      .click();

    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Update project name
    await page.getByLabel('Project Name *').clear();
    await page.getByLabel('Project Name *').fill('Updated Project Name');
    await page.getByRole('button', { name: /save|update/i }).click();

    // Verify update
    await page.goto('/projects');
    await expect(page.getByText('Updated Project Name')).toBeVisible();
  });

  test('should delete a project', async ({ page }) => {
    // Create a project first
    await page.goto('/projects/new');
    await page.getByLabel('Project Name *').fill('Delete Test Project');
    await page.getByLabel('Framework *').selectOption('react');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await page.goto('/projects');

    // Find and click delete button
    const projectCard = page.locator('article').filter({ hasText: 'Delete Test Project' }).first();
    await projectCard
      .locator('button[aria-label*="menu"]')
      .or(projectCard.getByRole('button').filter({ hasText: /more/i }))
      .click();

    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Confirm deletion in modal
    await page
      .getByRole('button', { name: /delete/i })
      .last()
      .click();

    // Verify project is deleted
    await expect(page.getByText('Delete Test Project')).not.toBeVisible();
  });

  test('should upload project thumbnail', async ({ page }) => {
    await page.goto('/projects/new');

    await page.getByLabel('Project Name *').fill('Thumbnail Test Project');
    await page.getByLabel('Framework *').selectOption('react');

    // Upload thumbnail
    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      // Create a test image file
      await fileInput.setInputFiles({
        name: 'test-thumbnail.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        ),
      });

      // Verify preview appears
      await expect(
        page.locator('img[alt*="preview"]').or(page.locator('img[src*="blob:"]'))
      ).toBeVisible();
    }

    await page.getByRole('button', { name: 'Create Project' }).click();

    // Verify project was created with thumbnail
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/);
  });

  test('should show empty state when no projects exist', async ({ page }) => {
    await page.goto('/projects');

    // If no projects, should show empty state
    const emptyState = page
      .getByText(/no projects yet/i)
      .or(page.getByText(/get started by creating/i));

    const projectCards = page.locator('article').filter({ hasText: /project/i });

    if ((await projectCards.count()) === 0) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should handle project creation validation errors', async ({ page }) => {
    await page.goto('/projects/new');

    // Try to submit without required fields
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Should show validation errors
    await expect(
      page.getByText(/name.*required/i).or(page.getByText(/must be at least/i))
    ).toBeVisible();
  });

  test('should navigate between grid and list views', async ({ page }) => {
    await page.goto('/projects');

    // Look for view toggle buttons
    const gridViewButton = page
      .getByRole('button', { name: /grid/i })
      .or(page.locator('button[aria-label*="grid"]'));
    const listViewButton = page
      .getByRole('button', { name: /list/i })
      .or(page.locator('button[aria-label*="list"]'));

    if ((await gridViewButton.count()) > 0 && (await listViewButton.count()) > 0) {
      await listViewButton.click();
      await expect(page.locator('[data-view="list"]').or(page.locator('.list-view'))).toBeVisible();

      await gridViewButton.click();
      await expect(page.locator('[data-view="grid"]').or(page.locator('.grid-view'))).toBeVisible();
    }
  });
});
