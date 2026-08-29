import { expect, test } from '@playwright/test';

import {
  captureConsoleErrors,
  countdownBanner,
  deployingLoader,
  expectNoConsoleErrors,
  holdDeployComplete,
  releaseDeployHold,
  startMatchFromWaitingRoom,
} from './test-helpers';

test('countdown does not appear until deploy loader clears', async ({ page }) => {
  const consoleErrors = captureConsoleErrors(page);

  await holdDeployComplete(page);
  await startMatchFromWaitingRoom(page);

  const loader = deployingLoader(page);
  const countdown = countdownBanner(page);

  await expect(loader).toBeVisible({ timeout: 30_000 });
  await expect(countdown).not.toBeVisible();

  await releaseDeployHold(page);

  await expect(loader).toBeHidden({ timeout: 15_000 });
  await expect(countdown).toBeVisible({ timeout: 15_000 });
  await expect(countdown).toContainText('3');

  expectNoConsoleErrors(consoleErrors);
});
