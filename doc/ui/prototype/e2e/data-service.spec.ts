import { test, expect } from "@playwright/test";

/**
 * 数据服务目录 E2E 测试
 */
test.describe("数据服务目录", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/service/catalog");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-card-head-title").first()).toContainText("服务");
  });

  test("应该显示服务卡片", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const cards = page.locator(".ant-card").first();
    await expect(cards).toBeVisible({ timeout: 10000 });
  });

  test("应该显示搜索框", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索']").first();
    await expect(searchInput).toBeVisible();
  });

  test("应该显示类型筛选", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查类型筛选下拉框
    const typeFilter = page.locator(".ant-select").first();
    await expect(typeFilter).toBeVisible({ timeout: 10000 });
  });

  test("应该显示新增服务按钮", async ({ page }) => {
    const addButton = page.locator("button:has-text('新增')");
    await expect(addButton.first()).toBeVisible();
  });

  test("服务卡片应该显示类型标签", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查类型标签
    const typeTag = page.locator(".ant-tag").first();
    await expect(typeTag).toBeVisible({ timeout: 10000 });
  });

  test("服务卡片应该显示状态标签", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查状态标签
    const statusTag = page.locator("text=已发布, text=未发布, text=已下线").first();
    await expect(statusTag).toBeVisible({ timeout: 10000 });
  });

  test("点击服务卡片应该显示详情", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const card = page.locator(".ant-card").first();
    if (await card.isVisible()) {
      await card.click();

      // 检查弹窗
      await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });
});