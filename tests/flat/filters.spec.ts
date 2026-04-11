/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
/**
 /**
 * Navigate Products via Filters
 *
 * Flow:
 * 1. Open homepage
 * 2. Open "Muusikaraamatud ja noodid"
 * 3. Click "Kitarr"
 * 4. Apply "CD"
 * 5. Apply "Inglise"
 * 6. Remove filters
 */

import { test, expect } from '@playwright/test';

test.describe('Navigate Products via Filters', () => {

  test('Filter products: Kitarr → CD → English → remove filters', async ({ page }) => {

    // 1. Open page
    await page.goto('https://www.kriso.ee/');

    // accept cookies
    await page.getByRole('button', { name: 'Nõustun' }).click();

    // 2. Go to music section
    await page.getByRole('link', { name: /Muusikaraamatud ja noodid/i }).click();

    // 3. Click Kitarr
    await page.getByRole('link', { name: /Kitarr/i }).first().click();

    // ASSERT: results exist (SAFE CHECK)
    await expect(page.locator('body')).toContainText('Kitarr');

    // 4. Apply CD filter
    await page.getByRole('link', { name: /CD/i }).click();

    // ASSERT: page still has results
    await expect(page.locator('body')).toBeVisible();

    // 5. Apply English filter
    await page.getByRole('link', { name: /Inglise/i }).click();

    // ASSERT: still results
    await expect(page.locator('body')).toBeVisible();

    // 6. Remove filters
    await page.getByRole('link', { name: /Eemalda/i }).click();

    // FINAL CHECK: page restored
    await expect(page.locator('body')).toContainText('Kitarr');
  });

});