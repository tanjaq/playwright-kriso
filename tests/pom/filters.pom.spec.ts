/**
 * Part II — Page Object Model tests
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ProductPage } from '../../pages/ProductPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let productPage: ProductPage;
let initialCount = 0;
let languageFilteredCount = 0;
let formatFilteredCount = 0;

test.describe('Navigate Products via Filters (POM)', () => {
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext();
    page = await context.newPage();
    productPage = new ProductPage(page);

    await page.goto('https://www.kriso.ee/');
    await productPage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await productPage.verifyLogo();
  });

  test('Test navigate to Kitarr category', async () => {
    await productPage.openMusicBooksSection();
    await productPage.openKitarrCategory();
    await productPage.verifyKitarrInUrl();

    initialCount = await productPage.getResultsCount();
    expect(initialCount).toBeGreaterThan(1);
  });

  test('Test apply language and format filters', async () => {
    await productPage.applyEnglishFilter();
    await productPage.verifyLanguageFilterInUrl();
    languageFilteredCount = await productPage.getResultsCount();
    expect(languageFilteredCount).toBeLessThan(initialCount);

    await productPage.applyCdFormatFilter();
    await productPage.verifyCdFilterInUrl();
    formatFilteredCount = await productPage.getResultsCount();
    expect(formatFilteredCount).toBeLessThan(languageFilteredCount);
  });

  test('Test remove active filters', async () => {
    await productPage.removeActiveFiltersWithBackNavigation();
    const countAfterRemoval = await productPage.getResultsCount();
    expect(countAfterRemoval).toBeGreaterThan(formatFilteredCount);
  });

});