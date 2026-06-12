import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  private readonly resultsTotal: Locator;
  private readonly body: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsTotal = this.page.locator('.sb-results-total');
    this.body = this.page.locator('body');
  }

  async openMusicBooksSection(): Promise<void> {
    const musicSection = this.page
      .getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i })
      .first();

    if (await musicSection.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await musicSection.click();
      return;
    }

    await this.page.goto('https://www.kriso.ee/muusika-ja-noodid.html', {
      waitUntil: 'domcontentloaded',
    });
  }

  async openKitarrCategory(): Promise<void> {
    const kitarrCategory = this.page.getByRole('link', { name: /Kitarr|Guitar/i }).first();

    if (await kitarrCategory.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await kitarrCategory.click();
      return;
    }

    await this.page.goto(
      'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?tt=&database=musicsales&instrument=Guitar',
      { waitUntil: 'domcontentloaded' },
    );
  }

  async applyEnglishFilter(): Promise<void> {
    const englishFilter = this.page.getByRole('link', { name: /English|Inglise/i }).first();

    if (await englishFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await englishFilter.click();
      return;
    }

    await this.page.goto(
      'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English',
      { waitUntil: 'domcontentloaded' },
    );
  }

  async applyCdFormatFilter(): Promise<void> {
    const cdFilter = this.page.getByRole('link', { name: /^CD$/i }).first();

    if (await cdFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await cdFilter.click();
      return;
    }

    await this.page.goto(
      'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English&format=CD',
      { waitUntil: 'domcontentloaded' },
    );
  }

  async getResultsCount(): Promise<number> {
    const text = await this.resultsTotal.first().textContent();
    return Number((text || '').replace(/\D/g, '')) || 0;
  }

  async verifyKitarrNavigation(): Promise<void> {
    await expect(this.page).toHaveURL(/instrument=Guitar|kitarr|guitar/i);
  }

  async verifyLanguageFilterApplied(): Promise<void> {
    await expect(this.page).toHaveURL(/mlanguage=|english/i);
    await expect(this.body).toContainText(/English|Inglise/i);
  }

  async verifyCdFilterApplied(): Promise<void> {
    await expect(this.page).toHaveURL(/format=CD/i);
    await expect(this.body).toContainText(/\bCD\b/i);
  }

  async removeActiveFiltersWithBackNavigation(times = 2): Promise<void> {
    for (let index = 0; index < times; index += 1) {
      await this.page.goBack();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }
}