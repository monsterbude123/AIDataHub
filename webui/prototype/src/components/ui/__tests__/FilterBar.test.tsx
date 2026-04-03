import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "../FilterBar";
import type { FilterItem } from "../FilterBar";

describe("FilterBar", () => {
  const mockFilters: FilterItem[] = [
    { key: "search", type: "search", placeholder: "搜索名称" },
    {
      key: "status",
      type: "select",
      placeholder: "选择状态",
      options: [
        { label: "正常", value: "normal" },
        { label: "异常", value: "error" },
      ],
    },
  ];

  describe("基本渲染", () => {
    it("should render filter items", () => {
      render(<FilterBar filters={mockFilters} />);
      expect(screen.getByPlaceholderText("搜索名称")).toBeInTheDocument();
      // Select placeholder is rendered in a div, not as input placeholder
      const selectPlaceholder = document.querySelector(".ant-select-placeholder");
      expect(selectPlaceholder?.textContent).toBe("选择状态");
    });

    it("should render filter buttons when filters provided", () => {
      render(<FilterBar filters={mockFilters} />);
      expect(screen.getByText("筛选")).toBeInTheDocument();
      expect(screen.getByText("重置")).toBeInTheDocument();
    });

    it("should not render filter buttons when no filters", () => {
      render(<FilterBar filters={[]} />);
      expect(screen.queryByText("筛选")).not.toBeInTheDocument();
      expect(screen.queryByText("重置")).not.toBeInTheDocument();
    });
  });

  describe("搜索输入框", () => {
    it("should render search input with placeholder", () => {
      render(
        <FilterBar filters={[{ key: "search", type: "search", placeholder: "搜索" }]} />
      );
      expect(screen.getByPlaceholderText("搜索")).toBeInTheDocument();
    });

    it("should render search input with default placeholder", () => {
      render(<FilterBar filters={[{ key: "search", type: "search" }]} />);
      expect(screen.getByPlaceholderText("搜索...")).toBeInTheDocument();
    });

    it("should allow typing in search input", () => {
      render(
        <FilterBar filters={[{ key: "search", type: "search" }]} />
      );
      const input = screen.getByPlaceholderText("搜索...");
      fireEvent.change(input, { target: { value: "测试搜索" } });
      expect(input).toHaveValue("测试搜索");
    });
  });

  describe("选择器", () => {
    it("should render select with placeholder", () => {
      render(
        <FilterBar
          filters={[
            {
              key: "status",
              type: "select",
              placeholder: "请选择状态",
              options: [
                { label: "正常", value: "normal" },
                { label: "异常", value: "error" },
              ],
            },
          ]}
        />
      );
      // Select placeholder is in a div
      const selectPlaceholder = document.querySelector(".ant-select-placeholder");
      expect(selectPlaceholder?.textContent).toBe("请选择状态");
    });

    it("should render select with default placeholder", () => {
      render(
        <FilterBar
          filters={[
            {
              key: "status",
              type: "select",
              options: [{ label: "正常", value: "normal" }],
            },
          ]}
        />
      );
      // antd Select uses placeholder "请选择" by default in the placeholder div
      const placeholderDiv = document.querySelector(".ant-select-placeholder");
      expect(placeholderDiv?.textContent).toBe("请选择");
    });

    it("should render select with defaultValue", () => {
      render(
        <FilterBar
          filters={[
            {
              key: "status",
              type: "select",
              defaultValue: "normal",
              options: [
                { label: "正常", value: "normal" },
                { label: "异常", value: "error" },
              ],
            },
          ]}
        />
      );
      // Antd Select with defaultValue shows the selected label
      expect(screen.getByText("正常")).toBeInTheDocument();
    });
  });

  describe("日期选择器", () => {
    it("should not render date filter (not implemented)", () => {
      render(
        <FilterBar filters={[{ key: "date", type: "date" }]} />
      );
      // 当前实现返回 null
      expect(screen.queryByPlaceholderText(/日期/)).not.toBeInTheDocument();
    });
  });

  describe("自定义组件", () => {
    it("should render custom component via componentProps.render", () => {
      render(
        <FilterBar
          filters={[
            {
              key: "custom",
              type: "custom",
              componentProps: {
                render: <span data-testid="custom-filter">自定义组件</span>,
              },
            },
          ]}
        />
      );
      expect(screen.getByTestId("custom-filter")).toBeInTheDocument();
    });
  });

  describe("新增按钮", () => {
    it("should not render create button by default", () => {
      render(<FilterBar filters={mockFilters} />);
      expect(screen.queryByText("新增")).not.toBeInTheDocument();
    });

    it("should render create button when showCreate=true", () => {
      render(<FilterBar filters={mockFilters} showCreate />);
      expect(screen.getByText("新增")).toBeInTheDocument();
    });

    it("should render custom create button text", () => {
      render(
        <FilterBar filters={mockFilters} showCreate createText="添加数据" />
      );
      expect(screen.getByText("添加数据")).toBeInTheDocument();
    });

    it("should call onCreate when create button clicked", () => {
      const handleCreate = jest.fn();
      render(<FilterBar filters={mockFilters} showCreate onCreate={handleCreate} />);
      fireEvent.click(screen.getByText("新增"));
      expect(handleCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("刷新按钮", () => {
    it("should not render refresh button by default", () => {
      render(<FilterBar filters={mockFilters} />);
      // There's no "刷新" button by default (only in right section with showRefresh)
      const refreshButtons = screen.getAllByRole("button").filter(
        btn => btn.textContent?.includes("刷新")
      );
      // By default showRefresh is false, so no refresh button in right section
      expect(refreshButtons.length).toBe(0);
    });

    it("should render refresh button when showRefresh=true", () => {
      render(<FilterBar filters={mockFilters} showRefresh />);
      expect(screen.getByText("刷新")).toBeInTheDocument();
    });

    it("should call onRefresh when refresh button clicked", () => {
      const handleRefresh = jest.fn();
      render(<FilterBar filters={mockFilters} showRefresh onRefresh={handleRefresh} />);
      fireEvent.click(screen.getByText("刷新"));
      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });

    it("should show loading state on refresh button", () => {
      render(<FilterBar filters={mockFilters} showRefresh loading />);
      const refreshButton = screen.getByText("刷新").closest("button");
      expect(refreshButton).toHaveClass("ant-btn-loading");
    });
  });

  describe("回调函数", () => {
    it("should call onFilter when filter button clicked", () => {
      const handleFilter = jest.fn();
      render(<FilterBar filters={mockFilters} onFilter={handleFilter} />);
      fireEvent.click(screen.getByText("筛选"));
      expect(handleFilter).toHaveBeenCalledWith({});
    });

    it("should call onReset when reset button clicked", () => {
      const handleReset = jest.fn();
      render(<FilterBar filters={mockFilters} onReset={handleReset} />);
      fireEvent.click(screen.getByText("重置"));
      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("className", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <FilterBar filters={mockFilters} className="custom-filter-bar" />
      );
      expect(container.querySelector(".custom-filter-bar")).toBeInTheDocument();
    });
  });

  describe("布局样式", () => {
    it("should have correct layout structure", () => {
      const { container } = render(<FilterBar filters={mockFilters} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.display).toBe("flex");
      expect(wrapper.style.justifyContent).toBe("space-between");
    });
  });
});