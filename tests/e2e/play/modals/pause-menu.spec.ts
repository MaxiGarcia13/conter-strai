import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

// eslint-disable-next-line no-restricted-imports
import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  GAME_BINDINGS,
  MOVE_CODES,
  startMatchFromWaitingRoom,
  waitForLiveRound,
} from '../../test-helpers';

test.describe.serial('pause menu in a live round', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await startMatchFromWaitingRoom(page);
    await waitForLiveRound(page);
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('Escape opens the pause panel with Resume / Restart / Leave / Commands', async () => {
    const consoleErrors = captureConsoleErrors(page);

    await page.keyboard.press(GAME_BINDINGS.pause.code);

    const dialog = page.getByRole('dialog', { name: 'Game paused' });
    await expect(dialog).toBeVisible();

    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restart' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible();

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

    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(dialog).toBeHidden();

    expectNoConsoleErrors(consoleErrors);
  });

  test('Resume closes the pause panel and restores gameplay input', async () => {
    const consoleErrors = captureConsoleErrors(page);

    await page.keyboard.press(GAME_BINDINGS.pause.code);
    await expect(page.getByRole('dialog', { name: 'Game paused' })).toBeVisible();

    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('dialog', { name: 'Game paused' })).toBeHidden();

    await page.keyboard.down(MOVE_CODES.forward);
    await expect(page.getByRole('status', { name: /^Camera:/ })).toBeVisible();
    await page.keyboard.up(MOVE_CODES.forward);

    expectNoConsoleErrors(consoleErrors);
  });

  test('Leave from the pause panel navigates home', async () => {
    const consoleErrors = captureConsoleErrors(page);

    await page.keyboard.press(GAME_BINDINGS.pause.code);
    await page.getByRole('button', { name: 'Leave' }).click();

    await expect(page).toHaveURL('/');
    expectNoConsoleErrors(consoleErrors);
  });
});
