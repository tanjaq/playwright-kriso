import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';

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

test.describe('Search for Books by Keywords (POM)', () => {
  test('search by missing keyword, author and ISBN', async () => {
    await home.verifyLogo();
    await home.searchByKeyword('xqzwmfkj');
    await home.verifyNoProductsFoundMessage();
    await home.searchByKeyword('tolkien');
    await home.verifySearchResults('tolkien');
    await home.searchByKeyword('9780307588371');
    const product = new ProductPage(page);
    await product.verifyBook('Gone Girl', '9780307588371');
  });
});
