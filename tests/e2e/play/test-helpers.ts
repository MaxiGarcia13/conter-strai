import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface PlayTestSnapshot {
  soldierCount: number;
  mixerReady: boolean;
  activeClip: string;
  skinId?: string;
}

export async function readPlayTest(page: Page): Promise<PlayTestSnapshot | undefined> {
  return page.evaluate(() => window.__PLAY_TEST__);
}

export function captureConsoleErrors(page: Page): string[] {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(`pageerror: ${error.message}`);
  });
  return consoleErrors;
}

export async function navigateToPlay(
  page: Page,
  options: { skin?: 'swat-1' | 'remy' } = {},
): Promise<void> {
  const params = new URLSearchParams();
  if (options.skin) {
    params.set('skin', options.skin);
  }
  const query = params.toString();
  await page.goto(query ? `/play?${query}` : '/play');
}

export async function waitForCanvas(page: Page): Promise<void> {
  await expect(page.locator('canvas')).toBeVisible();
}

export async function waitForPlayTest(page: Page): Promise<PlayTestSnapshot> {
  await expect
    .poll(async () => (await readPlayTest(page))?.mixerReady)
    .toBe(true);
  const snapshot = await readPlayTest(page);
  expect(snapshot).toBeDefined();
  return snapshot as PlayTestSnapshot;
}

export function expectNoConsoleErrors(consoleErrors: string[]): void {
  expect(consoleErrors.filter((error) => /PropertyBinding/i.test(error))).toEqual([]);
  expect(consoleErrors).toEqual([]);
}
