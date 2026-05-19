/**
 * Part II - Page Object Model tests
 * Test suite: Navigate Products via Filters
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;
let productPage: ProductPage;

test.describe('Navigate Products via Filters (POM)', () => {
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

  test('Navigate and filter products', async () => {
    await homePage.verifyLogo();

    productPage = await homePage.openMusicBooksCategory();
    await productPage.openGuitarCategory();
    await productPage.verifyResultsCountMoreThan(1);
    const guitarCount = await productPage.resultsCount();

    await productPage.applyLanguageFilter('Inglise');
    const englishCount = await productPage.resultsCount();
    expect(englishCount).toBeGreaterThan(0);
    expect(englishCount).toBeLessThan(guitarCount);

    await productPage.applyFormatFilter('CD');
    const cdCount = await productPage.resultsCount();
    expect(cdCount).toBeGreaterThan(0);
    expect(cdCount).toBeLessThanOrEqual(englishCount);

    await productPage.clearFilters();
    expect(await productPage.resultsCount()).toBeGreaterThanOrEqual(cdCount);
  });
});
