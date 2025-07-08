//──────────────────────────────────────────────
// Кастомные фикстуры Playwright
// ──────────────────────────────────────────────
import { test as base } from '@playwright/test';
import { USERS, User } from '../fixtures/users.data';

import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import {
    CheckoutStepOnePage,
    CheckoutStepTwoPage
} from '../pages/checkout.page';

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
    user: User;                // текущий пользователь
    loginPage: LoginPage;
    invPage: InventoryPage;
    stdUser: InventoryPage;       // авторизованный standard_user
    cartPage: CartPage;
    cartWithItem: CartPage;            // корзина с 1-м товаром
    checkout1Page: CheckoutStepOnePage; // (оставил — вдруг пригодится)
    checkout2Page: CheckoutStepTwoPage; //
}

export const test = base.extend<MyFixtures>({

    /*──────── user — автоматически берём из названия теста ────────*/
    user: [async ({ }, use, info) => {
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

    /* stdUser — сразу логинит под standard_user и отдаёт InventoryPage */
    stdUser: async ({ loginPage, invPage }, use) => {
        await loginPage.login('standard_user');
        await invPage.waitLoaded(); 
        await use(invPage);
       
    },

    /* cartWithItem — кладёт 1-й товар, открывает /cart.html */
    cartWithItem: async ({ stdUser, page }, use) => {
        await stdUser.addFirstToCart().click();
        await stdUser.openCart();
        await use(new CartPage(page));
        // cleanup: Reset App State, чтобы корзина не тащилась
        await stdUser.resetAppState();
    },


    /*──────── checkout1Page ────────*/
    checkout1Page: async ({ cartWithItem, page }, use) => {
        await cartWithItem.checkout();
        await use(new CheckoutStepOnePage(page));;
    },

    /*──────── checkout2Page ────────*/
    checkout2Page: async ({ checkout1Page, page }, use) => {
        await checkout1Page.fillInfo();
        await checkout1Page.continue();
        await use(new CheckoutStepTwoPage(page))
    }
});

export { expect } from '@playwright/test';