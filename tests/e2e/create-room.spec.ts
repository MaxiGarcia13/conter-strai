import { expect, test } from '@playwright/test';

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
  await expect(page.getByText('0 / 4')).toHaveCount(2);
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
  const disposed = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/v1/room/${roomId}`)
      && response.request().method() === 'DELETE',
  );

  await page.getByRole('button', { name: 'Close Room' }).click();
  expect((await disposed).status()).toBe(204);
  await expect(page).toHaveURL(/\/room$/);

  const leftover = await page.evaluate(
    (id) => sessionStorage.getItem(`cs:room:${id}`),
    roomId,
  );
  expect(leftover).toBeNull();

  const snapshot = await request.get(`/api/v1/room/${roomId}`);
  expect(snapshot.status()).toBe(404);
});
