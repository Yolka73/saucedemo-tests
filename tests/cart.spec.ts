import { test, expect } from '../fixtures/fixtures';
import { CartPage } from '../pages/cart.page';
import { CheckoutStepOnePage, CheckoutStepTwoPage } from '../pages/checkout.page';

test.use({ navigationTimeout: 60_000 });

test.describe('Корзина — smoke-набор', () => {

    /* 1. Add → бейдж + кнопка Remove */
    test('Add to cart увеличивает бейдж', async ({ stdUser }) => {
        const addBtn = stdUser.addFirstToCart();
        await addBtn.click();
        await expect(addBtn).toHaveText(/Remove/i);
        await expect(stdUser.badge()).toHaveText('1');
    });

    /* 2. Remove → бейдж исчезает */
    test('Remove уменьшает бейдж', async ({ stdUser }) => {
        const btn = stdUser.addFirstToCart();
        await btn.click();          // +1
        await btn.click();          // Remove
        await expect(stdUser.badge()).toHaveCount(0);
    });

    /* 3. Бейдж сохраняется при навигации */
    test('Бейдж переживает переходы', async ({ stdUser, page }) => {
        await stdUser.addFirstToCart().click();
        await stdUser.firstCardLink().click();  // item details
        await page.goBack();
        await expect(stdUser.badge()).toHaveText('1');
    });
 
    /* 4. Проверка сумм на Overview */
    test('Суммы Item / Tax / Total корректны', async ({ stdUser, page }) => {
        // добавляем два товара
        await stdUser.addFirstToCart().click();
        await stdUser.addToCart(1).click();

        await stdUser.openCart();
        const cart = new CartPage(page);
        await cart.checkout();

        const step1 = new CheckoutStepOnePage(page);
        await step1.fillInfo();
        await step1.continue();

        const step2 = new CheckoutStepTwoPage(page);  // только для ожидания DOM

        // собираем цены
        const nums = (txt: string) => Number(txt.replace(/[^0-9.]/g, ''));
        const itemSum = (await cart.itemPrices().allTextContents())
            .map(nums)
            .reduce((a, b) => a + b, 0);

        const uiItem = nums(await cart.itemTotal().textContent() || '');
        const uiTax = nums(await cart.taxTotal().textContent() || '');
        const uiTotal = nums(await cart.grandTotal().textContent() || '');

        expect(uiItem).toBeCloseTo(itemSum, 2);
        expect(uiTotal).toBeCloseTo(uiItem + uiTax, 2);
    });

    /* 5. Reset App State очищает корзину */
    test('Reset App State сбрасывает бейдж', async ({ stdUser }) => {
        await stdUser.addFirstToCart().click();
        await expect(stdUser.badge()).toHaveText('1');
        await stdUser.resetAppState();
        await expect(stdUser.badge()).toHaveCount(0);
    });
});