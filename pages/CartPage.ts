import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private rows() {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('link') });
  }

  async verifyBooks(titles: string[]) {
    await expect(this.rows()).toHaveCount(titles.length);
    for (const title of titles) {
      await expect(this.rows().getByRole('link', { name: title, exact: true })).toBeVisible();
    }
  }

  async verifyCartSumIsCorrect() {
    let sum = 0;
    for (const row of await this.rows().all()) {
      const subtotal = await row.getByRole('cell').nth(4).innerText();
      sum += Number(subtotal.replace(/[^0-9,]/g, '').replace(',', '.'));
    }
    const summary = await this.page.getByRole('list').filter({ hasText: 'Tooteid kokku:' }).first().innerText();
    const match = summary.match(/Kokku:\s*([\d\s,.]+)\s*€/);
    if (!match) throw new Error('Cart total was not found');
    const total = Number(match[1].replace(/\s/g, '').replace(',', '.'));
    expect(Number.isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeCloseTo(sum, 2);
    return total;
  }

  async removeItemByIndex(index: number) {
    await this.rows().nth(index).getByRole('cell').last().getByRole('link').click();
  }

  async verifyBookRemoved(title: string) {
    await expect(this.rows().getByRole('link', { name: title, exact: true })).toHaveCount(0);
  }
}
