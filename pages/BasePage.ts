import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async openUrl() {
    await this.page.goto('https://www.kriso.ee/');
    const consent = this.page.getByRole('button', { name: 'Nõustun', exact: true });
    if (await consent.isVisible()) await consent.click();
  }

  async verifyLogo() {
    await expect(this.page).toHaveTitle(/Kriso|Krisostomus/i);
  }

  async searchByKeyword(keyword: string) {
    await this.page.getByPlaceholder('Pealkiri, autor, ISBN, märksõna').fill(keyword);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }
}
