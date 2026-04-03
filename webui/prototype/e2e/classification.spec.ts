import { test, expect } from "@playwright/test";

/**
 * 分级分类管理 E2E 测试
 */
test.describe("分级分类管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/security/classification");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2").first()).toContainText("分级分类");
  });

  test("应该显示标签页", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab")).toHaveCount(3, { timeout: 10000 });
  });

  test("应该显示分级字典标签", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab:has-text('分级')")).toBeVisible();
  });

  test("应该显示分类字典标签", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab:has-text('分类')")).toBeVisible();
  });

  test("应该显示配置标签", async ({ page }) => {
    await expect(page.locator(".ant-tabs-tab:has-text('配置')")).toBeVisible();
  });

  test("分级字典页面应该显示表格", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const table = page.locator(".ant-table").first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test("分级字典应该显示预定义级别", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查预定义分级
    await expect(page.locator("text=公开, text=内部, text=秘密, text=机密").first()).toBeVisible({ timeout: 10000 });
  });

  test("切换到配置标签应该显示资源树", async ({ page }) => {
    await page.locator(".ant-tabs-tab:has-text('配置')").click();
    await page.waitForLoadState("networkidle");

    // 检查资源树
    const tree = page.locator(".ant-tree").first();
    await expect(tree).toBeVisible({ timeout: 10000 });
  });

  test("应该显示新增按钮", async ({ page }) => {
    const addButton = page.locator("button:has-text('新增')");
    await expect(addButton.first()).toBeVisible();
  });
});