import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
await page.goto('https://www.saucedemo.com/');
});

test('Authorization with correct login and password', async ({ page }) => {
  const userName = 'standard_user';
  const Password = 'secret_sauce';
//Steps 1
    await page.locator('[data-test="username"]').fill(userName);
    await page.locator('[data-test="password"]').fill(Password);
//Checking results
    await expect(page.locator('[data-test="username"]')).toHaveValue(userName);
    await expect(page.locator('[data-test="password"]')).toHaveValue(Password);
//Step 2
    await page.locator('[data-test="login-button"]').click();
//Checking results
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
    await expect(page.locator('[data-test="inventory-list"] div').filter({ hasText: 'Sauce Labs Backpackcarry.' }).nth(1)).toBeVisible();
  
});

test('Authorization with incorrect login and password', async ({ page }) => {
  const userName = 'standart_user';
  const Password = 'secretsauce';
//Steps 1
    await page.locator('[data-test="username"]').fill(userName);
    await page.locator('[data-test="password"]').fill(Password);
//Checking results
    await expect(page.locator('[data-test="username"]')).toHaveValue(userName);
    await expect(page.locator('[data-test="password"]')).toHaveValue(Password);
//Step 2
    await page.locator('[data-test="login-button"]').click();
//Checking results
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username and password do not match any user in this service');
  
});