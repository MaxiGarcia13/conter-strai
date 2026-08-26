import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  navigateToPlay,
  navigateToRoomPlay,
  readPlayTest,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

test('/play plays jump on F; kneel + WASD crouch-walks; kneel + Space runs then resumes kneel', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await navigateToPlay(page);
  await waitForCanvas(page);
  await waitForPlayTest(page);

  expect((await readPlayTest(page))?.skinId).toBe('remy');

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

  // WASD keeps kneel stance and plays crouch-walking (does not stand up).
  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('crouchWalking');
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  // WASD+Space runs while kneel pose is kept; stop resumes kneel.
  await page.keyboard.down('KeyW');
  await page.keyboard.down('Space');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('run');
  await page.keyboard.up('Space');
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  expectNoConsoleErrors(consoleErrors);
});

test('room play as swat-1 boots shared clips without PropertyBinding errors', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);
  await navigateToRoomPlay(page, { team: 'soldier', skin: 'swat-1' });
  await waitForCanvas(page);
  await waitForPlayTest(page);

  expect((await readPlayTest(page))?.skinId).toBe('swat-1');
  expect((await readPlayTest(page))?.activeClip).toBe('idle');

  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('idle');

  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('crouchWalking');
  await page.keyboard.up('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  expectNoConsoleErrors(consoleErrors);
});
