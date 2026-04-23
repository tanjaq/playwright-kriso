/**
 * Part I — Flat tests (no POM)
 * Test suite: Search for Books by Keywords
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
const searchBoxName = /Pealkiri, autor, ISBN/i;

test.describe('Search for Books by Keywords', () => {

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

  test('Test no products found', async () => {
    await page.getByRole('textbox', { name: searchBoxName }).click();
    await page.getByRole('textbox', { name: searchBoxName }).fill('jaslkfjalskjdkls');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud. Palun proovige uuesti!')).toBeVisible();
  });

  test('Test search results contain keyword', async () => {
    await page.getByRole('textbox', { name: searchBoxName }).click();
    await page.getByRole('textbox', { name: searchBoxName }).fill('tolkien');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('heading', { name: 'Otsingu tulemused' })).toBeVisible();

    const searchResults = page.getByRole('heading').filter({ hasText: 'Tolkien' });
    await expect(searchResults.first()).toBeVisible();
    expect(await searchResults.count()).toBeGreaterThan(1);
  });

  test('Test search by ISBN', async () => {
    await page.getByRole('textbox', { name: searchBoxName }).click();
    await page.getByRole('textbox', { name: searchBoxName }).fill('9780307588371');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('heading', { name: /Gone Girl/i })).toBeVisible();
  });

});
