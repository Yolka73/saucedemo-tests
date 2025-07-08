import { Page, expect } from '@playwright/test';

export class InventoryPage {
  constructor(private readonly page: Page) { }

   /** Дожидается загрузки inventory.html и первой карточки */
  async waitLoaded() {
    // 1. URL перешёл на /inventory.html
    await this.page.waitForURL(/\/inventory\.html/, { timeout: 15_000 });
    // 2. Появилась хотя бы одна карточка
    await this.items().first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  // ──  базовые элементы  ──
  title() { return this.page.locator('.title'); }
  items() { return this.page.locator('.inventory_item'); }
  firstName() { return this.page.locator('.inventory_item_name').first(); }

  // ── сортировка ──
  sortSelect() { return this.page.locator('select.product_sort_container'); }
  async sortZA() {
    await expect(this.sortSelect()).toBeVisible();
    await this.sortSelect().selectOption('za');
  }

  // ── ссылки и картинки ──
  firstCardLink() { return this.page.locator('.inventory_item a').first(); }
  firstCardImg() { return this.page.locator('.inventory_item img').first(); }

  // ── корзина ──
  addFirstToCart() { return this.page.locator('.inventory_item button').first(); }
  async openCart() { await this.page.locator('.shopping_cart_link').click(); }

  /* Бейдж-счётчик возле иконки корзины */
  badge() {
    return this.page.locator('.shopping_cart_badge');
  }

  /* Бургер-меню (три полоски) и пункт “Reset App State” */
  burger() { return this.page.locator('#react-burger-menu-btn'); }
  resetItem() { return this.page.locator('#reset_sidebar_link'); }
  async resetAppState() {
    await this.burger().click();
    await this.resetItem().click();

  }
  /** Кнопка Add/Remove по индексу карточки (0…5) */
  addToCart(n = 0) {
    return this.page.locator('.inventory_item button').nth(n);
  }
 
}
