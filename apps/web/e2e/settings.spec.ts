import { test, expect } from './fixtures';

test.describe('Settings Page', () => {
  test('should render settings page with tabs', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ai keys/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
  });

  test('should show AI provider status on overview tab', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
    await expect(page.getByText('AI Provider Status')).toBeVisible();
    await expect(page.getByText('Privacy & Security')).toBeVisible();
    await expect(page.getByText('Preferences')).toBeVisible();
  });

  test('should switch to AI Keys tab', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: /ai keys/i }).click();
    await expect(page.getByText(/API Keys/i)).toBeVisible();
  });

  test('should switch to GitHub tab', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: /github/i }).click();
    await expect(page.getByText('GitHub Integration')).toBeVisible();
  });

  test('should open GitHub tab via query parameter', async ({ authenticatedPage: page }) => {
    await page.goto('/settings?tab=github');
    await expect(page.getByText('GitHub Integration')).toBeVisible();
  });

  test('should show security information', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Client-Side Encryption')).toBeVisible();
    await expect(page.getByText(/AES-256/)).toBeVisible();
  });

  test('should toggle preferences', async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
    const geminiToggle = page.getByRole('button', { name: /enabled|disabled/i }).first();
    await expect(geminiToggle).toBeVisible();
    await geminiToggle.click();
  });
});
