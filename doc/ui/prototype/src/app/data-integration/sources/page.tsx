"use client";

/**
 * 数据源列表页
 * 页面路径: /data-integration/sources
 */

import { useState, useMemo } from "react";
import { Card, Button, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import {
  Database,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  DirectoryTree,
  CardGrid,
  FilterBar,
  StatusBadge,
  type DirectoryTreeNode,
  type CardGridItem,
  type FilterItem,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  mockDataSourceCategories,
  mockDataSources,
  getDataSourcesByCategory,
  searchDataSources,
  DATA_SOURCE_TYPE_LABELS,
} from "@/services/mock/data-integration";
import type { DataSource, DataSourceType } from "@/types/data-integration";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据集成", href: ROUTES.DATA_INTEGRATION },
  { title: "数据源管理" },
];

/**
 * 数据源类型图标颜色
 */
const TYPE_COLORS: Partial<Record<DataSourceType, string>> = {
  mysql: "#00758F",
  postgresql: "#336791",
  oracle: "#F80000",
  mongodb: "#47A248",
  redis: "#DC382D",
  elasticsearch: "#FEC514",
  kafka: "#231F20",
  hive: "#FDEE21",
  s3: "#569A31",
};

/**
 * 数据源列表页面组件
 */
export default function DataSourceListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  /**
   * 转换分类树数据
   */
  const categoryTreeData: DirectoryTreeNode[] = useMemo(() => {
    const convertCategory = (categories: typeof mockDataSourceCategories): DirectoryTreeNode[] => {
      return categories.map((cat) => ({
        key: cat.id,
        title: cat.name,
        isLeaf: !cat.children || cat.children.length === 0,
        children: cat.children ? convertCategory(cat.children) : undefined,
      }));
    };

    return [
      { key: "all", title: "全部数据源", isLeaf: true },
      ...convertCategory(mockDataSourceCategories),
    ];
  }, []);

  /**
   * 过滤后的数据源列表
   */
  const filteredDataSources = useMemo(() => {
    let result = selectedCategory === "all"
      ? mockDataSources
      : getDataSourcesByCategory(selectedCategory);

    // 关键词搜索
    if (searchKeyword) {
      result = searchDataSources(searchKeyword);
    }

    // 状态过滤
    if (statusFilter !== "all") {
      result = result.filter((ds) => ds.status === statusFilter);
    }

    return result;
  }, [selectedCategory, searchKeyword, statusFilter]);

  /**
   * 转换为卡片数据
   */
  const cardItems: CardGridItem[] = useMemo(() => {
    return filteredDataSources.map((ds) => ({
      id: ds.id,
      title: ds.name,
      description: ds.description,
      icon: <Database size={24} />,
      status: renderStatusBadge(ds.status),
      data: ds,
    }));
  }, [filteredDataSources]);

  /**
   * 渲染状态徽章
   */
  function renderStatusBadge(status: string) {
    switch (status) {
      case "connected":
        return <StatusBadge status="connected" />;
      case "disconnected":
        return <StatusBadge status="disconnected" />;
      case "testing":
        return <StatusBadge status="processing" label="测试中" />;
      default:
        return null;
    }
  }

  /**
   * 过滤栏配置
   */
  const filterItems: FilterItem[] = [
    {
      key: "search",
      type: "search",
      placeholder: "搜索数据源名称...",
      componentProps: {
        value: searchKeyword,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchKeyword(e.target.value),
      },
    },
    {
      key: "status",
      type: "select",
      placeholder: "连接状态",
      options: [
        { label: "全部状态", value: "all" },
        { label: "已连接", value: "connected" },
        { label: "未连接", value: "disconnected" },
        { label: "测试中", value: "testing" },
      ],
      defaultValue: "all",
      componentProps: {
        value: statusFilter,
        onChange: (value: string) => setStatusFilter(value),
      },
    },
  ];

  /**
   * 处理分类选中
   */
  const handleCategorySelect = (keys: React.Key[], node: DirectoryTreeNode) => {
    if (keys.length > 0) {
      setSelectedCategory(keys[0] as string);
    }
  };

  /**
   * 处理卡片点击
   */
  const handleCardClick = (item: CardGridItem) => {
    console.log("Clicked data source:", item.data);
  };

  /**
   * 处理新增数据源
   */
  const handleCreate = () => {
    message.info("新增数据源功能开发中...");
  };

  /**
   * 处理刷新
   */
  const handleRefresh = () => {
    message.success("数据已刷新");
  };

  /**
   * 渲染卡片操作菜单
   */
  const renderCardActions = (ds: DataSource) => {
    const menuItems: MenuProps["items"] = [
      {
        key: "edit",
        icon: <Edit size={14} />,
        label: "编辑",
        onClick: () => message.info(`编辑数据源: ${ds.name}`),
      },
      {
        key: "test",
        icon: <RefreshCw size={14} />,
        label: "测试连接",
        onClick: () => {
          message.loading({ content: `正在测试 ${ds.name} 连接...`, key: "test" });
          setTimeout(() => {
            message.success({ content: "连接测试成功", key: "test" });
          }, 1500);
        },
      },
      { type: "divider" },
      {
        key: "delete",
        icon: <Trash2 size={14} />,
        label: "删除",
        danger: true,
        onClick: () => message.warning("删除功能需要二次确认"),
      },
    ];

    return (
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <Button type="text" icon={<MoreHorizontal size={14} />} />
      </Dropdown>
    );
  };

  /**
   * 自定义卡片渲染（带操作按钮）
   */
  const renderCustomCard = (item: CardGridItem) => {
    const ds = item.data as DataSource;
    const typeColor = TYPE_COLORS[ds.type] || "#2563EB";

    return (
      <Card
        hoverable
        style={{ height: "100%" }}
        onClick={() => handleCardClick(item)}
        actions={[renderCardActions(ds)]}
      >
        {/* 卡片头部 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: typeColor,
            }}
          >
            <Database size={24} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>
              {DATA_SOURCE_TYPE_LABELS[ds.type]}
            </span>
          </div>
          {renderStatusBadge(ds.status)}
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
          {ds.name}
        </div>

        {/* 卡片描述 */}
        {ds.description && (
          <div
            style={{
              fontSize: 14,
              color: "#475569",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 8,
            }}
          >
            {ds.description}
          </div>
        )}

        {/* 连接信息 */}
        <div style={{ fontSize: 12, color: "#6B7280" }}>
          {ds.connectionConfig.host && (
            <span>
              {ds.connectionConfig.host}:{ds.connectionConfig.port}
            </span>
          )}
        </div>

        {/* 最后检测时间 */}
        {ds.lastTestTime && (
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            最后检测: {ds.lastTestTime}
            {ds.lastTestResult === "success" ? (
              <CheckCircle size={12} style={{ color: "#10B981", marginLeft: 4 }} />
            ) : (
              <XCircle size={12} style={{ color: "#EF4444", marginLeft: 4 }} />
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <PageLayout title="数据源管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 主体布局：左侧目录树 + 右侧内容 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧目录树 */}
        <DirectoryTree
          treeData={categoryTreeData}
          onSelect={handleCategorySelect}
          showSearch
          width={240}
          collapsible
          defaultSelectedKeys={["all"]}
        />

        {/* 右侧内容区 */}
        <div style={{ flex: 1 }}>
          {/* 过滤栏 */}
          <FilterBar
            filters={filterItems}
            showCreate
            showRefresh
            createText="新增数据源"
            onCreate={handleCreate}
            onRefresh={handleRefresh}
          />

          {/* 数据源卡片网格 */}
          <CardGrid
            items={cardItems}
            renderCard={renderCustomCard}
            columns={{ desktop: 3, tablet: 2, mobile: 1 }}
            gutter={16}
            emptyContent={
              <div style={{ padding: 48, textAlign: "center", color: "#475569" }}>
                <Database size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <div style={{ fontSize: 16, marginBottom: 8 }}>暂无数据源</div>
                <div style={{ fontSize: 14 }}>请点击"新增数据源"按钮添加数据源</div>
              </div>
            }
          />
        </div>
      </div>
    </PageLayout>
  );
}