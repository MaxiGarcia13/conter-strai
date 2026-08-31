import { expect, test } from '@tests/e2e/fixtures';
import {
  captureConsoleErrors,
  expectNoConsoleErrors,
  navigateToRoomPlay,
  waitForPlayReady,
} from '@tests/e2e/test-helpers';

test('room play cycles camera modes without duplicating the local soldier', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await navigateToRoomPlay(page);
  await waitForPlayReady(page);

  const hud = page.getByRole('status', { name: /^Camera:/ });
  await expect(hud).toContainText('Over-the-shoulder');

  const crosshair = page.getByTestId('crosshair');
  await expect(crosshair).toBeVisible();

  await page.keyboard.press('C');
  await expect(hud).toContainText('Third-person');
  await expect(crosshair).toBeVisible();

  await page.keyboard.press('C');
  await expect(hud).toContainText('First-person');
  await expect(crosshair).toBeVisible();

  await page.keyboard.press('C');
  await expect(hud).toContainText('Over-the-shoulder');
  await expect(crosshair).toBeVisible();

  expectNoConsoleErrors(consoleErrors);
});
