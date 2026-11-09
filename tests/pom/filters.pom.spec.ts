import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe.configure({ mode: 'serial' });
let page: Page;
let home: HomePage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  home = new HomePage(page);
  await home.openUrl();
});

test.afterAll(async () => {
  await page.context().close();
});

test.describe('Navigate Products via Filters (POM)', () => {
  test('apply guitar, English and CD filters, then clear them', async () => {
    await home.verifyLogo();
    await home.openMusicCategory();
    const guitar = await home.getResultsCount();
    expect(guitar).toBeGreaterThan(1);
    await home.filterByEnglish();
    const english = await home.getResultsCount();
    expect(english).toBeLessThan(guitar);
    await home.filterByCd();
    const cd = await home.getResultsCount();
    expect(cd).toBeLessThan(english);
    await home.clearFilters();
    expect(await home.getResultsCount()).toBeGreaterThan(cd);
  });
});
