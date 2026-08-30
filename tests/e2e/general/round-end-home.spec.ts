import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  createHostRoom,
  seedGuestSession,
  seedHostSession,
  waitForMatchSession,
} from '../lobby-helpers';
import {
  ensureGuestReachedPlay,
  forceRoundEnd,
  markPlayHandoff,
  waitForLiveRound,
  waitForPlayThroughCountdown,
} from '../test-helpers';

async function startTwoPlayerRound(
  hostPage: Page,
  guestPage: Page,
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

  await markPlayHandoff(guestPage, roomId);

  await hostPage.getByRole('button', { name: 'Start Match' }).click();
  await expect(hostPage).toHaveURL(new RegExp(`/room/${roomId}/play$`), { timeout: 30_000 });
  await ensureGuestReachedPlay(guestPage, roomId, { handoffPreMarked: true });

  await Promise.all([waitForPlayThroughCountdown(hostPage), waitForPlayThroughCountdown(guestPage)]);
  await forceRoundEnd(hostPage);

  await expect(hostPage.getByRole('alert', { name: /win the round/i })).toBeVisible();
  await expect(guestPage.getByRole('alert', { name: /win the round/i })).toBeVisible();
}

test.describe.serial('two-player round-end Home', () => {
  test.describe.configure({ timeout: 90_000 });

  let hostContext: BrowserContext;
  let guestContext: BrowserContext;
  let hostPage: Page;
  let guestPage: Page;
  let roomId: string;

  test.beforeAll(async ({ browser, request }) => {
    test.setTimeout(90_000);
    const hostRoom = await createHostRoom(request);
    roomId = hostRoom.roomId;
    hostContext = await browser.newContext();
    guestContext = await browser.newContext();
    hostPage = await hostContext.newPage();
    guestPage = await guestContext.newPage();
    await startTwoPlayerRound(hostPage, guestPage, hostRoom);
  });

  test.afterAll(async () => {
    await hostContext?.close();
    await guestContext?.close();
  });

  test('Restart is host-only', async () => {
    await expect(guestPage.getByRole('button', { name: 'Restart' })).toHaveCount(0);
    await expect(hostPage.getByRole('button', { name: 'Restart' })).toBeVisible();
  });

  test('guest Home leaves without DELETE', async ({ request }) => {
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
  });
});

test('host round-end Home disposes the room', async ({ page, request }) => {
  test.setTimeout(90_000);
  const hostRoom = await createHostRoom(request);
  const { roomId } = hostRoom;

  await seedHostSession(page, hostRoom);
  await page.goto(`/room/${roomId}`);
  await waitForMatchSession(page, roomId);

  await page.getByRole('button', { name: 'Start Match' }).click();
  await expect(page).toHaveURL(new RegExp(`/room/${roomId}/play$`));
  await waitForLiveRound(page);
  await forceRoundEnd(page);

  const roundEnd = page.getByRole('alert', { name: /win the round/i });
  await expect(roundEnd).toBeVisible();
  await expect(roundEnd.getByRole('button', { name: 'Restart' })).toBeVisible();

  const [deleteReq] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'DELETE'
        && req.url().includes(`/api/v1/room/${roomId}`),
      { timeout: 15_000 },
    ),
    roundEnd.getByRole('button', { name: 'Home' }).click(),
  ]);
  expect(deleteReq.headers().authorization).toMatch(/^Bearer /);
  await expect(page).toHaveURL('/', { timeout: 15_000 });
  expect(await page.evaluate((id) => sessionStorage.getItem(`cs:room:${id}`), roomId)).toBeNull();
  expect((await request.get(`/api/v1/room/${roomId}`)).status()).toBe(404);
});
