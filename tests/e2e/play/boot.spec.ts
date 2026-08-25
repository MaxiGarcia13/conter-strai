import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  navigateToPlay,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

test('/play loads the scene and settles its assets', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await navigateToPlay(page);
  await expect(page.locator('[data-testid="play-loader"]')).toBeVisible();
  await waitForCanvas(page);

  const atSpawn = await waitForPlayTest(page);

  expect(atSpawn.soldierCount).toBeGreaterThanOrEqual(1);
  expect(atSpawn.activeClip).toBe('idle');
  expect(atSpawn.skinId).toBe('swat-1');
  expectNoConsoleErrors(consoleErrors);
});
