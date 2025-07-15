import { test, expect } from '@playwright/test';
import { login } from '../helpers/login.js';
import { validUser } from '../helpers/credentials.js';
import { paymetnCredentials } from '../helpers/paymentInfo.js';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page, validUser);
});

test('Add item to cart', async ({ page }) => {

    const backpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(backpackButton).toBeVisible();
    await backpackButton.click();

    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
});


test('Verify cart contains selected item', async ({ page }) => {

    const firstItem = page.locator('[data-test="inventory-item"]').first();
    const firstItemName = await firstItem.locator('[data-test="inventory-item-name"]').textContent();
    const addToCartBtn = firstItem.locator('button:has-text("Add to cart")');

    await addToCartBtn.click();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('/cart.html');

    await expect(page.locator('[data-test="cart-list"]')).toBeVisible();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);

    const cartItemName = await page.locator('[data-test="inventory-item-name"]').textContent();
    expect(cartItemName?.trim()).toBe(firstItemName?.trim());

    const removeBtn = page.locator('button:has-text("Remove")');
    await expect(removeBtn).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
});

test('Complete checkout process', async ({ page }) => {

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('/cart.html');

    await page.locator('[data-test="checkout"]').click();
    await expect(page.locator('form')).toBeVisible();

    await page.locator('[data-test="firstName"]').fill(paymetnCredentials.firstName);
    await page.locator('[data-test="lastName"]').fill(paymetnCredentials.lastName);
    await page.locator('[data-test="postalCode"]').fill(paymetnCredentials.postalCode);

    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL('/checkout-step-two.html');

    const itemPriceText = await page.locator('[data-test="inventory-item-price"]').first().textContent();
    const itemPrice = parseFloat(itemPriceText.replace('$', ''));

    const tax = +(itemPrice * 0.08).toFixed(2);
    const expectedTotal = +(itemPrice + tax).toFixed(2);

    const totalText = await page.locator('[data-test="total-label"]').textContent();
    const total = parseFloat(totalText.replace('Total: $', ''));


    expect(total).toBe(expectedTotal);

    await expect(page.locator('[data-test="payment-info-label"]')).toContainText('Payment Information');
    await expect(page.locator('[data-test="shipping-info-label"]')).toContainText('Shipping Information');
    await expect(page.locator('[data-test="total-info-label"]')).toContainText('Price Total');
    await expect(page.locator('[data-test="subtotal-label"]')).toContainText('Item total');
    await expect(page.locator('[data-test="tax-label"]')).toContainText('Tax');
    await expect(page.locator('[data-test="total-label"]')).toContainText('Total');

    await expect(page.locator('[data-test="cancel"]')).toBeVisible();
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL('/checkout-complete.html');
    await expect(page.locator('.checkout_complete_container')).toBeVisible();
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL('/inventory.html');
});
