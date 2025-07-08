import { Page } from '@playwright/test';
/** Простейший объект корзины: всего один action — Checkout  */
export class CartPage {
  constructor(private readonly page: Page) {}
  checkoutBtn() { return this.page.locator('[data-test="checkout"]'); }
  async checkout() { await this.checkoutBtn().click(); }
}
