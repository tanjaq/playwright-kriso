import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';

export class HomePage extends BasePage {
  async verifyNoProductsFoundMessage() {
    await expect(this.page.getByText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud. Palun proovige uuesti!')).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Lisa ostukorvi', exact: true })).toHaveCount(0);
  }

  async getResultsCount() {
    const count = this.page.getByText(/^Otsingu vasteid leitud:/);
    await expect(count).toBeVisible();
    const match = (await count.innerText()).match(/leitud:\s*([\d\s]+)/);
    if (!match) throw new Error('Results count was not found');
    return Number(match[1].replace(/\s/g, ''));
  }

  async verifySearchResults(keyword: string) {
    expect(await this.getResultsCount()).toBeGreaterThan(1);
    const descriptions = this.page.getByRole('list').filter({
      has: this.page.getByRole('heading', { level: 3, name: /^\d+\./ })
    });
    expect(await descriptions.count()).toBeGreaterThan(1);
    for (const description of await descriptions.all()) {
      await expect(description).toContainText(new RegExp(keyword, 'i'));
    }
  }

  async addToCartByIndex(index: number, expectedCount: number) {
    await this.page.getByRole('link', { name: 'Lisa ostukorvi', exact: true }).nth(index).click();
    const confirmation = this.page.getByRole('list').filter({ hasText: 'Toode lisati ostukorvi' });
    await expect(confirmation).toContainText('Tooteid ostukorvis: ' + expectedCount);
    return (await confirmation.getByRole('listitem').first().innerText()).trim();
  }

  async goBackFromCart() {
    await this.page.getByRole('link', { name: /Jätka ostlemist/ }).click();
  }

  async openShoppingCart() {
    await this.page.getByRole('link', { name: /Mine ostukorvi/ }).click();
    await expect(this.page).toHaveURL(/basket\.html/);
    return new CartPage(this.page);
  }

  async openMusicCategory() {
    await this.page.getByRole('link', { name: 'Muusikaraamatud ja noodid', exact: true }).click();
    await this.page.getByRole('link', { name: /^Kitarr \(/ }).click();
    await expect(this.page).toHaveURL(/instrument=Guitar/);
  }

  async filterByEnglish() {
    await this.page.getByRole('link', { name: /^Inglise \(/ }).click();
    await expect(this.page).toHaveURL(/mlanguage=English/);
    await expect(this.page.getByText('Keel: Inglise', { exact: true }).first()).toBeVisible();
  }

  async filterByCd() {
    await this.page.getByRole('link', { name: /^CD \(/ }).click();
    await expect(this.page).toHaveURL(/format=CD/);
    await expect(this.page.getByText('Formaat: CD', { exact: true }).first()).toBeVisible();
  }

  async clearFilters() {
    await this.page.getByRole('link', { name: 'Eemalda kõik', exact: true }).click();
    await expect(this.page).not.toHaveURL(/mlanguage=|format=|instrument=/);
  }
}
