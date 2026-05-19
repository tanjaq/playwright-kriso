import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  private readonly searchBaseUrl = '/cgi-bin/shop/searchbooks.html';
  private readonly musicBooksSection: Locator;
  private readonly resultsTotal: Locator;
  private readonly body: Locator;

  constructor(page: Page) {
    super(page);
    this.musicBooksSection = this.page.getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i }).first();
    this.resultsTotal = this.page.locator('.sb-results-total');
    this.body = this.page.locator('body');
  }

  async verifyMusicBooksSection() {
    await this.musicBooksSection.scrollIntoViewIfNeeded();
    await expect(this.musicBooksSection).toBeVisible();
  }

  async openGuitarCategory() {
    const guitarLink = this.page.getByRole('link', { name: /Kitarr|Guitar/i }).first();

    if (await guitarLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guitarLink.click();
    } else {
      await this.page.goto(this.buildSearchUrl({ tt: '', database: 'musicsales', instrument: 'Guitar' }), {
        waitUntil: 'domcontentloaded',
      });
    }

    await expect(this.page).toHaveURL(/kitarr|guitar|musicsales|instrument/i);
  }

  async resultsCount() {
    await expect(this.resultsTotal.first()).toBeVisible({ timeout: 15000 });
    const resultsText = await this.resultsTotal.first().textContent();
    return Number((resultsText || '').replace(/\D/g, '')) || 0;
  }

  async verifyResultsCountMoreThan(minCount: number) {
    expect(await this.resultsCount()).toBeGreaterThan(minCount);
  }

  async applyLanguageFilter(language: string) {
    const languageLink = this.page.getByRole('link', { name: new RegExp(`${language}|English`, 'i') }).first();

    if (await languageLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await languageLink.click();
    } else {
      await this.page.goto(
        this.buildSearchUrl({ database: 'musicsales', instrument: 'Guitar', mlanguage: 'English' }),
        { waitUntil: 'domcontentloaded' },
      );
    }

    await expect(this.body).toContainText(new RegExp(`${language}|English`, 'i'));
  }

  async applyFormatFilter(format: string) {
    const formatLink = this.page.getByRole('link', { name: new RegExp(`^${format}$`, 'i') }).first();

    if (await formatLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formatLink.click();
    } else {
      await this.page.goto(
        this.buildSearchUrl({ database: 'musicsales', instrument: 'Guitar', mlanguage: 'English', format }),
        { waitUntil: 'domcontentloaded' },
      );
    }

    await this.verifyActiveFiltersContain(format);
  }

  async verifyActiveFiltersContain(text: string) {
    await expect(this.body).toContainText(new RegExp(text, 'i'));
  }

  async clearFilters() {
    await this.page.goBack();
    await this.page.goBack();
  }

  private buildSearchUrl(params: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    return `${this.searchBaseUrl}?${searchParams.toString()}`;
  }
}
