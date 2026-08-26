import { expect, test } from '@playwright/test';

test('join page accepts a room id and writes a guest session', async ({ page }) => {
  await page.goto('/room/join');

  const roomId = page.getByLabel('Room id');
  await expect(roomId).toBeVisible();
  await expect(roomId).not.toHaveAttribute('readonly');
  await roomId.fill('ABC123');

  await page.getByRole('button', { name: 'Join Room' }).click();
  await expect(page).toHaveURL(/\/room\/ABC123$/);

  const session = await page.evaluate(() => sessionStorage.getItem('cs:room:ABC123'));
  expect(session).toBeTruthy();
  expect(JSON.parse(session as string)).toMatchObject({
    role: 'guest',
    scenario: 'arena-01',
    team: 'civilian',
    skin: 'remy',
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
