import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

interface PlayTestSnapshot {
  soldierCount: number;
  mixerReady: boolean;
  activeClip: string;
}

async function readPlayTest(page: Page): Promise<PlayTestSnapshot | undefined> {
  return page.evaluate(() => window.__PLAY_TEST__);
}

test('/play boots the scene and cycles camera modes without regressions', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(`pageerror: ${error.message}`);
  });

  await page.goto('/play');
  await expect(page.locator('canvas')).toBeVisible();

  // Loader dismisses once scenario + soldier assets settle.
  await expect(page.locator('.play-loader')).toHaveCount(0, { timeout: 30_000 });

  // Dev hook reports a ready mixer and an idle local soldier at spawn.
  await expect.poll(async () => (await readPlayTest(page))?.mixerReady).toBe(true);
  const atSpawn = await readPlayTest(page);
  expect(atSpawn?.soldierCount).toBeGreaterThanOrEqual(1);
  expect(atSpawn?.activeClip).toBe('idle');

  const hud = page.getByRole('status');
  await expect(hud).toContainText('First-person');

  // F cycles FPS → OTS → TPS → FPS; the soldier count must never change.
  await page.mouse.click(640, 400);
  await page.keyboard.press('F');
  await expect(hud).toContainText('Over-the-shoulder');
  expect((await readPlayTest(page))?.soldierCount).toBe(atSpawn?.soldierCount);

  await page.keyboard.press('F');
  await expect(hud).toContainText('Third-person');
  expect((await readPlayTest(page))?.soldierCount).toBe(atSpawn?.soldierCount);

  await page.keyboard.press('F');
  await expect(hud).toContainText('First-person');
  expect((await readPlayTest(page))?.soldierCount).toBe(atSpawn?.soldierCount);

  // WASD walks; holding Space runs; releasing returns to idle.
  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');
  await page.keyboard.down('Space');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('run');
  await page.keyboard.up('Space');
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('idle');

  expect(consoleErrors.filter((error) => /PropertyBinding/i.test(error))).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
