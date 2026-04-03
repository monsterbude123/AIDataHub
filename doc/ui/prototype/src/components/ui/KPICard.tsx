"use client";

/**
 * KPI 统计卡片组件
 * 用于展示关键指标数据，支持图标、趋势显示
 */

import { Card, Statistic, Tooltip } from "antd";
import type { CardProps, StatisticProps } from "antd";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";

/**
 * KPI 趋势方向
 */
export type KPITrend = "up" | "down" | "flat";

/**
 * KPI 卡片数据结构
 */
export interface KPICardData {
  /** KPI 标题 */
  title: string;
  /** KPI 数值 */
  value: number | string;
  /** 数值单位 */
  unit?: string;
  /** 数值精度 */
  precision?: number;
  /** 图标 */
  icon?: React.ReactNode;
  /** 图标颜色 */
  iconColor?: string;
  /** 趋势方向 */
  trend?: KPITrend;
  /** 趋势百分比 */
  trendValue?: number;
  /** 目标值 */
  target?: number;
  /** 目标差距 */
  targetGap?: number;
  /** 额外提示信息 */
  tooltip?: string;
  /** 颜色主题 */
  colorTheme?: "primary" | "success" | "warning" | "error" | "neutral";
}

/**
 * KPICard 组件属性
 */
interface KPICardProps {
  /** KPI 数据 */
  data: KPICardData;
  /** 卡片属性 */
  cardProps?: CardProps;
  /** 统计组件属性 */
  statisticProps?: StatisticProps;
  /** 自定义类名 */
  className?: string;
  /** 点击回调 */
  onClick?: () => void;
}

/**
 * 颜色主题映射
 */
const COLOR_THEME = {
  primary: "#2563EB",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  neutral: "#6B7280",
};

/**
 * 获取趋势图标
 */
function getTrendIcon(trend: KPITrend) {
  switch (trend) {
    case "up":
      return <TrendingUp size={16} />;
    case "down":
      return <TrendingDown size={16} />;
    case "flat":
      return <Minus size={16} />;
  }
}

/**
 * 获取趋势颜色
 */
function getTrendColor(trend: KPITrend) {
  switch (trend) {
    case "up":
      return "#10B981";
    case "down":
      return "#EF4444";
    case "flat":
      return "#6B7280";
  }
}

/**
 * KPI 统计卡片组件
 */
export function KPICard({
  data,
  cardProps,
  statisticProps,
  className,
  onClick,
}: KPICardProps) {
  const {
    title,
    value,
    unit,
    precision,
    icon,
    iconColor,
    trend,
    trendValue,
    target,
    tooltip,
    colorTheme = "primary",
  } = data;

  const themeColor = COLOR_THEME[colorTheme];

  /**
   * 渲染标题区域（图标 + 标题）
   */
  const renderTitle = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon && (
        <span style={{ color: iconColor ?? themeColor, fontSize: 20 }}>
          {icon}
        </span>
      )}
      <span style={{ color: "#475569", fontSize: 14 }}>{title}</span>
    </div>
  );

  /**
   * 渲染趋势区域
   */
  const renderTrend = () => {
    if (!trend || trendValue === undefined) return null;

    const trendColor = getTrendColor(trend);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: trendColor,
        }}
      >
        {getTrendIcon(trend)}
        <span>{trendValue > 0 ? "+" : ""}{trendValue}%</span>
      </div>
    );
  };

  /**
   * 渲染目标差距
   */
  const renderTarget = () => {
    if (target === undefined) return null;

    const gap = data.targetGap ?? target - (typeof value === "number" ? value : 0);
    const gapColor = gap >= 0 ? "#10B981" : "#EF4444";

    return (
      <div style={{ fontSize: 12, color: "#475569" }}>
        目标: {target}
        <span style={{ color: gapColor, marginLeft: 8 }}>
          ({gap >= 0 ? "+" : ""}{gap})
        </span>
      </div>
    );
  };

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={className}
      style={{ cursor: onClick ? "pointer" : "default" }}
      {...cardProps}
    >
      <Tooltip title={tooltip}>
        <Statistic
          title={renderTitle()}
          value={value}
          suffix={
            unit ? (
              <span style={{ fontSize: 14, color: "#475569" }}>{unit}</span>
            ) : undefined
          }
          precision={precision}
          styles={{ content: { color: themeColor, fontWeight: 600 } }}
          {...statisticProps}
        />
      </Tooltip>

      {/* 趋势和目标 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        {renderTrend()}
        {renderTarget()}
      </div>
    </Card>
  );
}

/**
 * KPI 卡片网格组件
 * 用于快速渲染一组 KPI 卡片
 */
interface KPICardGridProps {
  /** KPI 数据列表 */
  data: KPICardData[];
  /** 列数 */
  columns?: number;
  /** 卡片间距 */
  gutter?: number;
  /** 单个卡片点击回调 */
  onCardClick?: (data: KPICardData, index: number) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * KPI 卡片网格组件
 */
export function KPICardGrid({
  data,
  columns = 4,
  gutter = 16,
  onCardClick,
  className,
}: KPICardGridProps) {
  return (
    <div className={className}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: gutter }}>
        {data.map((item, index) => (
          <KPICard
            key={item.title}
            data={item}
            onClick={() => onCardClick?.(item, index)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * KPI 卡片行组件（用于直接渲染多个 KPI 卡片）
 */
interface KPICardRowProps {
  /** KPI 数据列表 */
  data: KPICardData[];
  /** 卡片间距 */
  gutter?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * KPI 卡片行组件
 */
export function KPICardRow({ data, gutter = 16, className }: KPICardRowProps) {
  return (
    <div className={className} style={{ display: "flex", gap: gutter }}>
      {data.map((item) => (
        <div key={item.title} style={{ flex: 1 }}>
          <KPICard data={item} />
        </div>
      ))}
    </div>
  );
}