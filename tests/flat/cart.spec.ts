/**
 * Part I — Flat tests (no POM)
 * Test suite: Add Books to Shopping Cart
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
let basketSumOfTwo = 0;

test.describe('Add Books to Shopping Cart', () => {

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

  test('Test search by keyword', async () => {
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõ' }).click();
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõ' }).fill('harry potter');
    await page.getByRole('button', { name: 'Search' }).click();

    // parse numeric total from the results text and assert it's > 1
    const resultsText = await page.locator('.sb-results-total').textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(1);
  }); 

  test('Test add book to cart', async () => {
    await page.getByRole('link', { name: 'Lisa ostukorvi' }).first().click();
    await expect(page.locator('.item-messagebox')).toContainText('Toode lisati ostukorvi');
    await expect(page.locator('.cart-products')).toContainText('1');
    await page.locator('.cartbtn-event.back').click();
  }); 

  test('Test add second book to cart', async () => {
    await page.getByRole('link', { name: 'Lisa ostukorvi' }).nth(5).click();
    await expect(page.locator('.item-messagebox')).toContainText('Toode lisati ostukorvi');
    await expect(page.locator('.cart-products')).toContainText('2');
  }); 

  test('Test cart count and sum is correct', async () => {
    await page.locator('.cartbtn-event.forward').click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('2');

    basketSumOfTwo = await returnBasketSum();
    let basketSumTotal = await returnBasketSumTotal();

    expect(basketSumTotal).toBeCloseTo(basketSumOfTwo, 2);
  }); 


  test('Test remove item from cart and counter sum is correct', async () => {
    await page.locator('.icon-remove').nth(0).click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('1');

    let basketSumOfOne = await returnBasketSum();
    let basketSumTotal = await returnBasketSumTotal();
    
    expect(basketSumTotal).toBeCloseTo(basketSumOfOne, 2);
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);
  });

  async function returnBasketSum() {
    let basketSum = 0;

    let cartItems = await page.locator('.tbl-row > .subtotal').all();

    for (const item of cartItems) {
      const text = await item.textContent();
      const price = Number((text || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
      basketSum += price;
    }

    return basketSum;
  };

  async function returnBasketSumTotal() {
    let basketSumTotalText = await page.locator('.order-total > .o-value').textContent();
    let basketSumTotal = Number((basketSumTotalText || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
    return basketSumTotal;
  };

}); 
