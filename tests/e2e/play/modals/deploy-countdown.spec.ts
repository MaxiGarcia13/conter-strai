import { expect, test } from '@playwright/test';

// eslint-disable-next-line no-restricted-imports
import {
  countdownBanner,
  deployingLoader,
  startMatchFromWaitingRoom,
} from '../../test-helpers';

test('countdown does not appear until deploy loader clears', async ({ page }) => {
  await startMatchFromWaitingRoom(page);

  const loader = deployingLoader(page);
  const countdown = countdownBanner(page);

  if (await loader.isVisible()) {
    await expect(countdown).toBeHidden();
  }

  await expect(page.locator('[data-testid="play-loader"]')).toBeHidden({ timeout: 30_000 });
  await expect(countdown).toBeHidden();

  await expect(countdown).toBeVisible({ timeout: 30_000 });
});
