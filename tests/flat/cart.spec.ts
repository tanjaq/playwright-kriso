/**
 * Part I - Flat tests (no POM)
 * Test suite: Add Books to Shopping Cart
 */
import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;
let basketSumOfTwo = 0;
let removedItemTitle = '';

async function acceptCookies(page: Page) {
  const consentButton = page.getByRole('button', { name: /Nõustun|Accept|I agree/i });

  if (await consentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await consentButton.click();
  }
}

async function searchFor(keyword: string) {
  const preferredInput = page
    .getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i })
    .first();
  const input = (await preferredInput.isVisible().catch(() => false))
    ? preferredInput
    : page.getByRole('textbox').first();

  await input.fill(keyword);

  const searchButton = page.getByRole('button', { name: /Search|Otsi/i }).first();
  if (await searchButton.isVisible().catch(() => false)) {
    await searchButton.click();
  } else {
    await input.press('Enter');
  }

  await expect(page.locator('.sb-results-total').first()).toBeVisible({ timeout: 15000 });
}

async function resultsCount() {
  const resultsText = await page.locator('.sb-results-total').first().textContent();
  return Number((resultsText || '').replace(/\D/g, '')) || 0;
}

async function priceFrom(locator: Locator) {
  const text = await locator.textContent();
  return Number((text || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
}

async function cartTotal() {
  return priceFrom(page.locator('.order-total > .o-value'));
}

async function cartSubtotalsSum() {
  const subtotals = await page.locator('.tbl-row > .subtotal').all();
  const prices = await Promise.all(subtotals.map(priceFrom));
  return prices.reduce((sum, price) => sum + price, 0);
}

async function cartTitles() {
  const titles = await page.locator('.tbl-row .title a').allTextContents();
  return titles.map(title => title.trim()).filter(Boolean);
}

async function addToCartByIndex(index: number) {
  if (!await page.locator('.sb-results-total').first().isVisible().catch(() => false)) {
    await page.goto('/');
    await searchFor('tolkien');
  }

  const allLinks = page.getByRole('link');
  const total = await allLinks.count();
  const candidateIndexes: number[] = [];

  for (let i = 0; i < Math.min(total, 140); i += 1) {
    const link = allLinks.nth(i);
    const text = ((await link.innerText().catch(() => '')) || '').trim();
    const lower = text.toLowerCase();

    if (!text || text.length < 6) {
      continue;
    }

    if (/bestsellers|e-platforms|books in stock|help|log in|new account|categories|books|e-books|music books|language teaching materials|special offers|advanced search|shopping basket|wish list|your account|eng/.test(lower)) {
      continue;
    }

    if (await link.isVisible().catch(() => false)) {
      candidateIndexes.push(i);
    }

    if (candidateIndexes.length >= 25) {
      break;
    }
  }

  if (candidateIndexes.length === 0) {
    throw new Error('No product links found on the results page.');
  }

  await allLinks.nth(candidateIndexes[Math.min(index, candidateIndexes.length - 1)]).click();

  const addToCart = page
    .getByRole('button', { name: /Lisa ostukorvi|Ostukorvi|Add to (cart|basket)/i })
    .or(page.getByRole('link', { name: /Lisa ostukorvi|Ostukorvi|Add to (cart|basket)/i }))
    .or(page.locator('input[type="submit"][value*="ostukorvi" i], input[type="submit"][value*="cart" i], input[type="submit"][value*="basket" i]'))
    .or(page.locator('form[action*="cart" i] button, form[action*="basket" i] button'))
    .first();

  await expect(addToCart).toBeVisible({ timeout: 15000 });
  await addToCart.click();
}

test.describe('Add Books to Shopping Cart', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('/');
    await acceptCookies(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: /Kriso/i }).first()).toBeVisible();
  });

  test('Test search by keyword', async () => {
    await searchFor('harry potter');

    expect(await resultsCount()).toBeGreaterThan(1);
  });

  test('Test add book to cart', async () => {
    await searchFor('tolkien');
    await addToCartByIndex(0);

    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added to (shopping )?(cart|basket)/i);
    await expect(page.locator('.cart-products')).toContainText('1');
    await page.locator('.cartbtn-event.back').click();
  });

  test('Test add second book to cart', async () => {
    await addToCartByIndex(1);

    await expect(page.locator('.item-messagebox')).toContainText(/Toode lisati ostukorvi|added to (shopping )?(cart|basket)/i);
    await expect(page.locator('.cart-products')).toContainText('2');
  });

  test('Test cart count and sum is correct', async () => {
    await page.locator('.cartbtn-event.forward').click();

    await expect(page.locator('.order-qty > .o-value')).toContainText('2');
    await expect(page.locator('.tbl-row .title a')).toHaveCount(2);

    const titles = await cartTitles();
    expect(new Set(titles).size).toBe(2);

    basketSumOfTwo = await cartSubtotalsSum();
    expect(await cartTotal()).toBeCloseTo(basketSumOfTwo, 2);
  });

  test('Test remove item from cart and counter sum is correct', async () => {
    removedItemTitle = (await cartTitles())[0];
    await page.locator('.icon-remove').first().click();

    await expect(page.locator('.order-qty > .o-value')).toContainText('1');
    await expect(page.locator('.tbl-row .title a')).toHaveCount(1);

    const remainingTitles = await cartTitles();
    expect(remainingTitles).not.toContain(removedItemTitle);

    const basketSumOfOne = await cartSubtotalsSum();
    expect(await cartTotal()).toBeCloseTo(basketSumOfOne, 2);
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);
  });
});
