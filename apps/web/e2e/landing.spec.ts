import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render navigation with logo and links', async ({ page }) => {
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible();
  });

  test('should render hero section with headline and CTAs', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/an ecosystem that enables/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /get started free/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /view on github/i }).first()).toBeVisible();
  });

  test('should render stats bar with counters', async ({ page }) => {
    await expect(page.getByText(/ai providers/i).first()).toBeVisible();
    await expect(page.getByText(/ui components/i).first()).toBeVisible();
    await expect(page.getByText(/core repositories/i).first()).toBeVisible();
  });

  test('should render capabilities section', async ({ page }) => {
    await expect(page.getByText(/everything you need to ship/i)).toBeVisible();
    await expect(page.getByText(/component architecture/i)).toBeVisible();
    await expect(page.getByText(/ai provider gateway/i)).toBeVisible();
  });

  test('should render code showcase section', async ({ page }) => {
    await expect(page.getByText(/one gateway/i)).toBeVisible();
    await expect(page.getByText(/gateway\.config\.ts/i)).toBeVisible();
  });

  test('should render ecosystem section', async ({ page }) => {
    await expect(page.getByText(/five repos/i)).toBeVisible();
    await expect(page.getByText(/siza-mcp/i).first()).toBeVisible();
    await expect(page.getByText(/mcp-gateway/i).first()).toBeVisible();
  });

  test('should render footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/mit license/i)).toBeVisible();
  });

  test('should navigate to sign in from nav', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/signin');
  });

  test('should navigate to sign in from Get Started CTA', async ({ page }) => {
    await page
      .getByRole('link', { name: /get started free/i })
      .first()
      .click();
    await expect(page).toHaveURL('/signin');
  });

  test('should render responsive mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started free/i }).first()).toBeVisible();
  });
});
