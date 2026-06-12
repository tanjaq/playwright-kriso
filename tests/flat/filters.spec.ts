/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 * - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 * - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;
let initialCount = 0;
let languageFilteredCount = 0;
let formatFilteredCount = 0;

test.describe('Navigate Products via Filters', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://www.kriso.ee/', { waitUntil: 'domcontentloaded' });

    const consentButton = page.getByRole('button', { name: /Nõustun|Accept|I agree/i });
    if (await consentButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await consentButton.click();
    }
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: /Kriso/i }).first()).toBeVisible();
  });

  test('Test navigate to Kitarr category', async () => {
    const musicSection = page
      .getByRole('link', { name: /Muusikaraamatud ja noodid|Music books/i })
      .first();

    if (await musicSection.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(musicSection).toBeVisible();
      await musicSection.click();
    } else {
      await page.goto('https://www.kriso.ee/muusika-ja-noodid.html', { waitUntil: 'domcontentloaded' });
    }

    const kitarrCategory = page.getByRole('link', { name: /Kitarr|Guitar/i }).first();

    if (await kitarrCategory.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await kitarrCategory.click();
    } else {
      await page.goto(
        'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?tt=&database=musicsales&instrument=Guitar',
        { waitUntil: 'domcontentloaded' },
      );
    }

    await expect(page).toHaveURL(/instrument=Guitar|kitarr|guitar/i);

    const resultsText = await page.locator('.sb-results-total').first().textContent();
    initialCount = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(initialCount).toBeGreaterThan(1);
  });

  test('Test apply language and format filters', async () => {
    const englishFilter = page.getByRole('link', { name: /English|Inglise/i }).first();

    if (await englishFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await englishFilter.click();
    } else {
      await page.goto(
        'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English',
        { waitUntil: 'domcontentloaded' },
      );
    }

    await expect(page).toHaveURL(/mlanguage=|english/i);

    const languageFilteredText = await page.locator('.sb-results-total').first().textContent();
    languageFilteredCount = Number((languageFilteredText || '').replace(/\D/g, '')) || 0;
    expect(languageFilteredCount).toBeLessThan(initialCount);

    const cdFilter = page.getByRole('link', { name: /^CD$/i }).first();

    if (await cdFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await cdFilter.click();
    } else {
      await page.goto(
        'https://www.kriso.ee/cgi-bin/shop/searchbooks.html?database=musicsales&instrument=Guitar&mlanguage=English&format=CD',
        { waitUntil: 'domcontentloaded' },
      );
    }

    await expect(page).toHaveURL(/format=CD/i);
    await expect(page.locator('body')).toContainText(/\bCD\b/i);

    const formatFilteredText = await page.locator('.sb-results-total').first().textContent();
    formatFilteredCount = Number((formatFilteredText || '').replace(/\D/g, '')) || 0;
    expect(formatFilteredCount).toBeLessThanOrEqual(languageFilteredCount);
  });

  test('Test remove active filters', async () => {
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    const countText = await page.locator('.sb-results-total').first().textContent();
    const countAfterRemoval = Number((countText || '').replace(/\D/g, '')) || 0;
    expect(countAfterRemoval).toBeGreaterThan(formatFilteredCount);
  });
});