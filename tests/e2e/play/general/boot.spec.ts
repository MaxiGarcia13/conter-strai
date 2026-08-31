import { expect, test } from '@tests/e2e/fixtures';
import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  navigateToRoomPlay,
  waitForPlayTest,
} from '@tests/e2e/test-helpers';

test('room play loads the scene and settles its assets', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await navigateToRoomPlay(page);
  await expect(page.locator('[data-testid="play-loader"]')).toBeVisible();

  const atSpawn = await waitForPlayTest(page);

  expect(atSpawn.soldierCount).toBeGreaterThanOrEqual(1);
  expect(atSpawn.activeClip).toBe('idle');
  expect(atSpawn.skinId).toBe('remy');
  expectNoConsoleErrors(consoleErrors);
});
