import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  navigateToPlay,
  readPlayTest,
  waitForCanvas,
  waitForPlayTest,
} from './test-helpers';

test('/play cycles camera modes without duplicating the local soldier', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await navigateToPlay(page);
  await waitForCanvas(page);
  const atSpawn = await waitForPlayTest(page);

  const hud = page.getByRole('status', { name: /^Camera:/ });
  await expect(hud).toContainText('Over-the-shoulder');

  const crosshair = page.getByTestId('crosshair');
  await expect(crosshair).toBeVisible();

  await page.mouse.click(640, 400);
  await page.keyboard.press('C');
  await expect(hud).toContainText('Third-person');
  expect((await readPlayTest(page))?.soldierCount).toBe(atSpawn?.soldierCount);

  await page.keyboard.press('C');
  await expect(hud).toContainText('First-person');
  expect((await readPlayTest(page))?.soldierCount).toBe(atSpawn?.soldierCount);
  await expect(crosshair).toBeVisible();

  await page.keyboard.press('C');
  await expect(hud).toContainText('Over-the-shoulder');
  expect((await readPlayTest(page))?.soldierCount).toBe(atSpawn?.soldierCount);

  expectNoConsoleErrors(consoleErrors);
});
