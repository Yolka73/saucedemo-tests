// import { test, expect } from '@playwright/test';

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
await page.goto('https://demo.playwright.dev/todomvc/#/');
});

test('Add new task "First task"', async ({ page }) => { 
   
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('First task'); 
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter'); 

  await expect(page.getByTestId('todo-title')).toBeVisible(); 
  await expect(page.getByTestId('todo-title')).toHaveText('First task'); });

test('Add new task "Task"', async ({ page }) => { 
  
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Task'); 
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter'); 

  await expect(page.getByTestId('todo-title')).toBeVisible(); 
  await expect(page.getByTestId('todo-title')).toContainText('Task'); });

  