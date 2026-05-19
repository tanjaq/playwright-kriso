/**
 * Part II - Page Object Model tests
 * Test suite: Add Books to Shopping Cart
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { CartPage } from '../../pages/CartPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;
let cartPage: CartPage;
let basketSumOfTwo = 0;
let removedTitle = '';

test.describe('Add Books to Shopping Cart (POM)', () => {
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

  test('Test search by keyword', async () => {
    await homePage.searchByKeyword('harry potter');
    await homePage.verifyResultsCountMoreThan(1);
  });

  test('Test add book to cart', async () => {
    await homePage.searchFor('tolkien');
    await homePage.addToCartByIndex(0);
    await homePage.verifyAddToCartMessage();
    await homePage.verifyCartCount(1);
    await homePage.goBackFromCart();
  });

  test('Test add second book to cart', async () => {
    await homePage.addToCartByIndex(1);
    await homePage.verifyAddToCartMessage();
    await homePage.verifyCartCount(2);
  });

  test('Test cart count and sum is correct', async () => {
    cartPage = await homePage.openShoppingCart();
    await cartPage.verifyCartCount(2);
    await cartPage.verifyDistinctItems(2);

    basketSumOfTwo = await cartPage.verifyCartSumIsCorrect();
  });

  test('Test remove item from cart and counter sum is correct', async () => {
    removedTitle = (await cartPage.getCartItemTitles())[0];
    await cartPage.removeItemByIndex(0);
    await cartPage.verifyCartCount(1);
    await cartPage.verifyTitleRemoved(removedTitle);

    const basketSumOfOne = await cartPage.verifyCartSumIsCorrect();
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);
  });
});
