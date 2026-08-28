import { expect, test } from '@playwright/test';
import {
  navigateToPlayFromWaitingRoom,
  readPlayTest,
  waitForPlayTest,
} from './play/test-helpers';

test('create room plays as the default civilian remy', async ({ page }) => {
  await page.goto('/room');
  await page.getByRole('button', { name: 'Create Room' }).click();
  await expect(page).toHaveURL(/\/room\/[^/]+$/);

  const roomId = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  await navigateToPlayFromWaitingRoom(page, roomId);
  await expect(page).toHaveURL(/\/room\/[^/]+\/play$/);

  await waitForPlayTest(page);
  expect((await readPlayTest(page))?.skinId).toBe('remy');
});

test('create room plays as the selected soldier swat-1', async ({ page }) => {
  await page.goto('/room');
  await page.getByRole('button', { name: 'Soldiers' }).click();
  await page.getByRole('button', { name: 'swat-1' }).click();
  await page.getByRole('button', { name: 'Create Room' }).click();
  await expect(page).toHaveURL(/\/room\/[^/]+$/);

  const roomId = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  await navigateToPlayFromWaitingRoom(page, roomId);
  await expect(page).toHaveURL(/\/room\/[^/]+\/play$/);

  await waitForPlayTest(page);
  expect((await readPlayTest(page))?.skinId).toBe('swat-1');
});
