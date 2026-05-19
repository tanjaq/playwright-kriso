/**
 * Part I - Flat tests (no POM)
 * Test suite: Search for Books by Keywords
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

async function searchFor(keyword: string) {
  const preferredInput = page
    .getByRole('textbox', { name: /Pealkiri|Title|ISBN|märksõna|keyword/i })
    .first();
  const input = (await preferredInput.isVisible().catch(() => false))
    ? preferredInput
    : page.getByRole('textbox').first();

  await input.fill(keyword);

  const searchButton = page.getByRole('button', { name: /Search|Otsi/i }).first();
  if (await searchButton.isVisible().catch(() => false)) {
    await searchButton.click();
  } else {
    await input.press('Enter');
  }
}

async function resultsCount() {
  const resultsText = await page.locator('.sb-results-total').first().textContent();
  return Number((resultsText || '').replace(/\D/g, '')) || 0;
}

test.describe('Search for Books by Keywords', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('/');
    await acceptCookies(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: /Kriso/i }).first()).toBeVisible();
  });

  test('Test no products found', async () => {
    await searchFor('xqzwmfkj');

    await expect(page.locator('.msg.msg-info')).toContainText(/ei leitud|did not find any match/i);
  });

  test('Test search results contain keyword', async () => {
    await searchFor('tolkien');

    expect(await resultsCount()).toBeGreaterThan(1);
    expect(await page.getByRole('link', { name: /tolkien/i }).count()).toBeGreaterThan(1);
    await expect(page.locator('body')).toContainText(/tolkien/i);
  });

  test('Test search by ISBN', async () => {
    await searchFor('9780307588371');

    await expect(page.getByRole('link', { name: /gone girl/i }).first()).toBeVisible();
    await expect(page.getByText('9780307588371').first()).toBeVisible();
  });
});
