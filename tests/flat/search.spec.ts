import { test, expect } from '@playwright/test';

test.describe('Search for Books by Keywords', () => {
  test('search by missing keyword, author and ISBN', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nõustun', exact: true }).click();
    await expect(page).toHaveTitle(/Kriso|Krisostomus/i);
    const search = page.getByPlaceholder('Pealkiri, autor, ISBN, märksõna');
    await search.fill('xqzwmfkj');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud. Palun proovige uuesti!')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lisa ostukorvi', exact: true })).toHaveCount(0);
    await search.fill('tolkien');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByText(/^Otsingu vasteid leitud:/)).toBeVisible();
    const descriptions = page.getByRole('list').filter({
      has: page.getByRole('heading', { level: 3, name: /^\d+\./ })
    });
    expect(await descriptions.count()).toBeGreaterThan(1);
    for (const description of await descriptions.all()) {
      await expect(description).toContainText(/tolkien/i);
    }
    await search.fill('9780307588371');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Gone Girl/i }).first()).toBeVisible();
    await expect(page.getByText(/ISBN-13:.*9780307588371/).first()).toBeVisible();
  });
});
