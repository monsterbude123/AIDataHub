import { test, expect } from "@playwright/test";

/**
 * 系统设置 E2E 测试
 */
test.describe("系统设置", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/system/settings");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2").first()).toContainText("系统设置");
  });

  test("应该显示五个标签页", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查标签页
    const tabs = page.locator(".ant-tabs-tab");
    await expect(tabs).toHaveCount(5, { timeout: 10000 });
  });

  test("应该显示基础配置表单", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查基础配置内容
    await expect(page.locator("text=系统信息").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=功能开关").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击邮件服务标签应该切换内容", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击邮件服务标签
    const emailTab = page.locator(".ant-tabs-tab").nth(1);
    await emailTab.click();

    // 检查 SMTP 配置内容
    await expect(page.locator("text=SMTP 配置").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击存储配置标签应该切换内容", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击存储配置标签
    const storageTab = page.locator(".ant-tabs-tab").nth(2);
    await storageTab.click();

    // 检查存储类型选择
    await expect(page.locator("text=存储类型").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击安全策略标签应该切换内容", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击安全策略标签
    const securityTab = page.locator(".ant-tabs-tab").nth(3);
    await securityTab.click();

    // 检查密码策略内容
    await expect(page.locator("text=密码策略").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击日志配置标签应该切换内容", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击日志配置标签
    const logTab = page.locator(".ant-tabs-tab").nth(4);
    await logTab.click();

    // 检查日志级别内容
    await expect(page.locator("text=日志级别").first()).toBeVisible({ timeout: 5000 });
  });

  test("基础配置应该显示保存按钮", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查保存按钮
    const saveButton = page.locator("button:has-text('保存配置')").first();
    await expect(saveButton).toBeVisible({ timeout: 10000 });
  });

  test("邮件服务应该显示测试邮件按钮", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击邮件服务标签
    const emailTab = page.locator(".ant-tabs-tab").nth(1);
    await emailTab.click();

    // 检查测试邮件按钮
    const testButton = page.locator("button:has-text('发送测试邮件')").first();
    await expect(testButton).toBeVisible({ timeout: 5000 });
  });

  test("存储配置应该显示测试连接按钮", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击存储配置标签
    const storageTab = page.locator(".ant-tabs-tab").nth(2);
    await storageTab.click();

    // 检查测试连接按钮
    const testButton = page.locator("button:has-text('测试连接')").first();
    await expect(testButton).toBeVisible({ timeout: 5000 });
  });

  test("安全策略应该显示 IP 白名单配置", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击安全策略标签
    const securityTab = page.locator(".ant-tabs-tab").nth(3);
    await securityTab.click();

    // 检查 IP 白名单
    await expect(page.locator("text=IP 白名单").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击发送测试邮件应该显示弹窗", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击邮件服务标签
    const emailTab = page.locator(".ant-tabs-tab").nth(1);
    await emailTab.click();

    // 点击发送测试邮件按钮
    const testButton = page.locator("button:has-text('发送测试邮件')").first();
    await testButton.click();

    // 检查弹窗
    await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 5000 });
  });
});