import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load main page within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Performance budget: page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Set default values in case no entries arrive
        const defaultVitals = {
          FCP: 0,
          LCP: 0,
          CLS: 0
        };

        // Collect existing entries as fallback
        const existingEntries = {
          LCP: performance.getEntriesByType('largest-contentful-paint').pop(),
          FCP: performance.getEntriesByType('first-contentful-paint').pop(),
          CLS: performance.getEntriesByType('layout-shift').pop()
        };

        const vitals: any = {
          FCP: existingEntries.FCP?.startTime || 0,
          LCP: existingEntries.LCP?.startTime || 0,
          CLS: existingEntries.CLS?.value || 0
        };

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();

          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            } else if (entry.entryType === 'first-contentful-paint') {
              vitals.FCP = entry.startTime;
            } else if (entry.entryType === 'layout-shift') {
              vitals.CLS = entry.value || 0;
            }
          });
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint', 'layout-shift'] });

        // Add timeout to prevent hanging
        setTimeout(() => {
          observer.disconnect();
          resolve(vitals);
        }, 3000);

        // If we get all three metrics quickly, resolve early
        if (vitals.FCP > 0 && vitals.LCP > 0) {
          setTimeout(() => {
            observer.disconnect();
            resolve(vitals);
          }, 1000);
        }
      });
    });

    // Performance thresholds
    expect(vitals.FCP).toBeLessThan(1500); // First Contentful Paint < 1.5s
    expect(vitals.LCP).toBeLessThan(2500); // Largest Contentful Paint < 2.5s
    expect(vitals.CLS).toBeLessThan(0.1); // Cumulative Layout Shift < 0.1
  });

  test('should have efficient bundle size', async ({ page }) => {
    const responses: any[] = [];

    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'] || 0,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalJSSize = responses
      .filter(r => r.url.includes('.js'))
      .reduce((sum, r) => {
        const size = Number(r.size);
        return sum + (isFinite(size) ? size : 0);
      }, 0);

    const totalCSSSize = responses
      .filter(r => r.url.includes('.css'))
      .reduce((sum, r) => {
        const size = Number(r.size);
        return sum + (isFinite(size) ? size : 0);
      }, 0);

    // Bundle size budgets (in bytes)
    expect(totalJSSize).toBeLessThan(500 * 1024); // < 500KB JS
    expect(totalCSSSize).toBeLessThan(50 * 1024);  // < 50KB CSS
  });

  test('should implement proper caching headers', async ({ page }) => {
    const responses: any[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('/logos/') || response.url().includes('.woff')) {
        responses.push({
          url: response.url(),
          cacheControl: response.headers()['cache-control'],
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that static assets have proper caching
    for (const response of responses) {
      expect(response.cacheControl).toContain('max-age');
      expect(parseInt(response.cacheControl.match(/max-age=(\d+)/)?.[1] || '0')).toBeGreaterThan(86400); // > 1 day
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // First focusable element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Test skip links
    await page.keyboard.press('Alt+m');
    const mainElement = await page.evaluate(() => document.activeElement?.id);
    expect(mainElement).toBe('main-content');

    // Test focus management
    const focusableElements = await page.$$('[tabindex]:not([tabindex="-1"])');
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');

    // Check essential meta tags
    const title = await page.title();
    expect(title).toContain('UIForge');

    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(50);

    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toBeTruthy();

    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
    expect(ogImage).toBeTruthy();

    // Check structured data
    const structuredData = await page.$eval('script[type="application/ld+json"]', (el) => {
      return JSON.parse(el.textContent || '{}');
    });

    expect(structuredData['@type']).toBe('WebApplication');
    expect(structuredData.name).toBe('UIForge');
  });

  test('should handle responsive design properly', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // Check that mobile layout is properly displayed
    const mobileNav = await page.$('[data-testid="mobile-nav"]');
    if (mobileNav) {
      await expect(mobileNav).toBeVisible();
    }

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    // Ensure layout adapts properly
    const mainContent = await page.locator('main').isVisible();
    expect(mainContent).toBeTruthy();
  });

  test('should load images efficiently', async ({ page }) => {
    const imageResponses: any[] = [];

    page.on('response', (response) => {
      if (response.url().includes('.png') || response.url().includes('.jpg') || response.url().includes('.webp')) {
        imageResponses.push({
          url: response.url(),
          headers: response.headers(),
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that images are optimized
    for (const response of imageResponses) {
      // Prefer WebP format
      if (response.url.includes('logos/')) {
        expect(response.url).toContain('.webp');
      }

      // Check for proper headers
      expect(response.headers['content-type']).toBeTruthy();
    }
  });
});
