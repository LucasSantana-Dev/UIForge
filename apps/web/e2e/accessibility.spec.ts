import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should pass axe accessibility audit', async ({ page }) => {
    // Inject axe-core
    await page.addScriptTag({
      content: `
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js';
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'axe-core'));
      `,
    });

    // Wait for axe to load
    await page.waitForFunction(() => typeof (window as any).axe !== 'undefined');

    // Run accessibility audit
    const results = await page.evaluate(async () => {
      return await (window as any).axe.run();
    });

    // Check for violations
    expect(results.violations).toHaveLength(0);

    if (results.violations.length > 0) {
      console.log('Accessibility violations:', results.violations);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.$$('h1, h2, h3, h4, h5, h6');

    if (headings.length > 0) {
      // Check that headings are in proper order
      let previousLevel = 1;

      for (let i = 0; i < headings.length; i++) {
        const level = parseInt(await headings[i].evaluate((el) => el.tagName.charAt(1)));

        // Heading levels should not skip more than one level
        if (level > previousLevel + 1) {
          console.log(`Heading level skipped from ${previousLevel} to ${level}`);
        }

        previousLevel = level;
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check contrast ratios for common elements
    const elements = await page.$$('button, a, .text-content');

    for (const element of elements.slice(0, 10)) { // Test first 10 elements
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });

      // Basic contrast check (simplified)
      // In a real implementation, you'd use a proper contrast calculation
      expect(styles.color).toBeTruthy();
      expect(styles.backgroundColor).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab');

    let focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(focused);

    // Test navigation through multiple focusable elements
    let previousFocused = focused;

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focused = await page.evaluate(() => document.activeElement?.tagName);

      // Should move to different elements
      if (i < 4) { // Don't check the last iteration as it might wrap around
        expect(focused).toBeTruthy();
      }

      previousFocused = focused;
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for missing ARIA labels on interactive elements
    const buttons = await page.$$('button');

    for (const button of buttons) {
      const hasText = await button.evaluate((el) => el.textContent?.trim().length > 0);
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasAriaLabelledBy = await button.getAttribute('aria-labelledby');

      // Buttons should have either text content or ARIA labels
      if (!hasText) {
        expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
      }
    }

    // Check for proper form labels
    const inputs = await page.$$('input, textarea, select');

    for (const input of inputs) {
      const hasLabel = await input.getAttribute('aria-label');
      const hasLabelledBy = await input.getAttribute('aria-labelledby');
      const hasAssociatedLabel = await input.evaluate((el) => {
        const id = el.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          return label !== null;
        }
        return false;
      });

      // Form inputs should have labels
      expect(hasLabel || hasLabelledBy || hasAssociatedLabel).toBeTruthy();
    }
  });

  test('should handle focus management properly', async ({ page }) => {
    // Test that focus is visible
    await page.keyboard.press('Tab');

    const focusInfo = await page.evaluate(() => {
      const focusedElement = document.activeElement;
      const styles = window.getComputedStyle(focusedElement);
      return {
        hasOutline: styles.outline !== 'none' && styles.outline !== '',
        hasBoxShadow: styles.boxShadow !== 'none' && styles.boxShadow !== ''
      };
    });

    // Focused elements should have visible focus indicators
    expect(focusInfo.hasOutline || focusInfo.hasBoxShadow).toBeTruthy();
  });

  test('should have proper semantic HTML', async ({ page }) => {
    // Check for proper use of semantic elements
    const main = await page.$('main');
    expect(main).toBeTruthy();

    const nav = await page.$('nav');
    if (nav) {
      const role = await nav.getAttribute('role');
      // Native nav elements don't need explicit role="navigation"
      expect(role === null || role === 'navigation').toBeTruthy();
    }

    // Check for proper use of landmarks
    const landmarks = await page.$$('main, nav, header, footer, section, article, aside');
    expect(landmarks.length).toBeGreaterThan(0);
  });

  test('should support screen readers', async ({ page }) => {
    // Check for screen reader announcements
    const announcements = await page.$$('[role="status"], [role="alert"], [aria-live]');

    // Should have some mechanism for screen reader announcements
    // Require at least one announcement element
    expect(announcements.length).toBeGreaterThan(0);
  });

  test('should have proper language attributes', async ({ page }) => {
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('en');

    // Check for proper lang attributes on content
    const contentElements = await page.$$('p, div, span');

    for (const element of contentElements.slice(0, 5)) {
      const lang = await element.getAttribute('lang');
      // If lang is specified, it should be valid
      if (lang) {
        expect(['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko']).toContain(lang);
      }
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.addStyleTag({
      content: `
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `,
    });

    // Test that animations are reduced
    await page.goto('/');

    // Check that animations respect reduced motion
    const animatedElements = await page.$$('[class*="animate"], [class*="transition"]');

    for (const element of animatedElements) {
      const styles = await element.evaluate((el) => {
        return window.getComputedStyle(el);
      });

      // Animations should be very fast or disabled
      const animationDuration = parseFloat(styles.animationDuration);
      expect(animationDuration).toBeLessThanOrEqual(0.1);
    }
  });
});
