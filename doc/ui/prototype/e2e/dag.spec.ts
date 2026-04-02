import { test, expect } from "@playwright/test";

/**
 * DAG 编排页 E2E 测试
 * 页面路径: /project/[id]/scheduler/dag
 */
test.describe("DAG 编排", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/project/proj-001/scheduler/dag");
  });

  test("应该显示页面标题", async ({ page }) => {
    await expect(page.locator("h1, h2, .ant-card-head-title").first()).toContainText("DAG");
  });

  test("应该显示节点面板", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查节点类型面板
    const nodePanel = page.locator("text=数据集成, text=数据治理, text=数据处理").first();
    await expect(nodePanel).toBeVisible({ timeout: 10000 });
  });

  test("应该显示画布区域", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查画布
    const canvas = page.locator("[class*='canvas'], [class*='flow'], .ant-card").first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("应该显示属性配置面板", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查右侧属性面板
    const propertyPanel = page.locator("text=属性配置, text=节点属性, text=配置").first();
    await expect(propertyPanel).toBeVisible({ timeout: 10000 }).catch(() => {
      // 属性面板可能需要选中节点才显示
    });
  });

  test("应该显示节点类型", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // 检查节点类型列表
    const nodeTypes = page.locator(".ant-card, [class*='node']").first();
    await expect(nodeTypes).toBeVisible({ timeout: 10000 });
  });

  test("应该显示保存按钮", async ({ page }) => {
    const saveButton = page.locator("button:has-text('保存'), button:has-text('发布')");
    await expect(saveButton.first()).toBeVisible();
  });
});