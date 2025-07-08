import { Page } from '@playwright/test';
/** Простейший объект корзины: всего один action — Checkout  */
export class CartPage {
  constructor(private readonly page: Page) { }
  checkoutBtn() { return this.page.locator('[data-test="checkout"]'); }
  async checkout() { await this.checkoutBtn().click(); }
  itemPrices() { // все цены строкой «$29.99»
    return this.page.locator('.inventory_item_price');
  }
  itemTotal() { return this.page.locator('.summary_subtotal_label'); } // “Item total: $29.99”
  taxTotal() { return this.page.locator('.summary_tax_label'); }      // “Tax: $2.40”
  grandTotal() { return this.page.locator('.summary_total_label'); }    // “Total: $32.39”
}
