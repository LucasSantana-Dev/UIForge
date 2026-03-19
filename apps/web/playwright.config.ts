import { defineConfig, devices } from '@playwright/test';

const port = process.env.PLAYWRIGHT_WEB_PORT ?? '3100';
const baseURL = `http://localhost:${port}`;
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_SERVER
  ? process.env.PLAYWRIGHT_REUSE_SERVER === 'true'
  : !process.env.CI;
const webServerEnv = { ...process.env };
delete webServerEnv.NO_COLOR;
delete webServerEnv.FORCE_COLOR;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? `env -u NO_COLOR -u FORCE_COLOR npx next start -p ${port}`
      : `env -u NO_COLOR -u FORCE_COLOR npm run dev -- --port ${port} --webpack`,
    url: `${baseURL}/signin`,
    timeout: 120 * 1000,
    reuseExistingServer,
    env: {
      ...webServerEnv,
      NEXT_PUBLIC_E2E_DISABLE_TOUR: process.env.NEXT_PUBLIC_E2E_DISABLE_TOUR ?? 'true',
      SIZA_LOCAL_AUTH_BYPASS: 'false',
    },
  },
});
