import { test, expect } from "@playwright/test";

/**
 * 首页仪表盘 E2E 测试
 */
test.describe("首页仪表盘", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2").first()).toContainText("仪表盘");
  });

  test("应该显示 KPI 卡片", async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState("networkidle");

    // 检查 KPI 卡片是否存在
    const kpiCards = page.locator(".ant-card, [class*='kpi']").first();
    await expect(kpiCards).toBeVisible({ timeout: 10000 });
  });

  test("应该显示快捷入口", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查快捷入口区域
    const quickLinks = page.locator("text=快捷入口, text=快速入口").first();
    await expect(quickLinks).toBeVisible({ timeout: 10000 });
  });

  test("KPI 卡片应该显示数值", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查数字显示
    const numbers = page.locator(".ant-statistic-content-value, [class*='value']").first();
    await expect(numbers).toBeVisible({ timeout: 10000 });
  });
});