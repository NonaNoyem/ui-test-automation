
export async function login(page, credentials) {
    await page.goto('/');
    const loginForm = page.locator('form');
    await loginForm.locator('[data-test="username"]').fill(credentials.username);
    await loginForm.locator('[data-test="password"]').fill(credentials.password);
    await loginForm.locator('[data-test="login-button"]').click();
    await page.waitForURL('/inventory.html');
}
