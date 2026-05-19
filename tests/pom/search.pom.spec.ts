/**
 * Part II - Page Object Model tests
 * Test suite: Search for Books by Keywords
 */
import { test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;

test.describe('Search for Books by Keywords (POM)', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    homePage = new HomePage(page);

    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await homePage.verifyLogo();
  });

  test('Test no products found', async () => {
    await homePage.searchByKeyword('xqzwmfkj');
    await homePage.verifyNoProductsFoundMessage();
  });

  test('Test search results contain keyword', async () => {
    await homePage.searchByKeyword('tolkien');
    await homePage.verifyResultsCountMoreThan(1);
    await homePage.verifyListedItemsContain('tolkien');
  });

  test('Test search by ISBN', async () => {
    await homePage.searchByKeyword('9780307588371');
    await homePage.verifyBookIsShown('Gone Girl');
    await homePage.verifyIsbnIsShown('9780307588371');
  });
});
