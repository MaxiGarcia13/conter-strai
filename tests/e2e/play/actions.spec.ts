import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  navigateToPlay,
  readPlayTest,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

test('/play plays a one-shot jump on F and holds kneel until movement cancels it', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await navigateToPlay(page);
  await waitForCanvas(page);
  await waitForPlayTest(page);

  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');

  await page.keyboard.press('KeyF');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('jump');
  // One-shot: busy until the mixer finishes, then back to the walk below.
  await expect
    .poll(async () => (await readPlayTest(page))?.activeClip, { timeout: 10_000 })
    .toBe('walk');

  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('idle');

  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  // LoopOnce + clamp: the pose holds after the clip ends.
  await page.waitForTimeout(600);
  expect((await readPlayTest(page))?.activeClip).toBe('kneel');

  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('idle');

  expectNoConsoleErrors(consoleErrors);
});
