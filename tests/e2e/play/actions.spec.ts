import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  GAME_BINDINGS,
  MOVE_CODES,
  navigateToRoomPlay,
  readPlayTest,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

async function bootCivilianPlay(page: Page): Promise<string[]> {
  const consoleErrors = captureConsoleErrors(page);
  await navigateToRoomPlay(page);
  await waitForCanvas(page);
  await waitForPlayTest(page);
  expect((await readPlayTest(page))?.skinId).toBe('remy');
  return consoleErrors;
}

async function enterKneel(page: Page): Promise<void> {
  await page.keyboard.press(MOVE_CODES.kneelToggle);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');
}

test(`room play: jump on ${GAME_BINDINGS.jump.label} from a walk returns to walk`, async ({ page }) => {
  const consoleErrors = await bootCivilianPlay(page);

  await page.keyboard.down(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');

  await page.keyboard.press(MOVE_CODES.jump);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('jump');
  // One-shot: busy until the mixer finishes, then back to the walk below.
  await expect
    .poll(async () => (await readPlayTest(page))?.activeClip, { timeout: 10_000 })
    .toBe('walk');

  expectNoConsoleErrors(consoleErrors);
});

test('room play: kneel from a walk enters crouch-walk; toggle stands up while moving', async ({ page }) => {
  const consoleErrors = await bootCivilianPlay(page);

  await page.keyboard.down(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');

  await page.keyboard.press(MOVE_CODES.kneelToggle);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('crouchWalking');
  await page.keyboard.press(MOVE_CODES.kneelToggle);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');

  expectNoConsoleErrors(consoleErrors);
});

test('room play: kneel pose holds after the clip ends', async ({ page }) => {
  const consoleErrors = await bootCivilianPlay(page);

  await enterKneel(page);

  // LoopOnce + clamp: the pose holds after the clip ends.
  await page.waitForTimeout(600);
  expect((await readPlayTest(page))?.activeClip).toBe('kneel');

  expectNoConsoleErrors(consoleErrors);
});

test('room play: kneel + WASD crouch-walks then resumes kneel', async ({ page }) => {
  const consoleErrors = await bootCivilianPlay(page);

  await enterKneel(page);

  await page.keyboard.down(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('crouchWalking');
  await page.keyboard.up(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  expectNoConsoleErrors(consoleErrors);
});

test(`room play: kneel + ${GAME_BINDINGS.sprint.label} runs then resumes kneel`, async ({ page }) => {
  const consoleErrors = await bootCivilianPlay(page);

  await enterKneel(page);

  await page.keyboard.down(MOVE_CODES.forward);
  await page.keyboard.down(MOVE_CODES.runModifier);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('run');
  await page.keyboard.up(MOVE_CODES.runModifier);
  await page.keyboard.up(MOVE_CODES.forward);
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

  await page.keyboard.down(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');
  await page.keyboard.up(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('idle');

  await page.keyboard.press(MOVE_CODES.kneelToggle);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  await page.keyboard.down(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('crouchWalking');
  await page.keyboard.up(MOVE_CODES.forward);
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('kneel');

  expectNoConsoleErrors(consoleErrors);
});
