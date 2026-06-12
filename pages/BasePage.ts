import { expect, Locator, Page } from '@playwright/test';

export class BasePage {
  protected readonly logo: Locator;
  protected readonly consentButton: Locator;
  protected readonly searchInput: Locator;
  protected readonly searchButton: Locator;

  constructor(protected readonly page: Page) {
    this.logo = this.page.getByRole('link', { name: /Kriso/i }).first();
    this.consentButton = this.page.getByRole('button', {
      name: /Nõustun|Accept|I agree/i,
    });
    this.searchInput = this.page
      .getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i })
      .first();
    this.searchButton = this.page.getByRole('button', { name: /Search|Otsi/i }).first();
  }

  async acceptCookies(): Promise<void> {
    const isVisible = await this.consentButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (isVisible) {
      await this.consentButton.click();
    }
  }

  async verifyLogo(): Promise<void> {
    await expect(this.logo).toBeVisible();
  }

  protected async resolveSearchInput(): Promise<Locator> {
    const preferredVisible = await this.searchInput.isVisible({ timeout: 5_000 }).catch(() => false);

    if (preferredVisible) {
      return this.searchInput;
    }

    const fallbackInput = this.page.getByRole('textbox').first();
    await expect(fallbackInput).toBeVisible();
    return fallbackInput;
  }

  async searchByKeyword(keyword: string): Promise<void> {
    const input = await this.resolveSearchInput();
    await input.click();
    await input.fill(keyword);

    const buttonVisible = await this.searchButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (buttonVisible) {
      await this.searchButton.click();
      return;
    }

    await input.press('Enter');
  }
}