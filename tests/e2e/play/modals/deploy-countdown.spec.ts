import { expect, test } from '@tests/e2e/fixtures';
import {
  countdownBanner,
  deployingLoader,
  startMatchFromWaitingRoom,
} from '@tests/e2e/test-helpers';

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
