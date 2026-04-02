import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageBreadcrumb, type BreadcrumbItem } from "../PageBreadcrumb";

describe("PageBreadcrumb", () => {
  it("renders breadcrumb items correctly", () => {
    const items: BreadcrumbItem[] = [
      { title: "首页", href: "/" },
      { title: "数据治理", href: "/governance" },
      { title: "数据质量" },
    ];

    render(<PageBreadcrumb items={items} />);

    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("数据治理")).toBeInTheDocument();
    expect(screen.getByText("数据质量")).toBeInTheDocument();
  });

  it("renders links for items with href", () => {
    const items: BreadcrumbItem[] = [
      { title: "首页", href: "/" },
      { title: "当前页" },
    ];

    render(<PageBreadcrumb items={items} />);

    const link = screen.getByRole("link", { name: "首页" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders text for items without href", () => {
    const items: BreadcrumbItem[] = [
      { title: "当前页" },
    ];

    render(<PageBreadcrumb items={items} />);

    expect(screen.getByText("当前页")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const items: BreadcrumbItem[] = [{ title: "测试" }];
    const { container } = render(<PageBreadcrumb items={items} className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});