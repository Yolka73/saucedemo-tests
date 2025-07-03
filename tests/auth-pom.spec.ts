import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import {
  CheckoutStepOnePage,
  CheckoutStepTwoPage
} from '../pages/checkout.page';

/** Матрица сценариев: кто и какой «баг» должен показать  */
const USERS = [
  { login: 'standard_user', ok: true, tag: 'baseline' },
  { login: 'locked_out_user', ok: false, tag: 'locked' },
  { login: 'problem_user', ok: true, tag: 'problem' },
  { login: 'performance_glitch_user', ok: true, tag: 'performance' },
  { login: 'error_user', ok: true, tag: 'error' },
  { login: 'visual_user', ok: true, tag: 'visual' },
];

test.use({ navigationTimeout: 60_000 });

test.describe('POM-спецификация: авторизация + фирменные баги', () => {
  for (const { login, ok, tag } of USERS) {
    test(`${login} ⇒ ${tag}`, async ({ page }) => {
      /* ───────────────────────── 1. Логируемся ───────────────────────── */
      const loginPage = new LoginPage(page);
      await loginPage.goto();              // открываем /
      await loginPage.login(login);        // вводим креды

      // Заблокированный юзер: проверяем баннер и выходим
      if (!ok) {
        await expect(loginPage.error()).toContainText(/locked out/i);
        return;
      }

      /* ───────────────────────── 2. Страница товаров ─────────────────── */
      const inv = new InventoryPage(page);
      await expect(inv.title()).toHaveText('Products');   // sanity‑check UI
      await expect(inv.items()).toHaveCount(6);           // ровно 6 карточек

      /* ────────── 3. Switch‑case: «фирменные» дефекты ────────── */
      switch (tag) {
        /* baseline: сортировка должна реально менять порядок */
        case 'baseline': {
          const before = await inv.firstName().innerText(); // A→Z топ‑товар
          await inv.sortZA();                               // Z→A
          await expect(inv.firstName())                     // порядок ДОЛЖЕН
            .not.toHaveText(before);                        // измениться
          break;
        }

        /* problem_user: сломанная ссылка у первой карточки */
        case 'problem': {
          const link = inv.firstCardLink();
          if (await link.count() === 0) {
            expect(true).toBe(true);                       // <a> отсутствует
          } else {
            expect(await link.getAttribute('href')).toBe('#'); // href="#"
          }
          break;
        }

        /* visual_user: картинка‑собака (404) */
        case 'visual': {
          await expect(inv.firstCardImg())
            .toHaveAttribute('src', /sl-404/i);
          break;
        }

        /* performance_glitch_user: UI долго перерисовывается */
        case 'performance': {
          const before = await inv.firstName().innerText();
          const start = Date.now();
          await inv.sortZA();                               // триггер «лаг»
          await expect(inv.firstName())                     // ждём смены
            .not.toHaveText(before, { timeout: 20_000 });
          const delay = Date.now() - start;
          console.log(`⏱ delay = ${delay} ms`);
          expect(delay).toBeGreaterThan(3000);              // >3с → баг док‑ся
          break;
        }

        /* error_user: Finish не ведёт к /checkout-complete.html */
        case 'error': {
          await inv.addFirstToCart().click(); // товар в корзину
          await inv.openCart();               // переходим в Cart

          const cart = new CartPage(page);
          await cart.checkout();              // Checkout → Step‑1

          const step1 = new CheckoutStepOnePage(page);
          await step1.fillInfo();             // вводим valid‑данные
          await step1.continue();             // Continue → Step‑2

          const step2 = new CheckoutStepTwoPage(page);
          await step2.finish();               // Finish — должен упасть

          await expect(page)                  // проверяем, что НЕ /complete
            .not.toHaveURL(/checkout-complete\.html/);
          break;
        }
      }
    });
  }
});
