import { render, screen, fireEvent } from "@testing-library/react";
import { PageLayout } from "../PageLayout";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("PageLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("基本渲染", () => {
    it("should render children content", () => {
      render(
        <PageLayout>
          <div data-testid="child-content">测试内容</div>
        </PageLayout>
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("测试内容")).toBeInTheDocument();
    });

    it("should render default title", () => {
      render(<PageLayout>内容</PageLayout>);
      expect(screen.getByText("AIDataHub")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(<PageLayout title="数据源管理">内容</PageLayout>);
      expect(screen.getByText("数据源管理")).toBeInTheDocument();
    });
  });

  describe("侧边导航", () => {
    it("should render sidebar with logo", () => {
      render(<PageLayout>内容</PageLayout>);
      // Logo 区域应该有应用名称
      expect(screen.getByText("AI DataHub Prototype")).toBeInTheDocument();
    });

    it("should render navigation menu items", () => {
      render(<PageLayout>内容</PageLayout>);
      // 主菜单项
      expect(screen.getByText("首页")).toBeInTheDocument();
      expect(screen.getByText("数据集成")).toBeInTheDocument();
      expect(screen.getByText("数据治理")).toBeInTheDocument();
      expect(screen.getByText("系统管理")).toBeInTheDocument();
    });

    it("should render collapsible sidebar", () => {
      render(<PageLayout>内容</PageLayout>);
      // 侧边栏应该有折叠按钮
      const collapseTrigger = document.querySelector(".ant-layout-sider-trigger");
      expect(collapseTrigger).toBeInTheDocument();
    });

    it("should collapse sidebar when trigger clicked", () => {
      render(<PageLayout>内容</PageLayout>);
      const collapseTrigger = document.querySelector(".ant-layout-sider-trigger") as HTMLElement;
      fireEvent.click(collapseTrigger);
      // 侧边栏应该进入折叠状态
      const collapsedSider = document.querySelector(".ant-layout-sider-collapsed");
      expect(collapsedSider).toBeInTheDocument();
    });
  });

  describe("顶部导航", () => {
    it("should render header with user info", () => {
      render(<PageLayout>内容</PageLayout>);
      expect(screen.getByText("管理员")).toBeInTheDocument();
    });

    it("should render notification badge", () => {
      render(<PageLayout>内容</PageLayout>);
      // 通知徽章
      const badge = document.querySelector(".ant-badge");
      expect(badge).toBeInTheDocument();
    });

    it("should render user dropdown menu", () => {
      render(<PageLayout>内容</PageLayout>);
      // 用户头像
      expect(screen.getByText("U")).toBeInTheDocument();
      // 用户名
      expect(screen.getByText("管理员")).toBeInTheDocument();
    });
  });

  describe("路由高亮", () => {
    it("should highlight home menu item on home route", () => {
      const mockUsePathname = jest.requireMock("next/navigation").usePathname;
      mockUsePathname.mockReturnValue("/");

      render(<PageLayout>内容</PageLayout>);
      const homeMenuItem = screen.getByText("首页").closest(".ant-menu-item");
      expect(homeMenuItem).toHaveClass("ant-menu-item-selected");
    });
  });

  describe("布局结构", () => {
    it("should have correct layout structure", () => {
      const { container } = render(<PageLayout>内容</PageLayout>);

      // 主布局
      const mainLayout = container.querySelector(".ant-layout");
      expect(mainLayout).toBeInTheDocument();

      // 侧边栏
      const sider = container.querySelector(".ant-layout-sider");
      expect(sider).toBeInTheDocument();

      // 顶部栏
      const header = container.querySelector(".ant-layout-header");
      expect(header).toBeInTheDocument();

      // 内容区
      const content = container.querySelector(".ant-layout-content");
      expect(content).toBeInTheDocument();
    });

    it("should have scrollable content area", () => {
      const { container } = render(<PageLayout>内容</PageLayout>);
      const content = container.querySelector(".ant-layout-content") as HTMLElement;
      expect(content.style.overflowY).toBe("auto");
    });
  });

  describe("应用配置", () => {
    it("should display app name in sidebar", () => {
      render(<PageLayout>内容</PageLayout>);
      expect(screen.getByText("AI DataHub Prototype")).toBeInTheDocument();
    });
  });

  describe("菜单分组", () => {
    it("should render all menu groups", () => {
      render(<PageLayout>内容</PageLayout>);

      // 所有主要菜单分组
      const menuGroups = [
        "首页",
        "数据集成",
        "数据服务",
        "元数据管理",
        "数据组织",
        "数据治理",
        "数据安全",
        "任务调度",
        "数据分析",
        "系统管理",
      ];

      menuGroups.forEach((group) => {
        expect(screen.getByText(group)).toBeInTheDocument();
      });
    });
  });
});