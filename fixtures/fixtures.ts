//──────────────────────────────────────────────
// Кастомные фикстуры Playwright
// ──────────────────────────────────────────────
import { test as base } from '@playwright/test';
import { USERS } from './users.data';

import { LoginPage }           from '../pages/login.page';
import { InventoryPage }       from '../pages/inventory.page';
import { CartPage }            from '../pages/cart.page';
import { CheckoutStepOnePage,
         CheckoutStepTwoPage } from '../pages/checkout.page';

/*--------------------------------------------------
  Мапа "login → объект" — быстрый поиск по имени
--------------------------------------------------*/
const USERS_MAP = Object.fromEntries(
  USERS.map(u => [u.login, u] as const)
);

/*--------------------------------------------------
  Типы кастомных фикстур
--------------------------------------------------*/
interface MyFixtures {
  user:           typeof USERS[number];   // ← НОВОЕ
  loginPage:      LoginPage;
  invPage:        InventoryPage;
  cartPage:       CartPage;
  checkout1Page:  CheckoutStepOnePage;
  checkout2Page:  CheckoutStepTwoPage;
}

export const test = base.extend<MyFixtures>({

  /*──────── user — автоматически берём из названия теста ────────*/
  user: [async ({}, use, info) => {
    // Title вида "standard_user ⇒ baseline"
    const login = info.title.split(' ')[0];
    await use(USERS_MAP[login as keyof typeof USERS_MAP]);
  }, { auto: true }],

  /*──────── loginPage (открывает /) ────────*/
  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.goto();
    await use(lp);
  },

  /*──────── invPage ────────*/
  invPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  /*──────── cartPage: +1 товар и открыт Cart ────────*/
  cartPage: async ({ invPage, page }, use) => {
    await invPage.addFirstToCart().click();
    await invPage.openCart();
    await use(new CartPage(page));
  },

  /*──────── checkout1Page ────────*/
  checkout1Page: async ({ cartPage, page }, use) => {
    await cartPage.checkout();
    await use(new CheckoutStepOnePage(page));
  },

  /*──────── checkout2Page ────────*/
  checkout2Page: async ({ checkout1Page, page }, use) => {
    await checkout1Page.fillInfo();
    await checkout1Page.continue();
    await use(new CheckoutStepTwoPage(page));
  }
});

export { expect } from '@playwright/test';