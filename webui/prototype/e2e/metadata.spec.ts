import { test, expect } from "@playwright/test";

/**
 * 元数据列表 E2E 测试
 */
test.describe("元数据列表", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metadata/list");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-card-head-title").first()).toContainText("元数据");
  });

  test("应该显示分类树", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const tree = page.locator(".ant-tree").first();
    await expect(tree).toBeVisible({ timeout: 10000 });
  });

  test("应该显示元数据表格", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const table = page.locator(".ant-table").first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test("应该显示搜索框", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索']").first();
    await expect(searchInput).toBeVisible();
  });

  test("应该显示新增按钮", async ({ page }) => {
    const addButton = page.locator("button:has-text('新增')");
    await expect(addButton.first()).toBeVisible();
  });

  test("应该显示导入导出按钮", async ({ page }) => {
    await expect(page.locator("button:has-text('导入')")).toBeVisible();
    await expect(page.locator("button:has-text('导出')")).toBeVisible();
  });

  test("表格应该显示订阅开关", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查订阅开关列
    const switchElement = page.locator(".ant-switch").first();
    await expect(switchElement).toBeVisible({ timeout: 10000 });
  });

  test("搜索功能应该正常工作", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索']").first();
    await searchInput.fill("客户");
    await page.waitForTimeout(500);

    await expect(page.locator(".ant-table-tbody tr").first()).toBeVisible({ timeout: 5000 });
  });
});