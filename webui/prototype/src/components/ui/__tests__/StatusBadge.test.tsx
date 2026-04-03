import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, SensitivityBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders with correct label for success status", () => {
    render(<StatusBadge status="success" />);
    expect(screen.getByText("成功")).toBeInTheDocument();
  });

  it("renders with correct label for error status", () => {
    render(<StatusBadge status="error" />);
    expect(screen.getByText("失败")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<StatusBadge status="processing" label="自定义文本" />);
    expect(screen.getByText("自定义文本")).toBeInTheDocument();
  });

  it("renders as dot when dot prop is true", () => {
    const { container } = render(<StatusBadge status="connected" dot />);
    // Dot should render a span with a colored circle
    expect(container.querySelector("span[style*=\"border-radius: 50%\"]")).not.toBeNull();
  });

  it.each([
    ["success", "成功"],
    ["warning", "警告"],
    ["error", "失败"],
    ["processing", "处理中"],
    ["pending", "待处理"],
    ["enabled", "启用"],
    ["disabled", "禁用"],
    ["connected", "已连接"],
    ["disconnected", "未连接"],
  ] as const)("renders %s status with label %s", (status, expectedLabel) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});

describe("SensitivityBadge", () => {
  it("renders with correct label for public level", () => {
    render(<SensitivityBadge level="public" />);
    expect(screen.getByText("公开")).toBeInTheDocument();
  });

  it("renders with correct label for confidential level", () => {
    render(<SensitivityBadge level="confidential" />);
    expect(screen.getByText("机密")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<SensitivityBadge level="internal" label="内部使用" />);
    expect(screen.getByText("内部使用")).toBeInTheDocument();
  });

  it.each([
    ["public", "公开"],
    ["internal", "内部"],
    ["secret", "秘密"],
    ["confidential", "机密"],
  ] as const)("renders %s level with label %s", (level, expectedLabel) => {
    render(<SensitivityBadge level={level} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});