import { Page, expect } from '@playwright/test';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  // ──  базовые элементы  ──
  title()       { return this.page.locator('.title'); }
  items()       { return this.page.locator('.inventory_item'); }
  firstName()   { return this.page.locator('.inventory_item_name').first(); }

  // ── сортировка ──
  sortSelect()  { return this.page.locator('select.product_sort_container'); }
  async sortZA() {
    await expect(this.sortSelect()).toBeVisible();
    await this.sortSelect().selectOption('za');
  }

  // ── ссылки и картинки ──
  firstCardLink() { return this.page.locator('.inventory_item a.inventory_item_img').first(); }
  firstCardImg()  { return this.page.locator('.inventory_item img').first(); }

  // ── корзина ──
  addFirstToCart() { return this.page.locator('.inventory_item button').first(); }
  async openCart() { await this.page.locator('.shopping_cart_link').click(); }
}
