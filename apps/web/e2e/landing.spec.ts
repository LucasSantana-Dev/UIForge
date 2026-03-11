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
    await expect(page.getByText(/production-grade/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /start generating free/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /read the docs/i }).first()).toBeVisible();
  });

  test('should render stats bar with counters', async ({ page }) => {
    await expect(page.getByText(/live github ecosystem sync/i).first()).toBeVisible();
    await expect(page.getByText(/product repos/i).first()).toBeVisible();
  });

  test('should render capabilities section', async ({ page }) => {
    await expect(page.getByText(/what makes it different/i)).toBeVisible();
    await expect(page.getByText(/architecture-first/i)).toBeVisible();
    await expect(page.getByText(/security by default/i).first()).toBeVisible();
  });

  test('should render code showcase section', async ({ page }) => {
    await expect(page.getByText(/your next project/i)).toBeVisible();
    await expect(page.getByText(/project structure/i)).toBeVisible();
  });

  test('should render ecosystem section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 2 }).filter({ hasText: 'repos. One vision.' }).first()
    ).toBeVisible();
    await expect(page.getByText(/ui-mcp/i).first()).toBeVisible();
    await expect(page.getByText(/mcp-gateway/i).first()).toBeVisible();
    await expect(page.getByText(/brand-guide/i).first()).toBeVisible();
  });

  test('should render footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/mit license/i)).toBeVisible();
  });

  test('should expose sign in target from nav', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in/i }).first();
    await expect(signInLink).toHaveAttribute('href', '/signin');
  });

  test('should expose sign up target from Get Started CTA', async ({ page }) => {
    const ctaLink = page.getByRole('link', { name: /get started free/i }).last();
    await expect(ctaLink).toHaveAttribute('href', '/signup');
  });

  test('should render responsive mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /start generating free/i }).first()).toBeVisible();
  });
});
