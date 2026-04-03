import { render, screen, fireEvent, within } from "@testing-library/react";
import { DataTable, createStandardActions } from "../DataTable";
import type { TableColumnConfig, TableActionItem } from "../DataTable";

interface TestData {
  id: string;
  name: string;
  status: string;
}

describe("DataTable", () => {
  const mockColumns: TableColumnConfig[] = [
    { key: "id", title: "ID", dataIndex: "id", width: 100 },
    { key: "name", title: "名称", dataIndex: "name", width: 200 },
    { key: "status", title: "状态", dataIndex: "status", width: 100 },
  ];

  const mockData: TestData[] = [
    { id: "1", name: "测试数据1", status: "正常" },
    { id: "2", name: "测试数据2", status: "异常" },
    { id: "3", name: "测试数据3", status: "正常" },
  ];

  describe("基本渲染", () => {
    it("should render table with columns and data", () => {
      render(<DataTable columns={mockColumns} dataSource={mockData} />);
      // Use getAllByText since antd renders headers multiple times for scroll
      expect(screen.getAllByText("ID").length).toBeGreaterThan(0);
      expect(screen.getAllByText("名称").length).toBeGreaterThan(0);
      expect(screen.getAllByText("状态").length).toBeGreaterThan(0);
      expect(screen.getByText("测试数据1")).toBeInTheDocument();
      expect(screen.getByText("测试数据2")).toBeInTheDocument();
    });

    it("should render empty text when no data", () => {
      render(<DataTable columns={mockColumns} dataSource={[]} />);
      expect(screen.getByText("暂无数据")).toBeInTheDocument();
    });

    it("should render custom empty text", () => {
      render(
        <DataTable columns={mockColumns} dataSource={[]} emptyText="没有记录" />
      );
      expect(screen.getByText("没有记录")).toBeInTheDocument();
    });
  });

  describe("分页", () => {
    it("should render pagination by default", () => {
      render(<DataTable columns={mockColumns} dataSource={mockData} />);
      // Pagination should be visible - antd renders it
      const pagination = document.querySelector(".ant-pagination");
      expect(pagination).toBeInTheDocument();
    });

    it("should hide pagination when pagination=false", () => {
      render(
        <DataTable columns={mockColumns} dataSource={mockData} pagination={false} />
      );
      const pagination = document.querySelector(".ant-pagination");
      expect(pagination).not.toBeInTheDocument();
    });

    it("should use custom defaultPageSize", () => {
      render(
        <DataTable
          columns={mockColumns}
          dataSource={mockData}
          defaultPageSize={20}
        />
      );
      // 分页组件会渲染，但默认 pageSize 是 20
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("行选择", () => {
    it("should not show row selection by default", () => {
      render(<DataTable columns={mockColumns} dataSource={mockData} />);
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("should show row selection when selectable=true", () => {
      render(
        <DataTable columns={mockColumns} dataSource={mockData} selectable />
      );
      expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
    });

    it("should call onSelectionChange when rows are selected", () => {
      const handleSelectionChange = jest.fn();
      render(
        <DataTable
          columns={mockColumns}
          dataSource={mockData}
          selectable
          onSelectionChange={handleSelectionChange}
        />
      );
      // 点击全选 checkbox
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);
      expect(handleSelectionChange).toHaveBeenCalled();
    });
  });

  describe("加载状态", () => {
    it("should show loading spinner when loading=true", () => {
      render(
        <DataTable columns={mockColumns} dataSource={mockData} loading />
      );
      // Antd v6 uses ant-spin class for loading
      const spinner = document.querySelector(".ant-spin-spinning");
      expect(spinner).toBeInTheDocument();
    });

    it("should not show loading spinner by default", () => {
      render(<DataTable columns={mockColumns} dataSource={mockData} />);
      const spinner = document.querySelector(".ant-spin-spinning");
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe("操作列", () => {
    const mockActions: TableActionItem[] = [
      {
        key: "edit",
        label: "编辑",
        icon: <span>EditIcon</span>,
        onClick: jest.fn(),
      },
      {
        key: "delete",
        label: "删除",
        icon: <span>DeleteIcon</span>,
        danger: true,
        confirm: true,
        confirmText: "确认删除？",
        onClick: jest.fn(),
      },
    ];

    it("should render action column when actions provided", () => {
      render(
        <DataTable columns={mockColumns} dataSource={mockData} actions={mockActions} />
      );
      expect(screen.getAllByText("操作").length).toBeGreaterThan(0);
    });

    it("should render custom action column title", () => {
      render(
        <DataTable
          columns={mockColumns}
          dataSource={mockData}
          actions={mockActions}
          actionColumnTitle="管理"
        />
      );
      expect(screen.getAllByText("管理").length).toBeGreaterThan(0);
    });

    it("should not render action column when no actions", () => {
      render(<DataTable columns={mockColumns} dataSource={mockData} />);
      expect(screen.queryByText("操作")).not.toBeInTheDocument();
    });

    it("should call action onClick when clicked", () => {
      const handleClick = jest.fn();
      const actions: TableActionItem[] = [
        { key: "view", label: "查看", onClick: handleClick },
      ];
      render(
        <DataTable columns={mockColumns} dataSource={mockData} actions={actions} />
      );
      // Find all buttons in the table body
      const allButtons = document.querySelectorAll(".ant-table-tbody button");
      expect(allButtons.length).toBeGreaterThan(0);
      // Click the first button (which should be the view action for the first row)
      fireEvent.click(allButtons[0]);
      expect(handleClick).toHaveBeenCalledWith(mockData[0]);
    });

    it("should show disabled action button", () => {
      const actions: TableActionItem[] = [
        { key: "disabled", label: "禁用操作", disabled: true },
      ];
      render(
        <DataTable columns={mockColumns} dataSource={mockData} actions={actions} />
      );
      // Find all buttons in the table body
      const allButtons = document.querySelectorAll(".ant-table-tbody button");
      expect(allButtons.length).toBeGreaterThan(0);
      // First button should be disabled
      expect(allButtons[0]).toBeDisabled();
    });
  });

  describe("表格属性", () => {
    it("should render bordered table when bordered=true", () => {
      const { container } = render(
        <DataTable columns={mockColumns} dataSource={mockData} bordered />
      );
      expect(container.querySelector(".ant-table-bordered")).toBeInTheDocument();
    });

    it("should use small size", () => {
      const { container } = render(
        <DataTable columns={mockColumns} dataSource={mockData} size="small" />
      );
      expect(container.querySelector(".ant-table-small")).toBeInTheDocument();
    });

    it("should use custom rowKey", () => {
      const dataWithCustomKey = [{ name: "Test", status: "OK" }];
      render(
        <DataTable
          columns={mockColumns}
          dataSource={dataWithCustomKey}
          rowKey="name"
        />
      );
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("should use rowKey function", () => {
      const dataWithCustomKey = [{ name: "Test", status: "OK" }];
      render(
        <DataTable
          columns={mockColumns}
          dataSource={dataWithCustomKey}
          rowKey={(record) => record.name}
        />
      );
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <DataTable
          columns={mockColumns}
          dataSource={mockData}
          className="custom-table"
        />
      );
      expect(container.querySelector(".custom-table")).toBeInTheDocument();
    });
  });
});

describe("createStandardActions", () => {
  it("should create standard actions for view, edit, delete", () => {
    const callbacks = {
      view: jest.fn(),
      edit: jest.fn(),
      delete: jest.fn(),
    };
    const actions = createStandardActions(
      ["view", "edit", "delete"],
      callbacks
    );

    expect(actions.length).toBe(3);
    expect(actions[0].key).toBe("view");
    expect(actions[0].label).toBe("查看");
    expect(actions[1].key).toBe("edit");
    expect(actions[1].label).toBe("编辑");
    expect(actions[2].key).toBe("delete");
    expect(actions[2].label).toBe("删除");
    expect(actions[2].danger).toBe(true);
    expect(actions[2].confirm).toBe(true);
    expect(actions[2].confirmText).toBe("确认删除该记录？");
  });

  it("should handle unknown action keys", () => {
    const callbacks = {
      custom: jest.fn(),
    };
    const actions = createStandardActions(["custom"], callbacks);

    expect(actions[0].key).toBe("custom");
    expect(actions[0].label).toBe("custom");
    expect(actions[0].icon).toBeUndefined();
  });
});