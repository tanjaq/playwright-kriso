import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { ProductPage } from './ProductPage';

export class HomePage extends BasePage {
  private readonly url = '/';
  private readonly absoluteUrl = 'https://www.kriso.ee/';
  private readonly resultsTotal: Locator;
  private readonly addToCartMessage: Locator;
  private readonly cartCount: Locator;
  private readonly backButton: Locator;
  private readonly forwardButton: Locator;
  private readonly noResultsMessage: Locator;
  private readonly pageBody: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.locator('.sb-results-total');
    this.addToCartMessage = this.page.locator('.item-messagebox');
    this.cartCount = this.page.locator('.cart-products');
    this.backButton = this.page.locator('.cartbtn-event.back');
    this.forwardButton = this.page.locator('.cartbtn-event.forward');
    this.noResultsMessage = this.page.locator('.msg.msg-info');
    this.pageBody = this.page.locator('body');
  }

  async openUrl() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }

  async searchFor(keyword: string) {
    await this.searchByKeyword(keyword);
    await expect(this.resultsTotal.first()).toBeVisible({ timeout: 15000 });
  }

  async resultsCount() {
    const resultsText = await this.resultsTotal.first().textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async verifyResultsCountMoreThan(minCount: number) {
    expect(await this.resultsCount()).toBeGreaterThan(minCount);
  }

  async verifyListedItemsContain(keyword: string) {
    const keywordLinks = this.page.getByRole('link', { name: new RegExp(keyword, 'i') });
    expect(await keywordLinks.count()).toBeGreaterThan(1);

    const bodyText = (await this.pageBody.innerText()).toLowerCase();
    expect(bodyText).toContain(keyword.toLowerCase());
  }

  async verifyBookIsShown(title: string) {
    await expect(this.page.getByRole('link', { name: new RegExp(title, 'i') }).first()).toBeVisible();
  }

  async verifyIsbnIsShown(isbn: string) {
    await expect(this.page.getByText(isbn).first()).toBeVisible();
  }

  async openMusicBooksCategory() {
    const musicBooksLink = this.page
      .getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i })
      .first();

    if (await musicBooksLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await musicBooksLink.scrollIntoViewIfNeeded();
      await musicBooksLink.click();
      return new ProductPage(this.page);
    }

    await this.page.goto('/muusika-ja-noodid.html', { waitUntil: 'domcontentloaded' });
    return new ProductPage(this.page);
  }

  async addToCartByIndex(index: number) {
    await this.clickProductAndAddToCart(index);
  }

  async verifyAddToCartMessage() {
    await expect(this.addToCartMessage).toContainText(/Toode lisati ostukorvi|added to (shopping )?(cart|basket)/i);
  }

  async verifyCartCount(expectedCount: number) {
    await expect(this.cartCount).toContainText(expectedCount.toString());
  }

  async goBackFromCart() {
    await this.backButton.click();
  }

  async openShoppingCart() {
    await this.forwardButton.click();
    return new CartPage(this.page);
  }

  async verifyNoProductsFoundMessage() {
    await expect(this.noResultsMessage).toBeVisible();
    await expect(this.noResultsMessage).toContainText(/ei leitud|did not find any match/i);
  }

  private async clickProductAndAddToCart(index: number) {
    if (!await this.resultsTotal.first().isVisible().catch(() => false)) {
      await this.page.goto(this.absoluteUrl, { waitUntil: 'domcontentloaded' });
      await this.searchFor('tolkien');
    }

    await expect(this.resultsTotal.first()).toBeVisible({ timeout: 15000 });

    const allLinks = this.page.getByRole('link');
    const linkCount = await allLinks.count();
    const candidateIndexes: number[] = [];

    for (let i = 0; i < Math.min(linkCount, 140); i += 1) {
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

    const addToCart = this.page
      .getByRole('button', { name: /Lisa ostukorvi|Ostukorvi|Add to (cart|basket)/i })
      .or(this.page.getByRole('link', { name: /Lisa ostukorvi|Ostukorvi|Add to (cart|basket)/i }))
      .or(this.page.locator('input[type="submit"][value*="ostukorvi" i], input[type="submit"][value*="cart" i], input[type="submit"][value*="basket" i]'))
      .or(this.page.locator('form[action*="cart" i] button, form[action*="basket" i] button'))
      .first();

    await expect(addToCart).toBeVisible({ timeout: 15000 });
    await addToCart.click();
  }
}
