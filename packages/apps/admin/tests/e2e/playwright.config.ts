import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const host = process.env.HOST ?? 'localhost';
export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: './playwright-report' }], process.env.CI ? ['dot'] : ['list']],
  use: {
    baseURL: `http://${host}:${process.env.ADMIN_PORT ?? '8000'}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
    command: 'bun run start:dev',
    port: (process.env.ADMIN_PORT ?? 8000) as unknown as number,
    timeout: 120 * 1000,
    reuseExistingServer: true,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_API_BASE_URL: `http://${host}:${process.env.ADMIN_API_PORT ?? '3011'}/api`,
    },
  },
});
