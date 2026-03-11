import { test, expect } from '@playwright/test';

const BASE_URL = 'https://siza.forgespace.co';

const INDEXABLE_ROUTES = [
  { path: '/', title: 'Siza — Vibe Code the Right Way' },
  { path: '/about', title: 'About Siza | Open Full-Stack AI Workspace' },
  { path: '/roadmap', title: 'Siza Roadmap | Full-Stack AI Development' },
  { path: '/pricing', title: 'Siza Pricing | Free and Team Plans' },
  { path: '/docs', title: 'Siza Docs | Generation, Providers, and Governance' },
  { path: '/gallery', title: 'Siza Gallery | Production-Grade UI Generations' },
  { path: '/legal/privacy', title: 'Privacy Policy | Siza' },
  { path: '/legal/terms', title: 'Terms of Service | Siza' },
];

test.describe('SEO coverage', () => {
  for (const route of INDEXABLE_ROUTES) {
    test(`should expose route metadata for ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveTitle(route.title);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        'href',
        route.path === '/' ? BASE_URL : `${BASE_URL}${route.path}`
      );

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveCount(1);
      await expect(description).toHaveAttribute('content', /.+/);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    });
  }

  test('should expose robots and sitemap endpoints', async ({ page }) => {
    const robotsResponse = await page.request.get('/robots.txt');
    const sitemapResponse = await page.request.get('/sitemap.xml');

    expect(robotsResponse.status()).toBe(200);
    expect(sitemapResponse.status()).toBe(200);

    const robotsText = await robotsResponse.text();
    const sitemapText = await sitemapResponse.text();

    expect(robotsText).toContain('Sitemap: https://siza.forgespace.co/sitemap.xml');
    expect(robotsText).toContain('Disallow: /api/');
    expect(sitemapText).toContain('https://siza.forgespace.co/roadmap');
    expect(sitemapText).toContain('https://siza.forgespace.co/legal/terms');
  });

  test('should mark non-marketing auth routes as noindex', async ({ page }) => {
    for (const path of ['/signin', '/signup', '/forgot-password', '/reset-password']) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    }
  });

  test('should avoid stale ecosystem count claims on marketing pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/seven repos|six repositories/i)).toHaveCount(0);

    await page.goto('/about');
    await expect(page.getByText(/seven repos|six repositories/i)).toHaveCount(0);
  });
});
