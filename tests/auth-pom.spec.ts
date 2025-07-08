import { test, expect } from '../fixtures/fixtures';
import { USERS }        from '../fixtures/users.data';
//import { LoginPage } from '../pages/login.page';
//import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import {  CheckoutStepOnePage,
         CheckoutStepTwoPage} from '../pages/checkout.page';


test.use({ navigationTimeout: 60_000 });

test.describe('POM-спецификация+фикстуры: авторизация + фирменные баги', () => {
  for (const u of USERS) {
    test(`${u.login} ⇒ ${u.tag}`, async ({
      user,               // ← готовый объект { login, ok, tag }
      loginPage,
      invPage,
      page
    }) => {
      /* ─────────────────── 1. Логинимся через loginPage ─────────────────── */
      await loginPage.login(user.login);

      // Заблокированный юзер: проверяем баннер и выходим
      if (!user.ok) {
        await expect(loginPage.error()).toContainText(/locked out/i);
        return;
      }

      /* ───────────────────────── 2. Страница товаров ─────────────────── */
      //const inv = new InventoryPage(page);
      await expect(invPage.title()).toHaveText('Products');   // sanity‑check UI
      await expect(invPage.items()).toHaveCount(6);           // ровно 6 карточек

      /* ────────── 3. Switch‑case: «фирменные» дефекты ────────── */
      switch (user.tag) {
        /* baseline: сортировка должна реально менять порядок */
        case 'baseline': {
          const before = await invPage.firstName().innerText(); // A→Z топ‑товар
          await invPage.sortZA();                               // Z→A
          await expect(invPage.firstName())                     // порядок ДОЛЖЕН
            .not.toHaveText(before);                        // измениться
          break;
        }

        /* problem_user: сломанная ссылка у первой карточки */
        case 'problem': {
          const link = invPage.firstCardLink();
          if (await link.count() === 0) {
            expect(true).toBe(true);                       // <a> отсутствует
          } else {
            expect(await link.getAttribute('href')).toBe('#'); // href="#"
          }
          break;
        }

        /* visual_user: картинка‑собака (404) */
        case 'visual': {
          await expect(invPage.firstCardImg())
            .toHaveAttribute('src', /sl-404/i);
          break;
        }

        /* performance_glitch_user: UI долго перерисовывается */
        case 'performance': {
          const before = await invPage.firstName().innerText();
          const start = Date.now();
          await invPage.sortZA();                               
          // Проверяем, что сортировка работает медленно, но корректно
          await expect(invPage.firstName())                     // ждём смены
            .not.toHaveText(before, { timeout: 20_000 });
          const delay = Date.now() - start;
          console.log(`⏱ delay = ${delay} ms`);
          expect(delay).toBeGreaterThan(3000);              // >3с → баг док‑ся
          break;
        }

        /* error_user: Finish не ведёт к /checkout-complete.html */
        case 'error': {
        await invPage.addFirstToCart().click();
          await invPage.openCart();
          const cartPage = new CartPage(page);

          /* 2. Checkout → Step-1 → Step-2 */
          await cartPage.checkout();
          const step1 = new CheckoutStepOnePage(page);
          await step1.fillInfo();
          await step1.continue();

          const step2 = new CheckoutStepTwoPage(page);
          await step2.finish();

          /* 3. баг: нет редиректа на /checkout-complete.html */
          await expect(page).not.toHaveURL(/checkout-complete\.html/);
          break;
        }
      }
    });
  }
});
