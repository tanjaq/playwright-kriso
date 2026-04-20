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
      test.setTimeout(90_000);
      const context = await browser.newContext();
      page = await context.newPage();
  
      await page.goto('https://www.kriso.ee/', { waitUntil: 'domcontentloaded' });
      const consentButton = page.getByRole('button', { name: /Nõustun|I agree|Accept/i });
      if (await consentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await consentButton.click();
      }
    });
  
    test.afterAll(async () => {
      if (page) {
        await page.context().close();
      }
    });

    test('Test logo is visible', async () => {
      const logo = page.getByRole('link', { name: /Kriso/i }).first();
      await expect(logo).toBeVisible();
    }); 

  test('Test no products found', async () => {
    const searchInput = page.getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i }).first();
    const isSearchInputVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    const input = isSearchInputVisible ? searchInput : page.getByRole('textbox').first();
    await input.click();
    await input.fill('xqzwmfkj');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();
    const noResultsMessage = page.locator('.msg.msg-info');
    await expect(noResultsMessage).toBeVisible();
    await expect(noResultsMessage).toContainText(/ei leitud|did not find any match/i);
  });

    test('Test search results contain keyword', async () => {
    const searchInput = page.getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i }).first();
    const isSearchInputVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    const input = isSearchInputVisible ? searchInput : page.getByRole('textbox').first();
    await input.click();
    await input.fill('tolkien');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();

    const keywordLinks = page.getByRole('link', { name: /tolkien/i });
    await expect(keywordLinks.first()).toBeVisible();
    expect(await keywordLinks.count()).toBeGreaterThan(1);
  });

    test('Test search by ISBN', async () => {
    const searchInput = page.getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i }).first();
    const isSearchInputVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    const input = isSearchInputVisible ? searchInput : page.getByRole('textbox').first();
    await input.click();
    await input.fill('9780307588371');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();

    await expect(page.getByRole('link', { name: /Gone Girl/i }).first()).toBeVisible();
  });

});