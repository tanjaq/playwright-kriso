/**
 * Part II — Page Object Model tests
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect } from '@playwright/test';
import { ProductPage } from '../../pages/ProductPage';

test.describe('Navigate Products via Filters (POM)', () => {

  // TODO: implement tests
  test('Filter products flow', async ({ page }) => {
  const productPage = new ProductPage(page);

  await productPage.openUrl();
  await productPage.acceptCookies();

  await productPage.openMusicCategory();

  await productPage.clickKitarr();
  await expect(page.locator('body')).toContainText('Kitarr');

  await productPage.applyCD();
  await expect(page.locator('body')).toContainText('CD');

  await productPage.applyEnglish();
  await expect(page.locator('body')).toContainText('Inglise');

  await productPage.removeFiltersClick();

  await expect(productPage.kitarr).toBeVisible();
});

});
