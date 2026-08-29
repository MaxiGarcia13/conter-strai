import { expect, test } from '@playwright/test';
import {
  createHostRoom,
  seedGuestSession,
  seedHostSession,
  waitForMatchSession,
} from './lobby-helpers';
import { ensureGuestReachedPlay, forceRoundEnd, waitForPlayTest } from './play/test-helpers';

async function startTwoPlayerRound(
  hostPage: import('@playwright/test').Page,
  guestPage: import('@playwright/test').Page,
  hostRoom: Awaited<ReturnType<typeof createHostRoom>>,
): Promise<void> {
  const { roomId } = hostRoom;
  await seedHostSession(hostPage, hostRoom);
  await seedGuestSession(guestPage, roomId);

  await hostPage.goto(`/room/${roomId}`);
  await guestPage.goto(`/room/${roomId}`);

  await waitForMatchSession(hostPage, roomId);
  await waitForMatchSession(guestPage, roomId);
  await expect(hostPage.getByRole('button', { name: 'Start Match' })).toBeEnabled();

  await hostPage.getByRole('button', { name: 'Start Match' }).click();
  await Promise.all([
    expect(hostPage).toHaveURL(new RegExp(`/room/${roomId}/play$`)),
    ensureGuestReachedPlay(guestPage, roomId),
  ]);

  await Promise.all([waitForPlayTest(hostPage), waitForPlayTest(guestPage)]);
  await forceRoundEnd(hostPage);

  await expect(hostPage.getByRole('alert', { name: /win the round/i })).toBeVisible();
  await expect(guestPage.getByRole('alert', { name: /win the round/i })).toBeVisible();
}

test('guest round-end Home leaves without DELETE', async ({ browser, request }) => {
  test.setTimeout(120_000);
  const hostRoom = await createHostRoom(request);
  const { roomId } = hostRoom;

  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  try {
    await startTwoPlayerRound(hostPage, guestPage, hostRoom);

    await expect(guestPage.getByRole('button', { name: 'Restart' })).toHaveCount(0);
    await expect(hostPage.getByRole('button', { name: 'Restart' })).toBeVisible();

    let guestDeleteSeen = false;
    guestPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes(`/api/v1/room/${roomId}`)) {
        guestDeleteSeen = true;
      }
    });

    await guestPage.getByRole('alert', { name: /win the round/i }).getByRole('button', { name: 'Home' }).click();
    await expect(guestPage).toHaveURL('/', { timeout: 15_000 });
    expect(guestDeleteSeen).toBe(false);
    expect(await guestPage.evaluate((id) => sessionStorage.getItem(`cs:room:${id}`), roomId)).toBeNull();
    expect((await request.get(`/api/v1/room/${roomId}`)).status()).toBe(200);
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});

test('host round-end Home disposes the room', async ({ page, request }) => {
  test.setTimeout(120_000);
  const hostRoom = await createHostRoom(request);
  const { roomId } = hostRoom;

  await seedHostSession(page, hostRoom);
  await page.goto(`/room/${roomId}`);
  await waitForMatchSession(page, roomId);

  await page.getByRole('button', { name: 'Start Match' }).click();
  await expect(page).toHaveURL(new RegExp(`/room/${roomId}/play$`));
  await waitForPlayTest(page);
  await forceRoundEnd(page);

  const roundEnd = page.getByRole('alert', { name: /win the round/i });
  await expect(roundEnd).toBeVisible();
  await expect(roundEnd.getByRole('button', { name: 'Restart' })).toBeVisible();

  const [disposed] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes(`/api/v1/room/${roomId}`)
        && response.request().method() === 'DELETE',
      { timeout: 15_000 },
    ),
    roundEnd.getByRole('button', { name: 'Home' }).click(),
  ]);
  expect(disposed.status()).toBe(204);
  await expect(page).toHaveURL('/', { timeout: 15_000 });
  expect(await page.evaluate((id) => sessionStorage.getItem(`cs:room:${id}`), roomId)).toBeNull();
  expect((await request.get(`/api/v1/room/${roomId}`)).status()).toBe(404);
});
