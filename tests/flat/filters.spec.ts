import { test, expect } from '@playwright/test';

test.describe('Navigate Products via Filters', () => {
  test('apply guitar, English and CD filters, then clear them', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nõustun', exact: true }).click();
    await expect(page).toHaveTitle(/Kriso|Krisostomus/i);
    const music = page.getByRole('link', { name: 'Muusikaraamatud ja noodid', exact: true });
    await expect(music).toBeVisible();
    await music.click();
    await page.getByRole('link', { name: /^Kitarr \(/ }).click();
    await expect(page).toHaveURL(/instrument=Guitar/);
    const countText = page.getByText(/^Otsingu vasteid leitud:/);
    await expect(countText).toBeVisible();
    const guitarCount = count(await countText.innerText());
    expect(guitarCount).toBeGreaterThan(1);
    await page.getByRole('link', { name: /^Inglise \(/ }).click();
    await expect(page).toHaveURL(/mlanguage=English/);
    await expect(page.getByText('Keel: Inglise', { exact: true }).first()).toBeVisible();
    const englishCount = count(await countText.innerText());
    expect(englishCount).toBeLessThan(guitarCount);
    await page.getByRole('link', { name: /^CD \(/ }).click();
    await expect(page).toHaveURL(/format=CD/);
    await expect(page.getByText('Formaat: CD', { exact: true }).first()).toBeVisible();
    const cdCount = count(await countText.innerText());
    expect(cdCount).toBeLessThan(englishCount);
    await page.getByRole('link', { name: 'Eemalda kõik', exact: true }).click();
    await expect(page).not.toHaveURL(/mlanguage=|format=|instrument=/);
    expect(count(await countText.innerText())).toBeGreaterThan(cdCount);
  });
});

function count(text: string) {
  const match = text.match(/leitud:\s*([\d\s]+)/);
  if (!match) throw new Error('Results count was not found');
  return Number(match[1].replace(/\s/g, ''));
}
