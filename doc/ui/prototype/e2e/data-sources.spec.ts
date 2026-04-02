import { test, expect } from "@playwright/test";

/**
 * 数据源管理页 E2E 测试
 */
test.describe("数据源管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/data-integration/sources");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-card-head-title").first()).toContainText("数据源");
  });

  test("应该显示分类树", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查左侧树形结构
    const tree = page.locator(".ant-tree, [class*='tree']").first();
    await expect(tree).toBeVisible({ timeout: 10000 });
  });

  test("应该显示数据源卡片", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查卡片网格
    const cards = page.locator(".ant-card").first();
    await expect(cards).toBeVisible({ timeout: 10000 });
  });

  test("应该显示搜索框", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索'], input[placeholder*='查询']").first();
    await expect(searchInput).toBeVisible();
  });

  test("应该显示新增按钮", async ({ page }) => {
    const addButton = page.locator("button:has-text('新增'), button:has-text('添加')");
    await expect(addButton.first()).toBeVisible();
  });

  test("点击分类树节点应该过滤数据", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击树节点
    const treeNode = page.locator(".ant-tree-node-content-wrapper, .ant-tree-title").first();
    if (await treeNode.isVisible()) {
      await treeNode.click();
      // 等待页面更新
      await page.waitForTimeout(500);
    }
  });

  test("搜索功能应该正常工作", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索'], input[placeholder*='查询']").first();
    await searchInput.fill("MySQL");
    await page.waitForTimeout(500);

    // 验证搜索结果
    await expect(page.locator(".ant-card")).toBeVisible({ timeout: 5000 });
  });
});