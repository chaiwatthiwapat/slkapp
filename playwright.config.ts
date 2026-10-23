import { defineConfig, devices } from '@playwright/test';

const external = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: external ?? 'http://localhost:8002',
    ...devices['Desktop Chrome'],
    channel: 'chromium',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: external
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:8002/api/health',
        reuseExistingServer: false,
        timeout: 30_000,
      },
});
