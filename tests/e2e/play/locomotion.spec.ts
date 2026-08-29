import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  MOVE_CODES,
  navigateToRoomPlay,
  readPlayTest,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

test('room play changes the local soldier animation with movement input', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await navigateToRoomPlay(page);
  await waitForCanvas(page);
  await waitForPlayTest(page);

  await page.keyboard.down(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');
  await page.keyboard.down(MOVE_CODES.runModifier);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('run');
  await page.keyboard.up(MOVE_CODES.runModifier);
  await page.keyboard.up(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('idle');

  expectNoConsoleErrors(consoleErrors);
});
