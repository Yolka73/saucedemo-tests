import { Page } from '@playwright/test';
/** Простейший объект корзины: всего один action — Checkout  */
export class CartPage {
  constructor(private readonly page: Page) {}
  async checkout() {
    await this.page.locator('[data-test="checkout"]').click();
  }
}
