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
import { HomePage } from '../../pages/HomePage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;

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

  test('Test logo is visible', async () => {
    await homePage.verifyLogo();
  });

  test('Test category filters reduce and restore results', async () => {
    await homePage.openMusicBooksCategory();
    await homePage.verifyFiltersVisible();
    await homePage.openBooksAndScoresCategory();
    await homePage.openGuitarCategory();
    await homePage.verifyGuitarCategoryOpened();

    const baseCount = await homePage.getResultsCount();
    expect(baseCount).toBeGreaterThan(1);

    await homePage.filterByEnglishLanguage();
    const englishCount = await homePage.getResultsCount();
    expect(englishCount).toBeLessThan(baseCount);

    await homePage.filterByCdFormat();
    const cdCount = await homePage.getResultsCount();
    await homePage.verifyActiveFiltersVisible();
    expect(cdCount).toBeLessThan(englishCount);

    await homePage.clearFilters();
    const clearedCount = await homePage.getResultsCount();
    expect(clearedCount).toBeGreaterThan(cdCount);
  });

});
