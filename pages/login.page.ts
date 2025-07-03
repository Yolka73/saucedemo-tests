import { Page } from '@playwright/test';

/**
 * Page Object для формы логина.
 * Храним только публичные методы (goto, login) + локатор ошибки.*/
export class LoginPage {
  constructor(private readonly page: Page) {}

  /** Переходим на базовый URL */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  /** Авторизуемся под указанным пользователем */
  async login(user: string, pass = 'secret_sauce') {
    await this.page.locator('[data-test="username"]').fill(user);
    await this.page.locator('[data-test="password"]').fill(pass);
    await this.page.locator('[data-test="login-button"]').click();
  }

  /** Лентяйский геттер: баннер error */
  error() {
    return this.page.locator('[data-test="error"]');
  }
}