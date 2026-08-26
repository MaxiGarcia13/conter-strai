import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  expectNoConsoleErrors,
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

  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');
  await page.keyboard.down('Space');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('run');
  await page.keyboard.up('Space');
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('idle');

  expectNoConsoleErrors(consoleErrors);
});
