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
      const logo = page.locator('.logo-icon');
      await expect(logo).toBeVisible();
    }); 

  test('Test no products found', async () => {
    await page.locator('#top-search-text').click();
    await page.locator('#top-search-text').fill('jaslkfjalskjdkls');
    await page.locator('#top-search-btn-wrap').click();

    await expect(page.locator('.msg.msg-info')).toContainText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud. Palun proovige uuesti!');
  });

    test('Test search results contain keyword', async () => {
    await page.locator('#top-search-text').click();
    await page.locator('#top-search-text').fill('tolkien');
    await page.locator('#top-search-btn-wrap').click();

    //TODO check results contain keyword
    const results = page.getByRole('link');
    await expect(results.first()).toBeVisible();

    const count = await results.count();
    expect(count).toBeGreaterThan(1);

    await expect(page.getByText(/tolkien/i).first()).toBeVisible();
    });

    test('Test search by ISBN', async () => {
      await page.locator('#top-search-text').click();
      await page.locator('#top-search-text').fill('9780307588371');
      await page.locator('#top-search-btn-wrap').click();

      //TODO check correct book is shown
      await expect(page.getByRole('heading', { name: /Gone Girl/i })).toBeVisible();
    });

});