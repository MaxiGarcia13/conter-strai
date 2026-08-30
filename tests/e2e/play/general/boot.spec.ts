import { expect, test } from '@playwright/test';

// eslint-disable-next-line no-restricted-imports
import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  navigateToRoomPlay,
  waitForCanvas,
  waitForPlayTest,
} from '../../test-helpers';

test('room play loads the scene and settles its assets', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await navigateToRoomPlay(page);
  await expect(page.locator('[data-testid="play-loader"]')).toBeVisible();
  await waitForCanvas(page);

  const atSpawn = await waitForPlayTest(page);

  expect(atSpawn.soldierCount).toBeGreaterThanOrEqual(1);
  expect(atSpawn.activeClip).toBe('idle');
  expect(atSpawn.skinId).toBe('remy');
  expectNoConsoleErrors(consoleErrors);
});
