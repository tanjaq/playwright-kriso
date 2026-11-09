import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe.configure({ mode: 'serial' });
let page: Page;
let home: HomePage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  home = new HomePage(page);
  await home.openUrl();
});

test.afterAll(async () => {
  await page.context().close();
});

test.describe('Add Books to Shopping Cart (POM)', () => {
  test('add two books, verify the total and remove the first', async () => {
    await home.verifyLogo();
    await home.searchByKeyword('tolkien');
    expect(await home.getResultsCount()).toBeGreaterThan(1);
    const first = await home.addToCartByIndex(0, 1);
    await home.goBackFromCart();
    const second = await home.addToCartByIndex(1, 2);
    expect(second).not.toBe(first);
    const cart = await home.openShoppingCart();
    await cart.verifyBooks([first, second]);
    const twoBooks = await cart.verifyCartSumIsCorrect();
    await cart.removeItemByIndex(0);
    await cart.verifyBooks([second]);
    await cart.verifyBookRemoved(first);
    const oneBook = await cart.verifyCartSumIsCorrect();
    expect(oneBook).toBeLessThan(twoBooks);
  });
});
