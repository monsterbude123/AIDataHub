"use client";

/**
 * 加载状态组件
 * 基于 MASTER.md Loading State 规范
 * 用于页面加载、操作执行、长时任务等场景
 */

import { Skeleton, Spin, Progress } from "antd";
import { clsx } from "clsx";

/**
 * 加载类型
 */
export type LoadingType = "skeleton" | "spinner" | "progress";

/**
 * Skeleton 变体类型
 */
export type SkeletonVariant = "card" | "table" | "text" | "list" | "custom";

/**
 * LoadingState 组件属性
 */
export interface LoadingStateProps {
  /** 加载类型 */
  type?: LoadingType;
  /** Skeleton 变体 (仅 type="skeleton" 时生效) */
  skeletonVariant?: SkeletonVariant;
  /** 自定义 Skeleton 内容 */
  customSkeleton?: React.ReactNode;
  /** 进度信息 (仅 type="progress" 时生效) */
  progress?: {
    value: number;
    estimatedTime?: string;
    status?: "active" | "success" | "exception";
  };
  /** 进度条文本 */
  progressText?: string;
  /** Spinner 尺寸 */
  spinnerSize?: "small" | "default" | "large";
  /** Spinner 提示文字 */
  tip?: string;
  /** 居中显示 */
  center?: boolean;
  /** 最小高度 */
  minHeight?: number;
  /** 自定义类名 */
  className?: string;
  /** 覆盖模式 (覆盖父容器) */
  overlay?: boolean;
}

/**
 * 卡片 Skeleton
 */
function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: 16,
            border: "1px solid #E2E8F0",
          }}
        >
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </div>
      ))}
    </div>
  );
}

/**
 * 表格 Skeleton
 */
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8 }}>
      {/* 表头 */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "16px 24px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
          borderRadius: "8px 8px 0 0",
        }}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton.Input
            key={index}
            active
            size="small"
            style={{ width: index === 0 ? 40 : 120, borderRadius: 4 }}
          />
        ))}
      </div>
      {/* 行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            gap: 16,
            padding: "12px 24px",
            borderBottom:
              rowIndex < rows - 1 ? "1px solid #E2E8F0" : "none",
          }}
        >
          {Array.from({ length: 5 }).map((_, colIndex) => (
            <Skeleton.Input
              key={colIndex}
              active
              size="small"
              style={{
                width: colIndex === 0 ? 40 : colIndex === 4 ? 100 : 120,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 文本 Skeleton
 */
function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ maxWidth: 600 }}>
      <Skeleton active paragraph={{ rows: lines }} />
    </div>
  );
}

/**
 * 列表 Skeleton
 */
function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 16,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #E2E8F0",
          }}
        >
          <Skeleton.Avatar active size="small" />
          <div style={{ flex: 1 }}>
            <Skeleton.Input active size="small" style={{ width: 200 }} />
          </div>
          <Skeleton.Button active size="small" />
        </div>
      ))}
    </div>
  );
}

/**
 * 加载状态组件
 */
export function LoadingState({
  type = "spinner",
  skeletonVariant = "card",
  customSkeleton,
  progress,
  progressText,
  spinnerSize = "default",
  tip,
  center = true,
  minHeight = 300,
  className,
  overlay = false,
}: LoadingStateProps) {
  const spinnerSizeMap = {
    small: 24,
    default: 40,
    large: 64,
  };

  /**
   * 渲染 Skeleton
   */
  const renderSkeleton = () => {
    if (customSkeleton) {
      return customSkeleton;
    }

    switch (skeletonVariant) {
      case "card":
        return <CardSkeleton />;
      case "table":
        return <TableSkeleton />;
      case "text":
        return <TextSkeleton />;
      case "list":
        return <ListSkeleton />;
      default:
        return <Skeleton active />;
    }
  };

  /**
   * 渲染 Spinner
   */
  const renderSpinner = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: tip ? 12 : 0,
      }}
    >
      <Spin size={spinnerSizeMap[spinnerSize]} />
      {tip && (
        <span style={{ color: "#6B7280", fontSize: 14 }}>{tip}</span>
      )}
    </div>
  );

  /**
   * 渲染进度条
   */
  const renderProgress = () => {
    if (!progress) return null;

    const { value, estimatedTime, status = "active" } = progress;

    return (
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 24,
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #E2E8F0",
        }}
      >
        {progressText && (
          <div
            style={{
              marginBottom: 12,
              fontSize: 14,
              color: "#1E293B",
            }}
          >
            {progressText}
          </div>
        )}
        <Progress
          percent={value}
          status={status}
          strokeColor={
            status === "active"
              ? "#2563EB"
              : status === "success"
              ? "#10B981"
              : "#EF4444"
          }
        />
        {estimatedTime && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 12,
              color: "#6B7280",
            }}
          >
            <span>预估剩余时间: {estimatedTime}</span>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div
      className={clsx("loading-state", className)}
      style={{
        display: "flex",
        alignItems: center ? "center" : "flex-start",
        justifyContent: center ? "center" : "flex-start",
        minHeight: type === "skeleton" ? "auto" : minHeight,
        padding: center ? 24 : 0,
        position: overlay ? "absolute" : "relative",
        top: overlay ? 0 : "auto",
        left: overlay ? 0 : "auto",
        right: overlay ? 0 : "auto",
        bottom: overlay ? 0 : "auto",
        background: overlay ? "rgba(255, 255, 255, 0.8)" : "transparent",
        zIndex: overlay ? 10 : "auto",
      }}
    >
      {type === "skeleton" && renderSkeleton()}
      {type === "spinner" && renderSpinner()}
      {type === "progress" && renderProgress()}
    </div>
  );

  return content;
}

/**
 * 页面加载 Skeleton
 */
export function PageLoadingSkeleton() {
  return (
    <div style={{ padding: 24 }}>
      <LoadingState type="skeleton" skeletonVariant="card" />
    </div>
  );
}

/**
 * 表格加载 Skeleton
 */
export function TableLoadingSkeleton({ rows }: { rows?: number }) {
  return <LoadingState type="skeleton" skeletonVariant="table" rows={rows} />;
}

/**
 * 列表加载 Skeleton
 */
export function ListLoadingSkeleton({ items }: { items?: number }) {
  return <LoadingState type="skeleton" skeletonVariant="list" items={items} />;
}

/**
 * 按钮加载 Spinner (用于按钮内部)
 */
export function ButtonSpinner() {
  return <Spin size="small" />;
}

/**
 * 全屏加载遮罩
 */
export function FullscreenLoading({ tip = "加载中..." }: { tip?: string }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.9)",
        zIndex: 100,
      }}
    >
      <LoadingState type="spinner" tip={tip} />
    </div>
  );
}