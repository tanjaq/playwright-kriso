import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  async verifyBook(title: string, isbn: string) {
    await expect(this.page.getByRole('heading', { name: new RegExp(title, 'i') }).first()).toBeVisible();
    await expect(this.page.getByText(new RegExp('ISBN-13:.*' + isbn)).first()).toBeVisible();
  }
}
