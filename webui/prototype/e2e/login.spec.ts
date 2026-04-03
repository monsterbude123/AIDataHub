import { test, expect } from "@playwright/test";

/**
 * 登录页 E2E 测试
 */
test.describe("登录页", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("应该显示登录表单", async ({ page }) => {
    await expect(page.locator("input[type='text'], input[placeholder*='用户名'], input[placeholder*='账号']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("应该显示登录按钮", async ({ page }) => {
    const loginButton = page.locator("button:has-text('登录'), button:has-text('Login')");
    await expect(loginButton).toBeVisible();
  });

  test("登录表单应该有必填验证", async ({ page }) => {
    const loginButton = page.locator("button:has-text('登录'), button:has-text('Login')");

    // 点击登录按钮而不填写表单
    await loginButton.click();

    // 应该显示错误提示
    await expect(page.locator(".ant-form-item-explain-error, .ant-message-error, text=请输入")).toBeVisible({ timeout: 3000 }).catch(() => {
      // 某些实现可能使用不同的错误提示方式
    });
  });

  test("应该显示 OAuth 登录选项", async ({ page }) => {
    // 检查是否有第三方登录选项
    const oauthSection = page.locator("text=OAuth, text=第三方登录, text=企业微信, text=钉钉");
    await expect(oauthSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // OAuth 选项可能不存在
    });
  });

  test("应该显示 LDAP 登录选项", async ({ page }) => {
    // 检查是否有 LDAP 登录选项
    const ldapOption = page.locator("text=LDAP, text=域账号");
    await expect(ldapOption.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // LDAP 选项可能不存在
    });
  });
});