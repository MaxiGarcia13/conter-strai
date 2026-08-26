import { expect, test } from '@playwright/test';
import { createMatchRoomViaApi } from './lobby-helpers';

test('join page rejects an unknown room id', async ({ page }) => {
  await page.goto('/room/join');

  const roomId = page.getByLabel('Room id');
  await expect(roomId).toBeVisible();
  await expect(roomId).not.toHaveAttribute('readonly');
  await roomId.fill('ABC123');

  await page.getByRole('button', { name: 'Join Room' }).click();
  await expect(page.getByRole('alert')).toHaveText('Room not found');
  await expect(page).toHaveURL(/\/room\/join$/);
});

test('join page claims a seat then writes a guest session', async ({ page, request }) => {
  const roomId = await createMatchRoomViaApi(request);
  const claimed = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/v1/room/${roomId}`)
      && response.request().method() === 'PUT',
  );

  await page.goto('/room/join');
  await page.getByLabel('Room id').fill(roomId);
  await page.getByRole('button', { name: 'Join Room' }).click();

  expect((await claimed).status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`/room/${roomId}$`));

  const session = await page.evaluate(
    (id) => sessionStorage.getItem(`cs:room:${id}`),
    roomId,
  );
  expect(session).toBeTruthy();
  expect(JSON.parse(session as string)).toMatchObject({
    role: 'guest',
    scenario: 'arena-01',
    team: 'civilian',
    skin: 'remy',
    reservation: {
      name: expect.any(String),
      sessionId: expect.any(String),
      roomId: expect.any(String),
    },
  });
});

test('invite join path shows the room id from the URL', async ({ page }) => {
  await page.goto('/room/K7M2PQ/join');

  const roomId = page.getByLabel('Room id');
  await expect(roomId).toHaveValue('K7M2PQ');
  await expect(roomId).toHaveAttribute('readonly');
  await expect(page.getByRole('button', { name: 'Civilians' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Join Room' })).toBeVisible();
});

test('invite join reaches waiting with invite URL, copy, and QR', async ({ page, context, request }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const roomId = await createMatchRoomViaApi(request);

  await page.goto(`/room/${roomId}/join`);
  await page.getByRole('button', { name: 'Join Room' }).click();
  await expect(page).toHaveURL(new RegExp(`/room/${roomId}$`));
  await expect(page.getByText('0 / 4')).toHaveCount(2);
  await expect(page.getByText('Open', { exact: true })).toBeVisible();

  const inviteUrl = `${new URL(page.url()).origin}/room/${roomId}/join`;
  const inviteField = page.locator(`input[readonly][value="${inviteUrl}"]`);
  await expect(inviteField).toBeVisible();

  await expect(page.getByRole('img', { name: `QR code for invite link: ${inviteUrl}` })).toBeVisible();

  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(inviteUrl);

  await expect(page.getByRole('link', { name: 'Play' })).toHaveAttribute('href', `/room/${roomId}/play`);
});
