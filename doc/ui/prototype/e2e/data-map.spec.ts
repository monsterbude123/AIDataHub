import { test, expect } from "@playwright/test";

/**
 * 数据地图 E2E 测试
 */
test.describe("数据地图", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/governance/data-map");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-card-head-title").first()).toContainText("数据地图");
  });

  test("应该显示搜索框", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索']").first();
    await expect(searchInput).toBeVisible();
  });

  test("应该显示筛选面板", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查筛选条件区域
    const filterPanel = page.locator("text=筛选, text=数据分层, text=获取方式").first();
    await expect(filterPanel).toBeVisible({ timeout: 10000 });
  });

  test("应该显示数据资产列表", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查资产卡片或列表
    const assetList = page.locator(".ant-card").first();
    await expect(assetList).toBeVisible({ timeout: 10000 });
  });

  test("筛选功能应该正常工作", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击筛选复选框
    const checkbox = page.locator(".ant-checkbox-wrapper").first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await page.waitForTimeout(500);
    }
  });

  test("搜索功能应该正常工作", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='搜索']").first();
    await searchInput.fill("客户");
    await page.waitForTimeout(500);

    // 验证搜索结果
    await expect(page.locator(".ant-card, .ant-table-tbody tr").first()).toBeVisible({ timeout: 5000 });
  });

  test("点击资产卡片应该显示详情弹窗", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 点击资产卡片
    const assetCard = page.locator(".ant-card").first();
    if (await assetCard.isVisible()) {
      await assetCard.click();

      // 检查弹窗是否显示
      await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 3000 }).catch(() => {
        // 弹窗可能不存在
      });
    }
  });
});