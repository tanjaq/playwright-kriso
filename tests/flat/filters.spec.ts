/**
 * Part I - Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

async function acceptCookies(page: Page) {
  const consentButton = page.getByRole('button', { name: /Nõustun|Accept|I agree/i });

  if (await consentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await consentButton.click();
  }
}

async function resultsCount() {
  const resultsText = await page.locator('.sb-results-total').first().textContent();
  return Number((resultsText || '').replace(/\D/g, '')) || 0;
}

test.describe('Navigate Products via Filters', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('/');
    await acceptCookies(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Navigate and filter products', async () => {
    test.setTimeout(90000);

    await expect(page.getByRole('link', { name: /Kriso/i }).first()).toBeVisible();

    const musicBooksLink = page
      .getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i })
      .first();
    await musicBooksLink.scrollIntoViewIfNeeded();
    await expect(musicBooksLink).toBeVisible();
    await musicBooksLink.click();

    await page.getByRole('link', { name: /Kitarr|Guitar/i }).first().click();

    const guitarCount = await resultsCount();
    expect(guitarCount).toBeGreaterThan(1);
    await expect(page).toHaveURL(/kitarr|guitar|muusika|musicsales/i);

    await page.getByRole('link', { name: /Inglise|English/i }).first().click();
    const englishCount = await resultsCount();
    expect(englishCount).toBeGreaterThan(0);
    expect(englishCount).toBeLessThan(guitarCount);
    await expect(page.locator('body')).toContainText(/Inglise|English/i);

    const cdLink = page.getByRole('link', { name: /^CD$/i }).first();

    if (await cdLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cdLink.click();
    } else {
      await page.goto('/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English&format=CD');
    }

    const cdCount = await resultsCount();
    expect(cdCount).toBeGreaterThan(0);
    expect(cdCount).toBeLessThanOrEqual(englishCount);
    await expect(page.locator('body')).toContainText(/CD/i);

    await page.goBack();
    await page.goBack();

    const afterRemoveCount = await resultsCount();
    expect(afterRemoveCount).toBeGreaterThanOrEqual(cdCount);
  });
});
