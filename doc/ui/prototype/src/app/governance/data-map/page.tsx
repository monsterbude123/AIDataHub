"use client";

/**
 * 数据地图页
 * 页面路径: /governance/data-map
 */

import { useState, useMemo, useCallback } from "react";
import { Card, Checkbox, Input, Tag, Button, Space, Modal, Table, Breadcrumb, Empty } from "antd";
import { Search, Filter, Download, Eye, X } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, SensitivityBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockDataAssets, filterDataAssets } from "@/services/mock/data-asset";
import {
  DATA_LAYER_LABELS,
  ACQUISITION_METHOD_LABELS,
  RESOURCE_LOCATION_LABELS,
  type DataAsset,
} from "@/types/data-asset";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据治理", href: ROUTES.GOVERNANCE },
  { title: "数据地图" },
];

/**
 * 数据地图页面组件
 */
export default function DataMapPage() {
  const [filters, setFilters] = useState<{
    layers: string[];
    acquisitionMethods: string[];
    locations: string[];
    sensitivityLevels: string[];
    keyword: string;
  }>({
    layers: [],
    acquisitionMethods: [],
    locations: [],
    sensitivityLevels: [],
    keyword: "",
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null);

  /**
   * 过滤后的数据资产列表
   */
  const filteredAssets = useMemo(() => {
    return filterDataAssets(filters);
  }, [filters]);

  /**
   * 获取已选筛选条件数量
   */
  const selectedFilterCount = useMemo(() => {
    return (
      filters.layers.length +
      filters.acquisitionMethods.length +
      filters.locations.length +
      filters.sensitivityLevels.length
    );
  }, [filters]);

  /**
   * 处理筛选条件变化
   */
  const handleFilterChange = (
    filterKey: keyof typeof filters,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: checked
        ? [...prev[filterKey], value]
        : prev[filterKey].filter((v) => v !== value),
    }));
  };

  /**
   * 清空筛选条件
   */
  const clearFilters = () => {
    setFilters({
      layers: [],
      acquisitionMethods: [],
      locations: [],
      sensitivityLevels: [],
      keyword: "",
    });
  };

  /**
   * 移除单个筛选条件
   */
  const removeFilter = (filterKey: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey].filter((v) => v !== value),
    }));
  };

  /**
   * 查看资产详情
   */
  const handleViewDetail = (asset: DataAsset) => {
    setSelectedAsset(asset);
    setDetailModalOpen(true);
  };

  /**
   * 渲染筛选组
   */
  const renderFilterGroup = (
    title: string,
    filterKey: keyof typeof filters,
    options: Record<string, string>
  ) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 500, marginBottom: 8, color: "#1E293B" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {Object.entries(options).map(([value, label]) => (
          <Checkbox
            key={value}
            checked={filters[filterKey].includes(value)}
            onChange={(e) => handleFilterChange(filterKey, value, e.target.checked)}
          >
            {label}
          </Checkbox>
        ))}
      </div>
    </div>
  );

  /**
   * 渲染已选条件标签
   */
  const renderSelectedTags = () => {
    const tags: React.ReactNode[] = [];

    filters.layers.forEach((v) => {
      tags.push(
        <Tag
          key={`layer-${v}`}
          closable
          onClose={() => removeFilter("layers", v)}
          style={{ marginBottom: 4 }}
        >
          {DATA_LAYER_LABELS[v as keyof typeof DATA_LAYER_LABELS]}
        </Tag>
      );
    });

    filters.acquisitionMethods.forEach((v) => {
      tags.push(
        <Tag
          key={`method-${v}`}
          closable
          onClose={() => removeFilter("acquisitionMethods", v)}
          style={{ marginBottom: 4 }}
        >
          {ACQUISITION_METHOD_LABELS[v as keyof typeof ACQUISITION_METHOD_LABELS]}
        </Tag>
      );
    });

    filters.locations.forEach((v) => {
      tags.push(
        <Tag
          key={`location-${v}`}
          closable
          onClose={() => removeFilter("locations", v)}
          style={{ marginBottom: 4 }}
        >
          {RESOURCE_LOCATION_LABELS[v as keyof typeof RESOURCE_LOCATION_LABELS]}
        </Tag>
      );
    });

    filters.sensitivityLevels.forEach((v) => {
      tags.push(
        <Tag
          key={`sensitivity-${v}`}
          closable
          onClose={() => removeFilter("sensitivityLevels", v)}
          style={{ marginBottom: 4 }}
        >
          {v === "public" ? "公开" : v === "internal" ? "内部" : v === "secret" ? "秘密" : "机密"}
        </Tag>
      );
    });

    return tags;
  };

  /**
   * 渲染数据资产卡片
   */
  const renderAssetCard = (asset: DataAsset) => (
    <Card
      key={asset.id}
      hoverable
      style={{ marginBottom: 16 }}
      onClick={() => handleViewDetail(asset)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          {/* 标题和分级 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
              {asset.name}
            </span>
            <SensitivityBadge level={asset.sensitivityLevel} />
          </div>

          {/* 路径 */}
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
            <Breadcrumb
              separator="/"
              items={asset.path.split("/").map((item, index, arr) => ({
                title: index === arr.length - 1 ? <span style={{ color: "#2563EB" }}>{item}</span> : item,
              }))}
            />
          </div>

          {/* 数据量和更新时间 */}
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
            <span>数据量: {asset.rowCount.toLocaleString()} 行</span>
            <span>大小: {asset.dataSize}</span>
            <span>更新: {asset.updatedAt}</span>
          </div>

          {/* 标签 */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {asset.tags.map((tag) => (
              <Tag key={tag} style={{ marginBottom: 4 }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <Space direction="vertical" align="end">
          <Button
            type="text"
            icon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(asset);
            }}
          >
            详情
          </Button>
          <Button
            type="text"
            icon={<Download size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              // 导出功能
            }}
          >
            导出
          </Button>
        </Space>
      </div>
    </Card>
  );

  return (
    <PageLayout title="数据地图">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 搜索和操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Input
            placeholder="搜索数据资产名称、路径、标签..."
            prefix={<Search size={14} />}
            value={filters.keyword}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
            style={{ width: 400 }}
            allowClear
          />
          <Space>
            {selectedFilterCount > 0 && (
              <Button onClick={clearFilters}>
                清空筛选 ({selectedFilterCount})
              </Button>
            )}
            <Button type="primary" icon={<Download size={14} />}>
              导出台账
            </Button>
          </Space>
        </div>

        {/* 已选条件标签 */}
        {selectedFilterCount > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 4, flexWrap: "wrap" }}>
            <span style={{ color: "#6B7280", marginRight: 8 }}>已选条件:</span>
            {renderSelectedTags()}
          </div>
        )}
      </Card>

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧筛选栏 */}
        <Card
          title={
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter size={16} />
              筛选条件
            </span>
          }
          style={{ width: 240, flexShrink: 0 }}
          bodyStyle={{ padding: 16 }}
        >
          {renderFilterGroup("数据分层", "layers", DATA_LAYER_LABELS)}
          {renderFilterGroup("获取方式", "acquisitionMethods", ACQUISITION_METHOD_LABELS)}
          {renderFilterGroup("资源位置", "locations", RESOURCE_LOCATION_LABELS)}
          {renderFilterGroup("分级分类", "sensitivityLevels", {
            public: "公开",
            internal: "内部",
            secret: "秘密",
            confidential: "机密",
          })}
        </Card>

        {/* 右侧数据资产列表 */}
        <Card
          title={`数据资产 (${filteredAssets.length})`}
          style={{ flex: 1 }}
          bodyStyle={{ padding: 16, maxHeight: "calc(100vh - 320px)", overflow: "auto" }}
        >
          {filteredAssets.length > 0 ? (
            filteredAssets.map(renderAssetCard)
          ) : (
            <Empty description="没有找到匹配的数据资产" />
          )}
        </Card>
      </div>

      {/* 资产详情弹窗 */}
      <Modal
        title={selectedAsset?.name}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedAsset(null);
        }}
        footer={null}
        width={800}
      >
        {selectedAsset && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ color: "#6B7280" }}>路径:</span> {selectedAsset.path}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>数据分层:</span>{" "}
                  {DATA_LAYER_LABELS[selectedAsset.layer]}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>数据量:</span>{" "}
                  {selectedAsset.rowCount.toLocaleString()} 行
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>大小:</span> {selectedAsset.dataSize}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>更新时间:</span> {selectedAsset.updatedAt}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>分级分类:</span>{" "}
                  <SensitivityBadge level={selectedAsset.sensitivityLevel} />
                </div>
              </div>
            </Card>

            {/* 字段列表 */}
            {selectedAsset.fields && selectedAsset.fields.length > 0 && (
              <Card title="字段列表" size="small" style={{ marginBottom: 16 }}>
                <Table
                  dataSource={selectedAsset.fields}
                  columns={[
                    { title: "字段名", dataIndex: "name", key: "name" },
                    { title: "类型", dataIndex: "type", key: "type" },
                    { title: "描述", dataIndex: "description", key: "description" },
                  ]}
                  rowKey="name"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}

            {/* 标签 */}
            <Card title="标签" size="small">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selectedAsset.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}