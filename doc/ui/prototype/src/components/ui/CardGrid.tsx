"use client";

/**
 * 卡片网格布局组件
 * 响应式卡片网格，桌面 3 列，平板 2 列，移动端 1 列
 */

import { Card, Row, Col } from "antd";
import type { CardProps } from "antd";

/**
 * 卡片网格项数据结构
 */
export interface CardGridItem {
  /** 卡片唯一标识 */
  id: string;
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description?: string;
  /** 卡片图标 */
  icon?: React.ReactNode;
  /** 卡片图片 */
  image?: string;
  /** 状态徽章 */
  status?: React.ReactNode;
  /** 操作按钮/菜单 */
  actions?: React.ReactNode;
  /** 额外数据 */
  data?: unknown;
}

/**
 * CardGrid 组件属性
 */
interface CardGridProps {
  /** 卡片数据列表 */
  items: CardGridItem[];
  /** 卡片点击回调 */
  onCardClick?: (item: CardGridItem) => void;
  /** 自定义卡片渲染 */
  renderCard?: (item: CardGridItem) => React.ReactNode;
  /** 卡片属性 */
  cardProps?: CardProps;
  /** 自定义类名 */
  className?: string;
  /** 列数配置（响应式） */
  columns?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  /** 卡片间距 */
  gutter?: number | [number, number];
  /** 加载状态 */
  loading?: boolean;
  /** 空状态展示 */
  emptyContent?: React.ReactNode;
}

/**
 * 默认列数配置
 */
const DEFAULT_COLUMNS = {
  desktop: 3,
  tablet: 2,
  mobile: 1,
};

/**
 * 默认卡片渲染
 */
function DefaultCard({
  item,
  cardProps,
}: {
  item: CardGridItem;
  cardProps?: CardProps;
}) {
  return (
    <Card
      hoverable
      style={{ height: "100%" }}
      actions={item.actions ? [item.actions] : undefined}
      {...cardProps}
    >
      {/* 卡片头部：图标 + 状态 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        {item.icon && (
          <div style={{ fontSize: 24, color: "#2563EB" }}>{item.icon}</div>
        )}
        {item.status && <div>{item.status}</div>}
      </div>

      {/* 卡片标题 */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#1E293B",
          marginBottom: 4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.title}
      </div>

      {/* 卡片描述 */}
      {item.description && (
        <div
          style={{
            fontSize: 14,
            color: "#475569",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.description}
        </div>
      )}

      {/* 卡片图片 */}
      {item.image && (
        <div style={{ marginTop: 12 }}>
          <img
            src={item.image}
            alt={item.title}
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        </div>
      )}
    </Card>
  );
}

/**
 * 卡片网格布局组件
 */
export function CardGrid({
  items,
  onCardClick,
  renderCard,
  cardProps,
  className,
  columns = DEFAULT_COLUMNS,
  gutter = 16,
  loading = false,
  emptyContent,
}: CardGridProps) {
  const { desktop = 3, tablet = 2, mobile = 1 } = columns;

  /**
   * Antd Col 响应式配置
   */
  const colResponsive = {
    xs: 24 / mobile, // < 576px
    sm: 24 / mobile, // >= 576px
    md: 24 / tablet, // >= 768px
    lg: 24 / desktop, // >= 992px
    xl: 24 / desktop, // >= 1200px
    xxl: 24 / desktop, // >= 1600px
  };

  /**
   * 处理卡片点击
   */
  const handleCardClick = (item: CardGridItem) => {
    onCardClick?.(item);
  };

  /**
   * 空状态渲染
   */
  if (items.length === 0 && !loading) {
    return (
      <div className={className} style={{ padding: 24, textAlign: "center" }}>
        {emptyContent ?? (
          <div style={{ color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📭</div>
            <div>暂无数据</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Row gutter={gutter} className={className}>
      {items.map((item) => (
        <Col key={item.id} {...colResponsive} style={{ marginBottom: Array.isArray(gutter) ? gutter[1] : gutter }}>
          {renderCard ? (
            renderCard(item)
          ) : (
            <div onClick={() => handleCardClick(item)} style={{ cursor: onCardClick ? "pointer" : "default" }}>
              <DefaultCard item={item} cardProps={cardProps} />
            </div>
          )}
        </Col>
      ))}
    </Row>
  );
}