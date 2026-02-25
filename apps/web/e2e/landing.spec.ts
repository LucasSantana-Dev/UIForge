import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render navigation with logo and links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /siza/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible();
  });

  test('should render hero section with headline and CTAs', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/an ecosystem that enables/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /get started free/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /view on github/i })).toBeVisible();
  });

  test('should render stats bar with counters', async ({ page }) => {
    await expect(page.getByText(/ai providers/i)).toBeVisible();
    await expect(page.getByText(/ui components/i)).toBeVisible();
    await expect(page.getByText(/core repositories/i)).toBeVisible();
  });

  test('should render capabilities section', async ({ page }) => {
    await expect(page.getByText(/what makes it different/i)).toBeVisible();
    await expect(page.getByText(/component architecture/i)).toBeVisible();
    await expect(page.getByText(/ai provider gateway/i)).toBeVisible();
    await expect(page.getByText(/edge-first performance/i)).toBeVisible();
  });

  test('should render code showcase section', async ({ page }) => {
    await expect(page.getByText(/one gateway/i)).toBeVisible();
    await expect(page.getByText(/gateway\.config\.ts/i)).toBeVisible();
  });

  test('should render ecosystem section', async ({ page }) => {
    await expect(page.getByText(/the forge space ecosystem/i)).toBeVisible();
    await expect(page.getByText(/ui-mcp/i)).toBeVisible();
    await expect(page.getByText(/mcp-gateway/i)).toBeVisible();
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

  test('should navigate to sign up from Get Started CTA', async ({ page }) => {
    await page
      .getByRole('link', { name: /get started free/i })
      .first()
      .click();
    await expect(page).toHaveURL('/signup');
  });

  test('should apply nav blur on scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(500);
    const hasBlur = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return false;
      const el = nav.closest('header') || nav.parentElement || nav;
      const style = window.getComputedStyle(el);
      return (
        style.backdropFilter.includes('blur') ||
        style.webkitBackdropFilter?.includes('blur') ||
        false
      );
    });
    expect(hasBlur).toBe(true);
  });

  test('should render responsive mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started free/i }).first()).toBeVisible();
  });
});
