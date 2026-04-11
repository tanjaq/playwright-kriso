import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {

  readonly musicCategory: Locator;
  readonly kitarr: Locator;
  readonly cdFilter: Locator;
  readonly englishFilter: Locator;
  readonly removeFilters: Locator;
  private readonly url = 'https://www.kriso.ee/';

  constructor(page: Page) {
    super(page);

    this.musicCategory = page.getByRole('link', { name: /Muusikaraamatud ja noodid/i });
    this.kitarr = page.getByRole('link', { name: 'Kitarr' });
    this.cdFilter = page.getByRole('link', { name: /CD/i });
    this.englishFilter = page.getByRole('link', { name: /Inglise/i });
    this.removeFilters = page.getByRole('link', { name: /Eemalda/i });
  }

  async openUrl() {
    await this.page.goto(this.url);
  }

  // TODO: define locators and implement action methods
  async openMusicCategory() {
    await this.musicCategory.click();
  }

  async clickKitarr() {
  await this.kitarr.click();
}

  async applyCD() {
    await this.cdFilter.click();
  }

  async applyEnglish() {
    await this.englishFilter.click();
  }

  async removeFiltersClick() {
    await this.removeFilters.click();
  }
  
}
