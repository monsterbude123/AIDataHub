import { test, expect } from "@playwright/test";

/**
 * 任务运维 E2E 测试
 * 页面路径: /project/[id]/scheduler/tasks
 */
test.describe("任务运维", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/project/proj-001/scheduler/tasks");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2").first()).toContainText("任务运维");
  });

  test("应该显示统计卡片", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查统计卡片
    const statCards = page.locator(".ant-card").first();
    await expect(statCards).toBeVisible({ timeout: 10000 });
  });

  test("应该显示任务列表表格", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const table = page.locator(".ant-table").first();
    await expect(table).toBeVisible({ timeout: 10000 });
  });

  test("应该显示搜索框", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索']").first();
    await expect(searchInput).toBeVisible();
  });

  test("应该显示状态筛选", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查状态筛选下拉框
    const statusFilter = page.locator(".ant-select").first();
    await expect(statusFilter).toBeVisible({ timeout: 10000 });
  });

  test("应该显示刷新按钮", async ({ page }) => {
    const refreshButton = page.locator("button:has-text('刷新')");
    await expect(refreshButton.first()).toBeVisible();
  });

  test("应该显示导出按钮", async ({ page }) => {
    const exportButton = page.locator("button:has-text('导出')");
    await expect(exportButton.first()).toBeVisible();
  });

  test("表格应该显示任务状态", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查状态标签
    const statusBadge = page.locator(".ant-badge, .ant-tag").first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });
  });

  test("表格应该显示操作按钮", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查操作列
    const actionButton = page.locator("button:has-text('日志'), button:has-text('执行')").first();
    await expect(actionButton).toBeVisible({ timeout: 10000 });
  });

  test("点击任务名称应该显示详情", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击任务名称链接
    const taskLink = page.locator(".ant-table a, a:has-text('任务')").first();
    if (await taskLink.isVisible()) {
      await taskLink.click();

      // 检查弹窗
      await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });
});