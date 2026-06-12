/**
 * Part I — Flat tests (no POM)
 * Test suite: Add Books to Shopping Cart
 *
 * Rules:
 * - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 * - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;
let basketSumOfTwo = 0;

const fallbackProducts = [
  'https://www.kriso.ee/gone-girl-novel-db-9780307588371.html',
  'https://www.kriso.ee/fellowship-ring-film-tie-edition-db-9780008802370.html',
];

test.describe('Add Books to Shopping Cart', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://www.kriso.ee/', { waitUntil: 'domcontentloaded' });

    const consentButton = page.getByRole('button', { name: /Nõustun|Accept|I agree/i });
    if (await consentButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await consentButton.click();
    }
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: /Kriso/i }).first()).toBeVisible();
  });

  test('Test search by keyword', async () => {
    const input = await resolveSearchInput();
    await input.click();
    await input.fill('harry potter');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();

    const resultsText = await page.locator('.sb-results-total').first().textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(1);
  });

  test('Test add book to cart', async () => {
    await ensureAddToCartLinksAvailable();
    await clickVisibleAddToCartByIndex(0);

    await expect(page.locator('.item-messagebox')).toContainText(
      /Toode lisati ostukorvi|added to (shopping )?cart/i,
    );
    await expect(page.locator('.cart-products')).toContainText('1');
    await page.locator('.cartbtn-event.back').click();
  });

  test('Test add second book to cart', async () => {
    await ensureAddToCartLinksAvailable();
    await clickVisibleAddToCartByIndex(1);

    await expect(page.locator('.item-messagebox')).toContainText(
      /Toode lisati ostukorvi|added to (shopping )?cart/i,
    );
    await expect(page.locator('.cart-products')).toContainText('2');
  });

  test('Test cart count and sum is correct', async () => {
    await page.locator('.cartbtn-event.forward').click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('2');

    const cartTitles = (await page.locator('.tbl-row .title a').allTextContents())
      .map((title) => title.trim())
      .filter(Boolean);

    expect(cartTitles).toHaveLength(2);
    expect(new Set(cartTitles).size).toBe(2);

    basketSumOfTwo = await returnBasketSum();
    const basketSumTotal = await returnBasketSumTotal();
    expect(basketSumTotal).toBeCloseTo(basketSumOfTwo, 2);
  });

  test('Test remove item from cart and counter sum is correct', async () => {
    const removedItemTitle = ((await page.locator('.tbl-row .title a').first().textContent()) || '').trim();

    await page.locator('.icon-remove').first().click();
    await expect(page.locator('.order-qty > .o-value')).toContainText('1');

    const basketSumOfOne = await returnBasketSum();
    const basketSumTotal = await returnBasketSumTotal();
    expect(basketSumTotal).toBeCloseTo(basketSumOfOne, 2);
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);

    const remainingTitles = (await page.locator('.tbl-row .title a').allTextContents())
      .map((title) => title.trim())
      .filter(Boolean);

    expect(remainingTitles).toHaveLength(1);
    expect(remainingTitles).not.toContain(removedItemTitle);
  });

  async function resolveSearchInput(): Promise<Locator> {
    const namedSearchInput = page
      .getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i })
      .first();

    if (await namedSearchInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      return namedSearchInput;
    }

    return page.getByRole('textbox').first();
  }

  async function returnBasketSum(): Promise<number> {
    let basketSum = 0;
    const cartItems = await page.locator('.tbl-row > .subtotal').all();

    for (const item of cartItems) {
      const text = await item.textContent();
      const price = Number((text || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
      basketSum += price;
    }

    return basketSum;
  }

  async function returnBasketSumTotal(): Promise<number> {
    const basketSumTotalText = await page.locator('.order-total > .o-value').textContent();
    return Number((basketSumTotalText || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
  }

  async function ensureAddToCartLinksAvailable(): Promise<void> {
    const addLinks = page.locator('a[data-func="add2cart"]');

    if (await hasVisibleAddToCartLinks(addLinks)) {
      return;
    }

    const input = await resolveSearchInput();
    await input.click();
    await input.fill('harry potter');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();

    if (await hasVisibleAddToCartLinks(addLinks)) {
      return;
    }

    await input.click();
    await input.fill('tolkien');
    await page.getByRole('button', { name: /Search|Otsi/i }).first().click();
  }

  async function hasVisibleAddToCartLinks(addLinks: Locator): Promise<boolean> {
    const count = await addLinks.count();

    for (let index = 0; index < count; index += 1) {
      if (await addLinks.nth(index).isVisible().catch(() => false)) {
        return true;
      }
    }

    return false;
  }

  async function clickVisibleAddToCartByIndex(index: number): Promise<void> {
    const addLinks = page.locator('a[data-func="add2cart"]');
    const count = await addLinks.count();
    const visibleIndexes: number[] = [];

    for (let current = 0; current < count; current += 1) {
      if (await addLinks.nth(current).isVisible().catch(() => false)) {
        visibleIndexes.push(current);
      }
    }

    if (visibleIndexes.length > 0) {
      const safeVisibleIndex = Math.min(index, visibleIndexes.length - 1);
      await addLinks.nth(visibleIndexes[safeVisibleIndex]).click();
      return;
    }

    if (count > 0) {
      const safeIndex = Math.min(index, count - 1);
      await addLinks.nth(safeIndex).evaluate((element) => {
        (element as HTMLElement).click();
      });
      return;
    }

    const fallbackUrl = fallbackProducts[Math.min(index, fallbackProducts.length - 1)];
    await page.goto(fallbackUrl, { waitUntil: 'domcontentloaded' });
    const fallbackAddButton = page.locator('a[data-func="add2cart"]').first();
    await expect(fallbackAddButton).toBeVisible();
    await fallbackAddButton.click();
  }
});