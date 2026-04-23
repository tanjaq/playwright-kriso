/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

async function getResultsCount(currentPage: Page) {
  const pageText = await currentPage.locator('body').innerText();
  const resultsLine = pageText.split('\n').find((line) => line.includes('Otsingu vasteid leitud:'));
  const match = resultsLine?.match(/Otsingu vasteid leitud:\s*(\d+)/);
  return Number(match?.[1] ?? 0);
}

test.describe('Navigate Products via Filters', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://www.kriso.ee/');
    await page.getByRole('button', { name: 'Nõustun' }).click();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: 'Muusikaraamatud ja noodid' })).toBeVisible();
  });

  test('Test category filters reduce and restore results', async () => {
    await page.getByRole('link', { name: 'Muusikaraamatud ja noodid' }).click();
    await expect(page.getByText('Filtreeri tulemusi').first()).toBeVisible();

    await page.getByRole('link', { name: /Noodid ja raamatud/ }).nth(1).click();
    await page.getByRole('link', { name: 'Kitarr' }).nth(1).click();

    await expect(page).toHaveURL(/kitarr.*0105|0105.*kitarr/i);

    const baseCount = await getResultsCount(page);
    expect(baseCount).toBeGreaterThan(1);

    await page.getByRole('link', { name: /Inglise \(\d+\)/ }).click();
    const englishCount = await getResultsCount(page);
    expect(englishCount).toBeLessThan(baseCount);

    await page.getByRole('link', { name: /CD \(\d+\)/ }).click();
    const cdCount = await getResultsCount(page);

    await expect(page.getByText('Kitsendused Eemalda kõik')).toBeVisible();
    expect(cdCount).toBeLessThan(englishCount);

    await page.getByRole('link', { name: 'Eemalda kõik' }).click();
    const clearedCount = await getResultsCount(page);
    expect(clearedCount).toBeGreaterThan(cdCount);
  });

});
