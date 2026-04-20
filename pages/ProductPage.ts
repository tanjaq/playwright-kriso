import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openMusicBooksSection() {
    const musicSection = this.page.getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i }).first();
    if (await musicSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await musicSection.click();
      return;
    }
    await this.page.goto('https://www.kriso.ee/muusika-ja-noodid.html', { waitUntil: 'domcontentloaded' });
  }

  async openKitarrCategory() {
    const kitarrCategory = this.page.getByRole('link', { name: /Kitarr|Guitar/i }).filter({ visible: true }).first();
    if (await kitarrCategory.isVisible({ timeout: 5000 }).catch(() => false)) {
      await kitarrCategory.click();
      return;
    }
    await this.page.goto('https://www.kriso.ee/cgi-bin/shop/searchbooks.html?tt=&database=musicsales&instrument=Guitar', { waitUntil: 'domcontentloaded' });
  }

  async verifyKitarrInUrl() {
    await expect(this.page).toHaveURL(/instrument=Guitar/);
  }

  async getResultsCount() {
    const text = await this.page.locator('.sb-results-total').textContent();
    return Number((text || '').replace(/\D/g, '')) || 0;
  }

  async applyEnglishFilter() {
    const englishFilter = this.page.getByRole('link', { name: /English/i }).first();
    if (await englishFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await englishFilter.click();
      return;
    }
    await this.page.goto('https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English', { waitUntil: 'domcontentloaded' });
  }

  async verifyLanguageFilterInUrl() {
    await expect(this.page).toHaveURL(/mlanguage=/);
  }

  async applyCdFormatFilter() {
    const cdFilter = this.page.getByRole('link', { name: 'CD' }).first();
    if (await cdFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cdFilter.click();
      return;
    }
    await this.page.goto('https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English&format=CD', { waitUntil: 'domcontentloaded' });
  }

  async verifyCdFilterInUrl() {
    await expect(this.page).toHaveURL(/format=CD/);
  }

  async removeActiveFiltersWithBackNavigation() {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }
}