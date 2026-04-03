import { test, expect } from "@playwright/test";

/**
 * 个人中心 E2E 测试
 */
test.describe("个人中心", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2").first()).toContainText("个人中心");
  });

  test("应该显示用户信息卡片", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查头像
    const avatar = page.locator(".ant-avatar").first();
    await expect(avatar).toBeVisible({ timeout: 10000 });
  });

  test("应该显示三个标签页", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查标签页
    const tabs = page.locator(".ant-tabs-tab");
    await expect(tabs).toHaveCount(3, { timeout: 10000 });
  });

  test("应该显示基本信息表单", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查基本信息表单
    const form = page.locator(".ant-form").first();
    await expect(form).toBeVisible({ timeout: 10000 });
  });

  test("点击安全设置标签应该切换内容", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击安全设置标签
    const securityTab = page.locator(".ant-tabs-tab").nth(1);
    await securityTab.click();

    // 检查是否显示修改密码相关内容
    await expect(page.locator("text=修改密码").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击偏好设置标签应该切换内容", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击偏好设置标签
    const preferencesTab = page.locator(".ant-tabs-tab").nth(2);
    await preferencesTab.click();

    // 检查是否显示界面设置相关内容
    await expect(page.locator("text=界面设置").first()).toBeVisible({ timeout: 5000 });
  });

  test("安全设置应该显示登录历史表格", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击安全设置标签
    const securityTab = page.locator(".ant-tabs-tab").nth(1);
    await securityTab.click();

    // 检查登录历史表格
    await expect(page.locator("text=登录历史").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击修改密码按钮应该显示弹窗", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击安全设置标签
    const securityTab = page.locator(".ant-tabs-tab").nth(1);
    await securityTab.click();

    // 点击修改密码按钮
    const changePasswordButton = page.locator("button:has-text('修改密码')").first();
    await changePasswordButton.click();

    // 检查弹窗
    await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 5000 });
  });
});