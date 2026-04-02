import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KPICard, type KPICardData } from "../KPICard";

describe("KPICard", () => {
  const mockData: KPICardData = {
    title: "数据源总数",
    value: 24,
    icon: <span>📊</span>,
    colorTheme: "primary",
  };

  it("renders title and value correctly", () => {
    render(<KPICard data={mockData} />);

    expect(screen.getByText("数据源总数")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("renders with unit suffix", () => {
    const dataWithUnit: KPICardData = {
      ...mockData,
      unit: "GB",
    };

    render(<KPICard data={dataWithUnit} />);

    expect(screen.getByText("GB")).toBeInTheDocument();
  });

  it("renders trend indicator for up trend", () => {
    const dataWithTrend: KPICardData = {
      ...mockData,
      trend: "up",
      trendValue: 12.5,
    };

    render(<KPICard data={dataWithTrend} />);

    expect(screen.getByText("+12.5%")).toBeInTheDocument();
  });

  it("renders trend indicator for down trend", () => {
    const dataWithTrend: KPICardData = {
      ...mockData,
      trend: "down",
      trendValue: 5.2,
    };

    render(<KPICard data={dataWithTrend} />);

    expect(screen.getByText("-5.2%")).toBeInTheDocument();
  });

  it("handles string values", () => {
    const dataWithStringValue: KPICardData = {
      title: "状态",
      value: "正常",
      colorTheme: "success",
    };

    render(<KPICard data={dataWithStringValue} />);

    expect(screen.getByText("正常")).toBeInTheDocument();
  });

  it("applies different color themes", () => {
    const { container, rerender } = render(<KPICard data={{ ...mockData, colorTheme: "primary" }} />);

    // Primary theme should have blue color
    expect(container.querySelector("[style*=\"color: #2563EB\"]")).not.toBeNull();

    // Rerender with error theme
    rerender(<KPICard data={{ ...mockData, colorTheme: "error" }} />);
    expect(container.querySelector("[style*=\"color: #EF4444\"]")).not.toBeNull();
  });
});