import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected readonly logo: Locator;
  protected readonly consentButton: Locator;
  protected readonly searchInput: Locator;
  protected readonly searchButton: Locator;

  constructor(protected page: Page) {
    this.logo = this.page.getByRole('link', { name: /Kriso/i }).first();
    this.consentButton = this.page.getByRole('button', { name: /Nõustun|Accept|I agree/i });
    this.searchInput = this.page
      .getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i })
      .first();
    this.searchButton = this.page.getByRole('button', { name: /Search|Otsi/i }).first();
  }

  async acceptCookies() {
    if (await this.consentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.consentButton.click();
    }
  }

  async verifyLogo() {
    await expect(this.logo).toBeVisible();
  }

  async searchByKeyword(keyword: string) {
    const input = await this.resolveSearchInput();
    await input.click();
    await input.fill(keyword);

    if (await this.searchButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.searchButton.click();
      return;
    }

    await input.press('Enter');
  }

  protected async resolveSearchInput(): Promise<Locator> {
    if (await this.searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      return this.searchInput;
    }

    const fallbackInput = this.page.getByRole('textbox').first();
    await expect(fallbackInput).toBeVisible();
    return fallbackInput;
  }
}
