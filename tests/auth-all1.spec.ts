import { test, expect } from '@playwright/test';

/* -------------------------------------------------------
 *  Тип, описывающий сценарий одного демо-пользователя
 * ----------------------------------------------------- */
interface UserCase {
  u: string;          // логин
  ok: boolean;        // true = ждём успешный вход
  card?: string;      // «уникальная» карточка (только при ok=true)
  err?: RegExp;       // ожидаемая ошибка (только при ok=false)
}

/* -------------------------------------------------------
 *  Данные
 * ----------------------------------------------------- */
const BASE_URL = 'https://www.saucedemo.com/';
const PASSWORD = 'secret_sauce';

/** Таблица всех пользователей и того, что мы от них ждём */
const USERS: UserCase[] = [
  { u: 'standard_user',           ok: true,  card: 'Sauce Labs Backpack'      },
  { u: 'locked_out_user',         ok: false, err: /locked out/i               },
  { u: 'problem_user',            ok: true,  card: 'Sauce Labs Bike Light'    },
  { u: 'performance_glitch_user', ok: true,  card: 'Sauce Labs Bolt T-Shirt'  },
  { u: 'error_user',              ok: true,  card: 'Sauce Labs Fleece Jacket' },
  { u: 'visual_user',             ok: true,  card: 'Sauce Labs Onesie'        },
];

/* -------------------------------------------------------
 *  Тесты
 * ----------------------------------------------------- */
test.describe('Авторизация всех демо-пользователей', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  USERS.forEach(({ u, ok, card, err }) => {
    test(`${u} → ${ok ? 'успех' : 'ошибка'}`, async ({ page }) => {
      /* ---- ввод логина и пароля ---- */
      await page.locator('[data-test="username"]').fill(u);
      await page.locator('[data-test="password"]').fill(PASSWORD);
      await page.locator('[data-test="login-button"]').click();

      /* ---- негативный сценарий ---- */
      if (!ok) {
        await expect(page.locator('[data-test="error"]')).toBeVisible();
        await expect(page.locator('[data-test="error"]'))
          .toContainText(err ?? /Epic sadface/i);
        return;                           // для заблокированного: дальше не проверяем
      }

      /* ---- успешный сценарий ---- */
      await expect(page).toHaveURL(/\/inventory\.html/);
      await expect(page.locator('[data-test="title"]'))
        .toHaveText(/Products/i);

      /* ---- проверяем «уникальную» карточку ---- */
      if (card) {
        await expect(
          page.locator('.inventory_item_name', { hasText: card })
        ).toBeVisible();
      }

      /* ---- возвращаемся на логин для следующего кейса ---- */
      await page.goto(BASE_URL);
    });
  });
});