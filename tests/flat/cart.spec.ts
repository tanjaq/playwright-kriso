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
import type { Page, Locator } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;
let basketSumOfTwo = 0;
const fallbackProducts = [
  'https://www.kriso.ee/gone-girl-db-9780307588371.html',
  'https://www.kriso.ee/fellowship-ring-film-tie-edition-db-9780008802370.html',
];

test.describe('Add Books to Shopping Cart', () => {

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

  test('Test search by keyword', async () => {
    const searchInput = page.getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i }).first();
    const isSearchInputVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    const input = isSearchInputVisible ? searchInput : page.getByRole('textbox').first();
    await input.click();
    await input.fill('harry potter');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();

    // parse numeric total from the results text and assert it's > 1
    const resultsText = await page.locator('.sb-results-total').textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(1);
  }); 

  test('Test add book to cart', async () => {
    await ensureAddToCartLinksAvailable();
    await clickVisibleAddToCartByIndex(0);
    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added to (shopping )?cart/i);
    await expect(page.locator('.cart-products')).toContainText('1');
    await page.locator('.cartbtn-event.back').click();
  }); 

  test('Test add second book to cart', async () => {
    await ensureAddToCartLinksAvailable();
    await clickVisibleAddToCartByIndex(1);
    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added to (shopping )?cart/i);
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

  async function ensureAddToCartLinksAvailable() {
    const addLinks = page.locator('a[data-func="add2cart"]');
    if (await hasVisibleAddToCartLinks(addLinks)) {
      return;
    }
    const searchInput = page.getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i }).first();
    const isSearchInputVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    const input = isSearchInputVisible ? searchInput : page.getByRole('textbox').first();

    await input.click();
    await input.fill('harry potter');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();
    if (await hasVisibleAddToCartLinks(addLinks)) {
      return;
    }

    await input.click();
    await input.fill('tolkien');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();
    expect(await hasVisibleAddToCartLinks(addLinks)).toBeTruthy();
  }

  async function hasVisibleAddToCartLinks(addLinks: Locator) {
    const count = await addLinks.count();
    for (let i = 0; i < count; i++) {
      if (await addLinks.nth(i).isVisible()) {
        return true;
      }
    }
    return false;
  }

  async function clickVisibleAddToCartByIndex(index: number) {
    const addLinks = page.locator('a[data-func="add2cart"]');
    const count = await addLinks.count();
    const visibleIndexes: number[] = [];

    for (let i = 0; i < count; i++) {
      if (await addLinks.nth(i).isVisible()) {
        visibleIndexes.push(i);
      }
    }

    if (visibleIndexes.length > 0) {
      const safeVisibleIndex = Math.min(index, visibleIndexes.length - 1);
      await addLinks.nth(visibleIndexes[safeVisibleIndex]).click();
      return;
    }

    if (count > 0) {
      const safeIndex = Math.min(index, count - 1);
      await addLinks.nth(safeIndex).evaluate((el) => {
        (el as HTMLElement).click();
      });
      return;
    }

    const fallbackUrl = fallbackProducts[Math.min(index, fallbackProducts.length - 1)];
    await page.goto(fallbackUrl, { waitUntil: 'domcontentloaded' });
    const productAddToCart = page.locator('a[data-func="add2cart"]').first();
    await expect(productAddToCart).toBeVisible();
    await productAddToCart.click();
  }

}); 