import { Page } from '@playwright/test';
/** Простейший объект корзины: всего один action — Checkout */
export class CartPage {
  constructor(private readonly page: Page) {}
  async checkout() {
    await this.page.getByTestId('checkout').click();
  }
}
