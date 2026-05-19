import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly cartQty: Locator;
  private readonly cartSubtotals: Locator;
  private readonly cartTotal: Locator;
  private readonly removeButton: Locator;
  private readonly cartItemTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.cartQty = this.page.locator('.order-qty > .o-value');
    this.cartSubtotals = this.page.locator('.tbl-row > .subtotal');
    this.cartTotal = this.page.locator('.order-total > .o-value');
    this.removeButton = this.page.locator('.icon-remove');
    this.cartItemTitles = this.page.locator('.tbl-row .title a');
  }

  async verifyCartCount(expectedCount: number) {
    await expect(this.cartQty).toContainText(expectedCount.toString());
    await expect(this.cartItemTitles).toHaveCount(expectedCount);
  }

  async getCartItemTitles() {
    const titles = await this.cartItemTitles.allTextContents();
    return titles.map(title => title.trim()).filter(Boolean);
  }

  async verifyDistinctItems(expectedCount: number) {
    const titles = await this.getCartItemTitles();
    expect(titles).toHaveLength(expectedCount);
    expect(new Set(titles).size).toBe(expectedCount);
    return titles;
  }

  async verifyTitleRemoved(title: string) {
    const titles = await this.getCartItemTitles();
    expect(titles).not.toContain(title);
  }

  async verifyCartSumIsCorrect() {
    const cartItems = await this.cartSubtotals.all();

    let cartItemsSum = 0;

    for (const item of cartItems) {
      const text = await item.textContent();
      const price = Number((text || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
      cartItemsSum += price;
    }

    const basketSumTotalText = await this.cartTotal.textContent();
    const basketSumTotal = Number((basketSumTotalText || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;

    expect(basketSumTotal).toBeCloseTo(cartItemsSum, 2);
    return cartItemsSum;
  }

  async removeItemByIndex(index: number) {
    await this.removeButton.nth(index).click();
  }
}
