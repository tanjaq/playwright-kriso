import { test, expect } from '@playwright/test';

test.describe('Add Books to Shopping Cart', () => {
  test('add two books, check their total, and remove the first', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nõustun', exact: true }).click();
    await expect(page).toHaveTitle(/Kriso|Krisostomus/i);
    await page.getByPlaceholder('Pealkiri, autor, ISBN, märksõna').fill('tolkien');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const addButtons = page.getByRole('link', { name: 'Lisa ostukorvi', exact: true });
    await expect(addButtons.first()).toBeVisible();
    expect(await addButtons.count()).toBeGreaterThan(1);
    await addButtons.first().click();
    const confirmation = page.getByRole('list').filter({ hasText: 'Toode lisati ostukorvi' });
    await expect(confirmation).toContainText('Tooteid ostukorvis: 1');
    const firstTitle = (await confirmation.getByRole('listitem').first().innerText()).trim();
    await page.getByRole('link', { name: /Jätka ostlemist/ }).click();
    await addButtons.nth(1).click();
    await expect(confirmation).toContainText('Tooteid ostukorvis: 2');
    const secondTitle = (await confirmation.getByRole('listitem').first().innerText()).trim();
    expect(secondTitle).not.toBe(firstTitle);
    await page.getByRole('link', { name: /Mine ostukorvi/ }).click();
    await expect(page).toHaveURL(/basket\.html/);
    const rows = page.getByRole('row').filter({ has: page.getByRole('link') });
    await expect(rows).toHaveCount(2);
    await expect(rows.getByRole('link', { name: firstTitle, exact: true })).toBeVisible();
    await expect(rows.getByRole('link', { name: secondTitle, exact: true })).toBeVisible();
    const firstPrice = money(await rows.nth(0).getByRole('cell').nth(4).innerText());
    const secondPrice = money(await rows.nth(1).getByRole('cell').nth(4).innerText());
    const summary = page.getByRole('list').filter({ hasText: 'Tooteid kokku:' }).first();
    const total = (await summary.innerText()).match(/Kokku:\s*([\d\s,.]+)\s*€/);
    expect(total).not.toBeNull();
    expect(money(total![1])).toBeCloseTo(firstPrice + secondPrice, 2);
    await rows.nth(0).getByRole('cell').last().getByRole('link').click();
    await expect(rows).toHaveCount(1);
    await expect(rows.getByRole('link', { name: firstTitle, exact: true })).toHaveCount(0);
    await expect(rows.getByRole('link', { name: secondTitle, exact: true })).toBeVisible();
    const updated = (await summary.innerText()).match(/Kokku:\s*([\d\s,.]+)\s*€/);
    expect(updated).not.toBeNull();
    expect(money(updated![1])).toBeCloseTo(secondPrice, 2);
  });
});

function money(text: string) {
  const value = Number(text.replace(/[^0-9,]/g, '').replace(',', '.'));
  expect(Number.isFinite(value)).toBe(true);
  expect(value).toBeGreaterThan(0);
  return value;
}
