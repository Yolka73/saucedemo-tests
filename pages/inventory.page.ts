import { Page, expect } from '@playwright/test';

/**
 * Page Object списка товаров.
 * Отдельные методы-обёртки позволяют переиспользовать логику в разных спеках.
 */
export class InventoryPage {
  constructor(private readonly page: Page) {}

  // ── базовые элементы ──
  title()     { return this.page.getByTestId('title'); }
  items()     { return this.page.locator('.inventory_item'); }
  firstName() { return this.page.locator('.inventory_item_name').first(); }

  // ── сортировка ──
  sortSelect() { return this.page.locator('select.product_sort_container'); }
  /** Сортировка по имени Z→A */
  async sortZA() {
    await expect(this.sortSelect()).toBeVisible();      // ждём рендер
    await this.sortSelect().selectOption('za');         // value="za"
  }

  // ── ссылки/картинки ──
  firstCardLink() { return this.page.locator('.inventory_item a.inventory_item_img').first(); }
  firstCardImg()  { return this.page.locator('.inventory_item img').first(); }

  // ── корзина ──
  addFirstToCart() { return this.page.locator('.inventory_item button').first(); }
  async openCart() { await this.page.locator('.shopping_cart_link').click(); }
}
