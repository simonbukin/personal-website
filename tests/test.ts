import { expect, test } from '@playwright/test';

test('HomePage has expected attributes', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'simon bukin' })).toBeVisible();
	await expect(page.title()).resolves.toMatch('Simon Bukin');
	await expect(page.getByRole('heading', { name: 'projects.' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'blog.' })).toBeVisible();
});
