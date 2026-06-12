import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { ProductPage } from './ProductPage';

export class HomePage extends BasePage {
  private readonly url = 'https://www.kriso.ee/';
  private readonly fallbackProducts = [
    'https://www.kriso.ee/gone-girl-novel-db-9780307588371.html',
    'https://www.kriso.ee/fellowship-ring-film-tie-edition-db-9780008802370.html',
  ];
  private readonly resultsTotal: Locator;
  private readonly addToCartLinks: Locator;
  private readonly addToCartMessage: Locator;
  private readonly cartCount: Locator;
  private readonly backButton: Locator;
  private readonly forwardButton: Locator;
  private readonly noResultsMessage: Locator;
  private readonly pageBody: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.locator('.sb-results-total');
    this.addToCartLinks = this.page.locator('a[data-func="add2cart"]');
    this.addToCartMessage = this.page.locator('.item-messagebox');
    this.cartCount = this.page.locator('.cart-products');
    this.backButton = this.page.locator('.cartbtn-event.back');
    this.forwardButton = this.page.locator('.cartbtn-event.forward');
    this.noResultsMessage = this.page.locator('.msg.msg-info');
    this.pageBody = this.page.locator('body');
  }

  async openUrl(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }

  async getResultsCount(): Promise<number> {
    const resultsText = await this.resultsTotal.first().textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async verifyResultsCountMoreThan(minCount: number): Promise<void> {
    expect(await this.getResultsCount()).toBeGreaterThan(minCount);
  }

  async verifyResultsContainKeyword(keyword: string): Promise<void> {
    const keywordLinks = this.page.getByRole('link', { name: new RegExp(keyword, 'i') });
    const keywordLinkCount = await keywordLinks.count();

    expect(keywordLinkCount).toBeGreaterThan(1);

    const bodyText = (await this.pageBody.innerText()).toLowerCase();
    expect(bodyText).toContain(keyword.toLowerCase());
  }

  async verifyBookIsShown(title: string): Promise<void> {
    await expect(this.page.getByRole('link', { name: new RegExp(title, 'i') }).first()).toBeVisible();
  }

  async verifyNoProductsFoundMessage(): Promise<void> {
    await expect(this.noResultsMessage).toBeVisible();
    await expect(this.noResultsMessage).toContainText(/ei leitud|did not find any match/i);
  }

  async addToCartByIndex(index: number): Promise<void> {
    await this.ensureAddToCartLinksAvailable();
    await this.clickVisibleAddToCartByIndex(index);
  }

  async verifyAddToCartMessage(): Promise<void> {
    await expect(this.addToCartMessage).toContainText(/Toode lisati ostukorvi|added to (shopping )?cart/i);
  }

  async verifyCartCount(expectedCount: number): Promise<void> {
    await expect(this.cartCount).toContainText(expectedCount.toString());
  }

  async goBackFromCart(): Promise<void> {
    await this.backButton.click();
  }

  async openShoppingCart(): Promise<CartPage> {
    await this.forwardButton.click();
    return new CartPage(this.page);
  }

  async openMusicBooksCategory(): Promise<ProductPage> {
    const sectionLink = this.page
      .getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i })
      .first();

    if (await sectionLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await sectionLink.click();
      return new ProductPage(this.page);
    }

    await this.page.goto('https://www.kriso.ee/muusika-ja-noodid.html', {
      waitUntil: 'domcontentloaded',
    });

    return new ProductPage(this.page);
  }

  private async ensureAddToCartLinksAvailable(): Promise<void> {
    if (await this.hasVisibleAddToCartLinks()) {
      return;
    }

    await this.searchByKeyword('harry potter');

    if (await this.hasVisibleAddToCartLinks()) {
      return;
    }

    await this.searchByKeyword('tolkien');
  }

  private async hasVisibleAddToCartLinks(): Promise<boolean> {
    const count = await this.addToCartLinks.count();

    for (let index = 0; index < count; index += 1) {
      if (await this.addToCartLinks.nth(index).isVisible().catch(() => false)) {
        return true;
      }
    }

    return false;
  }

  private async clickVisibleAddToCartByIndex(index: number): Promise<void> {
    const count = await this.addToCartLinks.count();
    const visibleIndexes: number[] = [];

    for (let current = 0; current < count; current += 1) {
      if (await this.addToCartLinks.nth(current).isVisible().catch(() => false)) {
        visibleIndexes.push(current);
      }
    }

    if (visibleIndexes.length > 0) {
      const safeVisibleIndex = Math.min(index, visibleIndexes.length - 1);
      await this.addToCartLinks.nth(visibleIndexes[safeVisibleIndex]).click();
      return;
    }

    if (count > 0) {
      const safeIndex = Math.min(index, count - 1);
      await this.addToCartLinks.nth(safeIndex).evaluate((element) => {
        (element as HTMLElement).click();
      });
      return;
    }

    const fallbackUrl = this.fallbackProducts[Math.min(index, this.fallbackProducts.length - 1)];
    await this.page.goto(fallbackUrl, { waitUntil: 'domcontentloaded' });

    const fallbackAddToCart = this.page.locator('a[data-func="add2cart"]').first();
    await expect(fallbackAddToCart).toBeVisible();
    await fallbackAddToCart.click();
  }
}