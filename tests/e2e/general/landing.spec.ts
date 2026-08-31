import { expect, test } from '../fixtures';

test('landing renders and CTAs navigate to /room and /room/join', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Conter Strai');
  await expect(page.getByRole('heading', { level: 1, name: 'Conter Strai' })).toBeVisible();
  await expect(page.getByAltText('Soldiers geared up for deployment')).toBeVisible();

  const contribute = page.getByRole('link', { name: 'Contribute on GitHub' });
  await expect(contribute).toBeVisible();
  await expect(contribute).toHaveAttribute(
    'href',
    'https://github.com/MaxiGarcia13/conter-strai',
  );

  const createRoom = page.getByRole('link', { name: 'Create Room' });
  await expect(createRoom).toBeVisible();
  await createRoom.click();
  await expect(page).toHaveURL(/\/room$/);

  await page.goto('/');

  const joinRoom = page.getByRole('link', { name: 'Join Room' });
  await expect(joinRoom).toBeVisible();
  await joinRoom.click();
  await expect(page).toHaveURL(/\/room\/join$/);
  await expect(page.getByLabel('Room id')).toBeVisible();
});
