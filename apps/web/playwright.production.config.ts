import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_PROD_BASE_URL || 'https://siza.forgespace.co';
const outputDir = process.env.PLAYWRIGHT_PROD_OUTPUT_DIR || 'test-results/production';
const reportDir = process.env.PLAYWRIGHT_PROD_REPORT_DIR || 'playwright-report/production';
const reportFile = process.env.PLAYWRIGHT_PROD_REPORT_FILE || `${outputDir}/report.json`;

export default defineConfig({
  testDir: './e2e',
  outputDir,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: reportDir, open: 'never' }],
    ['json', { outputFile: reportFile }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
