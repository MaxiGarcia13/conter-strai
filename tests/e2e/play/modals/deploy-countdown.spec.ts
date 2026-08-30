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

  expect.poll(async () => {
    const countdownText = await loader.textContent();
    if (countdownText?.includes('100%')) {
      return true;
    }
    return false;
  });

  expect.poll(async () => {
    const countdownText = await countdown.textContent();
    if (countdownText?.includes('3')) {
      return true;
    }
    return false;
  });
});
