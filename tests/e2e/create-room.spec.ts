import { expect, test } from '@playwright/test';

test('create room posts to the API and writes a host session', async ({ page }) => {
  const created = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/room')
      && response.request().method() === 'POST',
  );

  await page.goto('/room');
  await page.getByRole('button', { name: 'Create Room' }).click();

  const response = await created;
  expect(response.status()).toBe(201);
  const body = await response.json() as { id: string };
  expect(body.id).toMatch(/^[A-Z0-9]{6}$/);

  await expect(page).toHaveURL(new RegExp(`/room/${body.id}$`));
  await expect(page.getByText(body.id, { exact: true })).toBeVisible();

  const session = await page.evaluate(
    (roomId) => sessionStorage.getItem(`cs:room:${roomId}`),
    body.id,
  );
  expect(session).toBeTruthy();
  expect(JSON.parse(session as string)).toMatchObject({
    role: 'host',
    scenario: 'arena-01',
    team: 'civilian',
    skin: 'remy',
  });
});
