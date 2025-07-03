import { Page } from '@playwright/test';

/**
 * Page Object для формы логина.
 * Храним только публичные методы (goto, login) + локатор ошибки.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  /** Переходим на базовый URL */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  /** Авторизуемся под указанным пользователем */
  async login(user: string, pass = 'secret_sauce') {
    await this.page.getByTestId('username').fill(user);
    await this.page.getByTestId('password').fill(pass);
    await this.page.getByTestId('login-button').click();
  }

  /** Лентяйский геттер: баннер error */
  error() {
    return this.page.getByTestId('error');
  }
}