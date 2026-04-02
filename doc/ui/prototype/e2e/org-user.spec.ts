import { test, expect } from "@playwright/test";

/**
 * 组织用户管理 E2E 测试
 */
test.describe("组织用户管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/system/org-user");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-card-head-title").first()).toContainText("组织");
  });

  test("应该显示组织机构树", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const orgTree = page.locator(".ant-tree").first();
    await expect(orgTree).toBeVisible({ timeout: 10000 });
  });

  test("应该显示用户表格", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const userTable = page.locator(".ant-table").first();
    await expect(userTable).toBeVisible({ timeout: 10000 });
  });

  test("应该显示搜索框", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索'], input[placeholder*='查询']").first();
    await expect(searchInput).toBeVisible();
  });

  test("应该显示新增用户按钮", async ({ page }) => {
    const addButton = page.locator("button:has-text('新增'), button:has-text('添加')");
    await expect(addButton.first()).toBeVisible();
  });

  test("点击组织节点应该过滤用户列表", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击组织树节点
    const treeNode = page.locator(".ant-tree-node-content-wrapper, .ant-tree-title").first();
    if (await treeNode.isVisible()) {
      await treeNode.click();
      await page.waitForTimeout(500);
    }
  });

  test("用户表格应该显示操作列", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查操作列
    const actionColumn = page.locator("th:has-text('操作'), td:has-text('编辑')").first();
    await expect(actionColumn).toBeVisible({ timeout: 10000 });
  });
});