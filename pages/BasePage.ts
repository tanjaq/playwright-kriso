import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected readonly logo: Locator;
  protected readonly consentButton: Locator;
  protected readonly searchInput: Locator;
  protected readonly searchButton: Locator;

  constructor(protected page: Page) {
    this.logo = this.page.getByRole('link', { name: 'Muusikaraamatud ja noodid' });
    this.consentButton = this.page.getByRole('button', { name: 'Nõustun' });
    this.searchInput = this.page.getByRole('textbox', { name: /Pealkiri, autor, ISBN/i });
    this.searchButton = this.page.getByRole('button', { name: 'Search' });
  }

  async acceptCookies() {
    await this.consentButton.click();
  }

  async verifyLogo() {
    await expect(this.logo).toBeVisible();
  }

  async searchByKeyword(keyword: string) {
    await this.searchInput.click();
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }
}
