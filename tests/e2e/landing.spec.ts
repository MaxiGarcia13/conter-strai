import { expect, test } from '@playwright/test';

test('landing renders and CTA navigates to /play', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Conter Strai');
  await expect(page.getByRole('heading', { level: 1, name: 'Conter Strai' })).toBeVisible();
  await expect(page.getByAltText('Soldiers geared up for deployment')).toBeVisible();

  const cta = page.getByRole('link', { name: 'Start Game' });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/\/play$/);
});
