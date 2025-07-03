import { Page } from '@playwright/test';

/** Step‑1 формы Checkout  */
export class CheckoutStepOnePage {
  constructor(private readonly page: Page) {}

  /** Заполняем все mandatory‑поля */
  async fillInfo(first = 'QA', last = 'Engineer', zip = '12345') {
    await this.page.fill('[data-test="firstName"]', first);
    await this.page.fill('[data-test="lastName"]',  last);
    await this.page.fill('[data-test="postalCode"]', zip);
  }
  async continue() {
    await this.page.locator('[data-test="continue"]').click();
  }
}

/** Step‑2 (Overview) */
export class CheckoutStepTwoPage {
  constructor(private readonly page: Page) {}
  async finish() {
    await this.page.locator('[data-test="finish"]').click();
  }
}
