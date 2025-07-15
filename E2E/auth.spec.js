const { test, expect } = require('@playwright/test');
import { validUser, invalidUser } from '../helpers/credentials.js';

test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        const loginForm = page.locator('form');
        await loginForm.locator('[data-test="username"]').fill(validUser.username);
        await loginForm.locator('[data-test="password"]').fill(validUser.username);
        await loginForm.locator('[data-test="login-button"]').click();
        await expect(page).toHaveURL("/");
    });

    test('should show error with invalid credentials', async ({ page }) => {
        const loginForm = page.locator('form');
        await loginForm.locator('[data-test="username"]').fill(invalidUser.username);
        await loginForm.locator('[data-test="password"]').fill(invalidUser.password);
        await loginForm.locator('[data-test="login-button"]').click();
        await expect(page.locator('[data-test="error"]')).toHaveText("Epic sadface: Username and password do not match any user in this service"); //there is no other language support, it's easy to handle text (other wise status)

    });

    test('should not allow empty fields', async ({ page }) => {
        const loginForm = page.locator('form');
        await loginForm.locator('[data-test="login-button"]').click();
        await expect(page.locator('[data-test="error"]')).toHaveText("Epic sadface: Username is required");
    });

    test('should not allow empty password field', async ({ page }) => {
        const loginForm = page.locator('form');
        await loginForm.locator('[data-test="username"]').fill(validUser.username);
        await loginForm.locator('[data-test="login-button"]').click();
        await expect(page.locator('[data-test="error"]')).toHaveText("Epic sadface: Password is required");
    });
});
