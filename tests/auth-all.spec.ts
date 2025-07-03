// tests/auth-dom.spec.ts
// ╔══════════════════════════════════════════════════════════════════════╗
// ║   SAUCE DEMO · data‑driven проверка 6 демо‑аккаунтов (v2025‑07)     ║
// ║   Подробные комментарии: каждая строка объясняет, зачем она нужна.  ║
// ╚══════════════════════════════════════════════════════════════════════╝
//
// Баги, заложенные разработчиками сайта:
// ────────────────────────────────────────────────────────────────────────────
//  standard_user            ➜ happy‑path, всё работает
//  problem_user             ➜ у первой карточки отсутствует <a> или href="#"
//  visual_user              ➜ у первой карточки картинка‑«собака» sl‑404.jpg
//  performance_glitch_user  ➜ после сортировки Z‑A порядок не меняется
//  error_user               ➜ checkout зависает, нет redirect на /checkout-complete
//  locked_out_user          ➜ форма логина показывает ошибку «locked out»
//
// Задача: подтвердить, что каждый персонаж авторизируется и демонстрирует «свой» дефект,
// а базовый функционал (кол-во товаров, заголовок) остаётся корректным.
//

import { test, expect } from '@playwright/test';
/*─────────────────────────────────────────────────────────────────────────────
  1. Константы окружения
  ───────────────────────────────────────────────────────────────────────────*/
const BASE_URL = 'https://www.saucedemo.com/';
const PASSWORD = 'secret_sauce';

/*───────────────────────────────────────────────────────────────────────────
  2. Матрица сценариев
     — login        → имя учётки
     — shouldPass   → true если должен попасть на /inventory.html
     — tag          → ключевое слово для switch-case ниже
  ──────────────────────────────────────────────────────────────────────────*/
const USERS = [
  { login: 'standard_user', shouldPass: true, tag: 'baseline' },
  { login: 'locked_out_user', shouldPass: false, tag: 'locked' },
  { login: 'problem_user', shouldPass: true, tag: 'problem' },
  { login: 'performance_glitch_user', shouldPass: true, tag: 'performance' },
  { login: 'error_user', shouldPass: true, tag: 'error' },
  { login: 'visual_user', shouldPass: true, tag: 'visual' },
];
/*───────────────────────────────────────────────────────────────────────────
  3. Настройка Playwright
     navigationTimeout = 60 c — чтобы долгие CI не заваливались
  ──────────────────────────────────────────────────────────────────────────*/
test.use({ navigationTimeout: 60_000 });
/*─────────────────────────────────────────────────────────────────────────────
  4. Основная test‑suite
  ───────────────────────────────────────────────────────────────────────────*/
test.describe('Авторизация + фирменные баги inventory.html', () => {
  // beforeEach: каждый тест стартует с формы логина  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });
  // Генерируем один test() на каждого пользователя
  for (const { login, shouldPass, tag } of USERS) {
    test(`${login} ⇒ ${tag}`, async ({ page }) => {
      /* 4.1  Логинимся */
      await page.locator('[data-test="username"]').fill(login);
      await page.locator('[data-test="password"]').fill(PASSWORD);
      await page.locator('[data-test="login-button"]').click();

      /* 4.2  Негативный сценарий для locked_out_user */
      if (!shouldPass) {
        await expect(page.locator('[data-test="error"]')).toContainText(/locked out/i);
        return;
      }

      /* 4.3  Общие happy‑path проверки */
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator('.title')).toHaveText('Products');
      await expect(page.locator('.inventory_item')).toHaveCount(6);

      /* 4.4  Идивидуальные сценарии */
      switch (tag) {
        /* ─── baseline: сортировка меняет порядок ─── */
        case 'baseline': {
          const firstBefore = await page.locator('.inventory_item_name').first().innerText();

          const sortSelect = page.locator('select.product_sort_container');
          await sortSelect.waitFor({ state: 'attached', timeout: 25_000 });
          await expect(sortSelect).toBeVisible();
          await sortSelect.selectOption('za', { timeout: 15_000 });

          await expect(page.locator('.inventory_item_name').first())
            .not.toHaveText(firstBefore, { timeout: 5_000 });
          break;
        }

        /* ─── problem_user: первая ссылка сломана ─── */

        case 'problem': {
          // У проблемного юзера ссылка у первой карточки либо отсутствует,
          // либо имеет href="#". Проверяем оба варианта.
          const links = page.locator('.inventory_item a.inventory_item_img');
          if (await links.count() === 0) {
            expect(true).toBe(true); // ссылка отсутствует → баг подтверждён
          } else {
            const href = await links.first().getAttribute('href');
            expect(href).toBe('#');
          }
          break;
        }

        /* ─── visual_user: картинка-собака ─── */
        case 'visual': {
          // Проверяем, что у первой карточки подменённая картинка (sl-404...)  
          await expect(
            page.locator('.inventory_item img').first()
          ).toHaveAttribute('src', /sl-404/i, { timeout: 10_000 });
          break;
        }

        /* ─── performance_glitch_user: сортировка не меняет порядок ─── */
        case 'performance': {
          // UI не перерисуется после сортировки — первый элемент не изменится

          // фиксируем имя и стартовый тайм-штамп
          const firstBefore = await page.locator('.inventory_item_name').first().innerText();
          const t0 = Date.now();

          // выбираем сортировку Z → A (selectOption сам подождёт ready-state)
          const sortSelect = page.locator('select.product_sort_container');
          await sortSelect.selectOption('za');

          // ждём, пока первый элемент действительно СТАНЕТ другим
          await expect(page.locator('.inventory_item_name').first())
            .not.toHaveText(firstBefore, { timeout: 20_000 });

          // меряем, сколько это заняло
          const delta = Date.now() - t0;
          console.log(`⏱ Смена порядка заняла ${delta} мс`);

          // «Баг» подтверждён, если UI думает > 3000 мс
          expect(delta).toBeGreaterThan(3000);
          break;
        }
        /* ─── error_user: Finish не переходит на complete ─── */
        case 'error': {
          // Добавляем товар и запускаем процедуру оформления заказа.
          await page.locator('.inventory_item button').first().click();
          await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
          await page.locator('.shopping_cart_link').click();
          await page.locator('[data-test="checkout"]').click();
          // Проходим шаги Checkout до Finish
          await page.fill('[data-test="firstName"]', 'QA');
          await page.fill('[data-test="lastName"]', 'Engineer');
          await page.fill('[data-test="postalCode"]', '12345');
          await page.locator('[data-test="continue"]').click();
          // Нажимаем Finish
          await page.locator('[data-test="finish"]').click();
          // Проверяем, что НЕ произошло редиректа на /checkout-complete.html
          await expect(page).not.toHaveURL(/checkout-complete\.html/, { timeout: 7_000 });
          break;
        }
      }

      /* возврат на логин */
      await page.goto(BASE_URL);
    });
  }
});
