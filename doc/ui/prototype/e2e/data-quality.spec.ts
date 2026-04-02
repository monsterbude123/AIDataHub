import { test, expect } from "@playwright/test";

/**
 * 数据质量管理页 E2E 测试
 */
test.describe("数据质量管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/governance/data-quality");
  });

  test("应该显示标签页", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab")).toHaveCount(4, { timeout: 10000 });
  });

  test("应该显示规则定义标签", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab:has-text('规则')")).toBeVisible();
  });

  test("应该显示任务配置标签", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab:has-text('任务')")).toBeVisible();
  });

  test("应该显示统计概览标签", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab:has-text('统计')")).toBeVisible();
  });

  test("应该显示工单管理标签", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab:has-text('工单')")).toBeVisible();
  });

  test("切换标签应该正常工作", async ({ page }) => {
    // 点击任务配置标签
    await page.locator(".ant-tabs-tab:has-text('任务')").click();
    await page.waitForTimeout(500);

    // 验证标签切换成功
    await expect(page.locator(".ant-tabs-tabpane-active")).toBeVisible();
  });

  test("规则定义页面应该显示表格", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 默认在规则定义标签
    const table = page.locator(".ant-table").first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test("应该显示新增规则按钮", async ({ page }) => {
    const addButton = page.locator("button:has-text('新增')");
    await expect(addButton.first()).toBeVisible();
  });
});