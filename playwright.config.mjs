import process from 'node:process';
import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const port = Number(process.env.PORT ?? 4326);

// Dedicated Colyseus port for E2E so a dev server on :2567 does not steal the socket.
const colyseusPort = process.env.E2E_COLYSEUS_PORT ?? '2568';

export default defineConfig({
  testDir: 'tests/e2e',
  retries: 1,
  workers: 1,
  timeout: isCI ? 120_000 : 90_000,
  expect: {
    timeout: isCI ? 15_000 : 8_000,
  },
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    headless: true,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: !isCI,
    port,
    env: {
      ...process.env,
      PUBLIC_E2E: 'true',
      PORT: String(port),
      COLYSEUS_PORT: colyseusPort,
      PUBLIC_COLYSEUS_URL: `ws://localhost:${colyseusPort}`,
    },
  },
});
