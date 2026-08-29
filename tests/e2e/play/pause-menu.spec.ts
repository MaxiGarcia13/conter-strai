import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  countdownBanner,
  expectNoConsoleErrors,
  readPlayTest,
  startMatchFromWaitingRoom,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

/** Wait until the round goes live: countdown appears (3-2-1) then clears. */
async function waitForLiveRound(page: import('@playwright/test').Page): Promise<void> {
  await expect(countdownBanner(page)).toBeVisible({ timeout: 30_000 });
  await expect(countdownBanner(page)).toBeHidden({ timeout: 15_000 });
}

test('Escape opens the pause panel in a live round with Resume / Restart / Leave / Commands', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await startMatchFromWaitingRoom(page);
  await waitForCanvas(page);
  await waitForPlayTest(page);
  await waitForLiveRound(page);

  await page.keyboard.press('Escape');

  const dialog = page.getByRole('dialog', { name: 'Game paused' });
  await expect(dialog).toBeVisible();

  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  // Host of a room may restart the round.
  await expect(page.getByRole('button', { name: 'Restart' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible();

  // Commands toggle lists the gameplay bindings and replaces the main actions.
  await expect(page.getByText('Cycle camera mode', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Commands' }).click();
  await expect(page.getByText('Commands', { exact: true })).toBeVisible();
  await expect(page.getByText('Cycle camera mode', { exact: true })).toBeVisible();
  await expect(page.getByText('Kneel toggle', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Leave' })).toBeHidden();

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await expect(page.getByText('Cycle camera mode', { exact: true })).toBeHidden();

  expectNoConsoleErrors(consoleErrors);
});

test('Resume closes the pause panel and restores gameplay input', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await startMatchFromWaitingRoom(page);
  await waitForCanvas(page);
  await waitForPlayTest(page);
  await waitForLiveRound(page);

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Game paused' })).toBeVisible();

  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('dialog', { name: 'Game paused' })).toBeHidden();

  // Movement reacts again after resume.
  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await readPlayTest(page))?.activeClip).toBe('walk');
  await page.keyboard.up('KeyW');

  expectNoConsoleErrors(consoleErrors);
});

test('Leave from the pause panel navigates home', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await startMatchFromWaitingRoom(page);
  await waitForCanvas(page);
  await waitForPlayTest(page);
  await waitForLiveRound(page);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Leave' }).click();

  await expect(page).toHaveURL('/');
  expectNoConsoleErrors(consoleErrors);
});
