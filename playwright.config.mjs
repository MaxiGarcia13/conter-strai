import process from 'node:process';
import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const port = Number(process.env.PORT ?? 4326);
// Dedicated Colyseus port for E2E so a dev server on :2567 does not steal the socket.
const colyseusPort = process.env.E2E_COLYSEUS_PORT ?? '2568';

/** Stable software WebGL on Linux CI runners (ANGLE + SwiftShader). */
const chromiumLaunchArgs = isCI
  ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--use-gl=angle']
  : [];

export default defineConfig({
  testDir: 'tests/e2e',
  retries: 1,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: isCI ? 15_000 : 5_000,
  },
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    headless: true,
    launchOptions: {
      args: chromiumLaunchArgs,
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
      E2E: 'true',
      PORT: String(port),
      COLYSEUS_PORT: colyseusPort,
      PUBLIC_COLYSEUS_URL: `ws://localhost:${colyseusPort}`,
    },
  },
});
