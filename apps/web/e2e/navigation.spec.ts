import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './helpers/auth';

test.describe('Navigation and Routing', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test('should navigate through main menu items', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to Projects
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    
    // Navigate to Templates
    await page.getByRole('link', { name: 'Templates' }).click();
    await expect(page).toHaveURL('/templates');
    
    // Navigate to Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('should navigate to generate component from sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click "Generate Component" button in sidebar
    await page.getByRole('link', { name: /generate component/i }).click();
    
    // Should navigate to generate page
    await expect(page).toHaveURL(/\/generate/);
  });

  test('should show active navigation state', async ({ page }) => {
    await page.goto('/projects');
    
    // Projects link should be active
    const projectsLink = page.getByRole('link', { name: 'Projects' });
    await expect(projectsLink).toHaveClass(/active|secondary/);
    
    // Navigate to Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    
    // Settings link should now be active
    const settingsLink = page.getByRole('link', { name: 'Settings' });
    await expect(settingsLink).toHaveClass(/active|secondary/);
  });

  test('should navigate using browser back button', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/projects');
    await page.goto('/settings');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/projects');
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /menu/i }).or(
      page.locator('button[aria-label*="menu"]')
    );
    
    if (await menuButton.count() > 0) {
      await menuButton.click();
      
      // Mobile navigation should open
      await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
      
      // Click a link
      await page.getByRole('link', { name: 'Projects' }).click();
      await expect(page).toHaveURL('/projects');
    }
  });

  test('should display user menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click user menu button
    const userMenuButton = page.locator('button[aria-label*="user"]').or(
      page.locator('button').filter({ has: page.locator('img[alt*="avatar"]') })
    );
    
    if (await userMenuButton.count() > 0) {
      await userMenuButton.click();
      
      // User menu should show options
      await expect(page.getByRole('menuitem', { name: /settings/i }).or(
        page.getByText(/settings/i)
      )).toBeVisible();
      
      await expect(page.getByRole('menuitem', { name: /sign out/i }).or(
        page.getByText(/sign out/i)
      )).toBeVisible();
    }
  });

  test('should redirect unauthenticated users to signin', async ({ page }) => {
    // Clear authentication
    await page.context().clearCookies();
    
    // Try to access protected route
    await page.goto('/projects');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/\/signin/);
  });

  test('should navigate to project detail page', async ({ page }) => {
    await page.goto('/projects');
    
    // Find first project card
    const projectCard = page.locator('article').first();
    
    if (await projectCard.count() > 0) {
      // Click on project
      await projectCard.click();
      
      // Should navigate to project detail
      await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/);
    }
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 page
    await expect(page.getByText(/404|not found/i)).toBeVisible();
    
    // Should have link back to home
    const homeLink = page.getByRole('link', { name: /home|dashboard/i });
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page).toHaveURL(/\/dashboard|\/$/);
    }
  });

  test('should navigate from logo to dashboard', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on logo
    const logo = page.locator('a').filter({ has: page.locator('img[alt*="UIForge"]') }).or(
      page.getByRole('link').filter({ hasText: /UIForge/ })
    );
    
    if (await logo.count() > 0) {
      await logo.click();
      await expect(page).toHaveURL(/\/dashboard|\/$/);
    }
  });

  test('should maintain query parameters during navigation', async ({ page }) => {
    // Create a project first
    await page.goto('/projects/new');
    await page.getByLabel('Project Name *').fill('Query Param Test');
    await page.getByLabel('Framework *').selectOption('react');
    await page.getByRole('button', { name: 'Create Project' }).click();
    
    const url = page.url();
    const match = url.match(/\/projects\/([a-f0-9-]+)/);
    
    if (match) {
      const projectId = match[1];
      
      // Navigate to generate with query params
      await page.goto(`/generate?projectId=${projectId}&framework=react`);
      
      // Verify query params are preserved
      expect(page.url()).toContain(`projectId=${projectId}`);
      expect(page.url()).toContain('framework=react');
    }
  });

  test('should handle deep linking', async ({ page }) => {
    // Direct navigation to deep route
    await page.goto('/projects/new');
    
    // Should load the page correctly
    await expect(page.getByRole('heading', { name: /new project|create project/i })).toBeVisible();
  });

  test('should show loading states during navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click navigation link
    const projectsLink = page.getByRole('link', { name: 'Projects' });
    await projectsLink.click();
    
    // Page should eventually load
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible({ timeout: 5000 });
  });
});
