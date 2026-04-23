import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { ProductPage } from './ProductPage';

export class HomePage extends BasePage {
  private readonly url = 'https://www.kriso.ee/';
  private readonly resultsTotal: Locator;
  private readonly addToCartLink: Locator;
  private readonly addToCartMessage: Locator;
  private readonly cartCount: Locator;
  private readonly backButton: Locator;
  private readonly forwardButton: Locator;
  private readonly noResultsMessage: Locator;
  private readonly searchResultsHeading: Locator;
  private readonly tolkienResults: Locator;
  private readonly musicBooksLink: Locator;
  private readonly filterHeading: Locator;
  private readonly booksAndScoresLink: Locator;
  private readonly guitarCategoryLink: Locator;
  private readonly englishFilterLink: Locator;
  private readonly cdFilterLink: Locator;
  private readonly clearFiltersLink: Locator;
  private readonly activeFilters: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.getByText(/Otsingu vasteid leitud:/);
    this.addToCartLink = this.page.getByRole('link', { name: 'Lisa ostukorvi' });
    this.addToCartMessage = this.page.locator('.item-messagebox');
    this.cartCount = this.page.locator('.cart-products');
    this.backButton = this.page.locator('.cartbtn-event.back');
    this.forwardButton = this.page.locator('.cartbtn-event.forward');
    this.noResultsMessage = this.page.getByText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud. Palun proovige uuesti!');
    this.searchResultsHeading = this.page.getByRole('heading', { name: 'Otsingu tulemused' });
    this.tolkienResults = this.page.getByRole('heading').filter({ hasText: 'Tolkien' });
    this.musicBooksLink = this.page.getByRole('link', { name: 'Muusikaraamatud ja noodid' });
    this.filterHeading = this.page.getByText('Filtreeri tulemusi').first();
    this.booksAndScoresLink = this.page.getByRole('link', { name: /Noodid ja raamatud/ }).nth(1);
    this.guitarCategoryLink = this.page.getByRole('link', { name: 'Kitarr' }).nth(1);
    this.englishFilterLink = this.page.getByRole('link', { name: /Inglise \(\d+\)/ });
    this.cdFilterLink = this.page.getByRole('link', { name: /CD \(\d+\)/ });
    this.clearFiltersLink = this.page.getByRole('link', { name: 'Eemalda kõik' });
    this.activeFilters = this.page.getByText('Kitsendused Eemalda kõik');
  }

  async openUrl() {
    await this.page.goto(this.url);
  }

  async verifyResultsCountMoreThan(minCount: number) {
    const total = await this.getResultsCount();
    expect(total).toBeGreaterThan(minCount);
  }

  async getResultsCount() {
    const pageText = await this.page.locator('body').innerText();
    const resultsLine = pageText.split('\n').find((line) => line.includes('Otsingu vasteid leitud:'));
    const match = resultsLine?.match(/Otsingu vasteid leitud:\s*(\d+)/);
    return Number(match?.[1] ?? 0);
  }

  async addToCartByIndex(index: number) {
    await this.addToCartLink.nth(index).click();
  }

  async verifyAddToCartMessage() {
    await expect(this.addToCartMessage).toContainText('Toode lisati ostukorvi');
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
    await expect(this.noResultsMessage).toContainText('Teie poolt sisestatud märksõnale vastavat raamatut ei leitud. Palun proovige uuesti!');
  }

  async verifySearchResultsContainKeyword() {
    await expect(this.searchResultsHeading).toBeVisible();
    await expect(this.tolkienResults.first()).toBeVisible();
    expect(await this.tolkienResults.count()).toBeGreaterThan(1);
  }

  async openIsbnResult() {
    await this.page.getByRole('link', { name: /Gone Girl/i }).first().click();
    return new ProductPage(this.page);
  }

  async openMusicBooksCategory() {
    await this.musicBooksLink.click();
  }

  async verifyFiltersVisible() {
    await expect(this.filterHeading).toBeVisible();
  }

  async openBooksAndScoresCategory() {
    await this.booksAndScoresLink.click();
  }

  async openGuitarCategory() {
    await this.guitarCategoryLink.click();
  }

  async verifyGuitarCategoryOpened() {
    await expect(this.page).toHaveURL(/kitarr.*0105|0105.*kitarr/i);
  }

  async filterByEnglishLanguage() {
    await this.englishFilterLink.click();
  }

  async filterByCdFormat() {
    await this.cdFilterLink.click();
  }

  async verifyActiveFiltersVisible() {
    await expect(this.activeFilters).toBeVisible();
  }

  async clearFilters() {
    await this.clearFiltersLink.click();
  }
}
