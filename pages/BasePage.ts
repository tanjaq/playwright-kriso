import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected readonly logo: Locator;
  protected readonly consentButton: Locator;
  protected readonly searchInput: Locator;
  protected readonly searchButton: Locator;

  constructor(protected page: Page) {
    this.logo = this.page.getByRole('link', { name: /Kriso/i }).first();
    this.consentButton = this.page.getByRole('button', { name: /Nõustun|I agree|Accept/i });
    this.searchInput = this.page.getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i }).first();
    this.searchButton = this.page.getByRole('button', { name: /Search|Otsi/i }).first();
  }

  async acceptCookies() {
    const isVisible = await this.consentButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      await this.consentButton.click();
    }
  }

  async verifyLogo() {
    await expect(this.logo).toBeVisible();
  }

  async searchByKeyword(keyword: string) {
    try {
      const inputVisible = await this.searchInput.isVisible({ timeout: 5000 }).catch(() => false);
      const input = inputVisible ? this.searchInput : this.page.getByRole('textbox').first();
      await input.click();
      await input.fill(keyword);
      await this.searchButton.click();
      return;
    } catch {
      await this.page.goto(`https://www.kriso.ee/cgi-bin/shop/searchbooks.html?tt=${encodeURIComponent(keyword)}`, {
        waitUntil: 'domcontentloaded',
      });
    }
  }
}