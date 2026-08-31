import { DEFAULT_MAX_PER_TEAM } from '@/modules/game/constants/play-defaults';
import { expect, test } from '../fixtures/fixtures';

test('create room posts to the API and writes a host session', async ({ page }) => {
  const created = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/room')
      && response.request().method() === 'POST',
  );

  await page.goto('/room');
  await page.getByRole('button', { name: 'Create Room' }).click();

  expect((await created).status()).toBe(201);
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);

  const roomId = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  expect(roomId).toMatch(/^[A-Z0-9]{6}$/);
  await expect(page.getByText(roomId, { exact: true })).toBeVisible();
  await expect(page.getByText(`0 / ${DEFAULT_MAX_PER_TEAM}`)).toHaveCount(2);
  await expect(page.getByText('Open', { exact: true })).toBeVisible();

  const session = await page.evaluate(
    (id) => sessionStorage.getItem(`cs:room:${id}`),
    roomId,
  );
  expect(session).toBeTruthy();
  expect(JSON.parse(session as string)).toMatchObject({
    role: 'host',
    scenario: 'arena-01',
    team: 'civilian',
    skin: 'remy',
  });
});

test('host close room deletes the match and returns to create', async ({ page, request }) => {
  const created = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/room')
      && response.request().method() === 'POST',
  );

  await page.goto('/room');
  await page.getByRole('button', { name: 'Create Room' }).click();
  expect((await created).status()).toBe(201);
  await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);

  const roomId = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  await expect.poll(async () => (await request.get(`/api/v1/room/${roomId}`)).status()).toBe(200);

  const closeRoom = page.getByRole('button', { name: 'Close Room' });
  await expect(closeRoom).toBeEnabled();

  // Hard nav (roomClosed / Close Room) can abort the DELETE response — assert the request was sent.
  const [deleteReq] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'DELETE'
        && req.url().includes(`/api/v1/room/${roomId}`),
      { timeout: 15_000 },
    ),
    closeRoom.click(),
  ]);
  expect(deleteReq.headers().authorization).toMatch(/^Bearer /);
  await expect(page).toHaveURL(/\/room$/);

  const leftover = await page.evaluate(
    (id) => sessionStorage.getItem(`cs:room:${id}`),
    roomId,
  );
  expect(leftover).toBeNull();

  const snapshot = await request.get(`/api/v1/room/${roomId}`);
  expect(snapshot.status()).toBe(404);
});
