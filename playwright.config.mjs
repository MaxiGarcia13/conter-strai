import process from 'node:process';
import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT ?? 4326);

export default defineConfig({
  testDir: 'tests/e2e',
  retries: 1,
  workers: 1,
  use: {
    baseURL: `http://localhost:${port}`,
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: true,
    port,
    env: {
      ...process.env,
      E2E: 'true',
      PORT: String(port),
    },
  },
});
