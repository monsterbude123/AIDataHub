"use client";

/**
 * 数据血缘分析页
 * 页面路径: /governance/lineage
 */

import { useState } from "react";
import { Card, Button, Input, Select, Space, Table, Tag, Descriptions, Modal, message, Tabs } from "antd";
import { Search, ZoomIn, ZoomOut, Maximize2, Download, RefreshCw, GitBranch, Database, Server, FileText, BarChart2 } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { DirectoryTreeNode } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据治理", href: ROUTES.GOVERNANCE },
  { title: "数据血缘" },
];

/**
 * Mock 表树数据
 */
const mockTableTree: DirectoryTreeNode[] = [
  {
    key: "ds-mysql",
    title: "MySQL-生产库",
    isLeaf: false,
    children: [
      { key: "tbl-customer", title: "customer_info", isLeaf: true },
      { key: "tbl-order", title: "order_detail", isLeaf: true },
      { key: "tbl-product", title: "product_catalog", isLeaf: true },
    ],
  },
  {
    key: "ds-hive",
    title: "Hive-数仓",
    isLeaf: false,
    children: [
      { key: "tbl-dws-customer", title: "dws_customer_360", isLeaf: true },
      { key: "tbl-dws-order", title: "dws_order_summary", isLeaf: true },
    ],
  },
  {
    key: "ds-service",
    title: "数据服务",
    isLeaf: false,
    children: [
      { key: "svc-customer", title: "客户查询API", isLeaf: true },
      { key: "svc-order", title: "订单下载服务", isLeaf: true },
    ],
  },
];

/**
 * Mock 血缘节点
 */
const mockLineageNodes = [
  { id: "tbl-customer", name: "customer_info", type: "source", level: 0 },
  { id: "etl-1", name: "ETL_客户清洗", type: "etl", level: 1 },
  { id: "tbl-dws-customer", name: "dws_customer_360", type: "table", level: 2 },
  { id: "svc-customer", name: "客户查询API", type: "service", level: 3 },
];

/**
 * 数据血缘页面组件
 */
export default function LineagePage() {
  const [selectedTable, setSelectedTable] = useState<string>("tbl-customer");
  const [selectedNode, setSelectedNode] = useState<typeof mockLineageNodes[0] | null>(null);
  const [lineageLevel, setLineageLevel] = useState<"table" | "field">("table");
  const [impactModalOpen, setImpactModalOpen] = useState(false);

  /**
   * 节点类型图标和颜色
   */
  const getNodeStyle = (type: string) => {
    switch (type) {
      case "source":
        return { color: "#2563EB", icon: <Database size={16} /> };
      case "etl":
        return { color: "#F59E0B", icon: <RefreshCw size={16} /> };
      case "table":
        return { color: "#10B981", icon: <FileText size={16} /> };
      case "service":
        return { color: "#8B5CF6", icon: <Server size={16} /> };
      case "report":
        return { color: "#EC4899", icon: <BarChart2 size={16} /> };
      default:
        return { color: "#6B7280", icon: <FileText size={16} /> };
    }
  };

  /**
   * 处理表选中
   */
  const handleTableSelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedTable(keys[0] as string);
    }
  };

  /**
   * 渲染血缘图（简化版本，实际应使用 React-Flow）
   */
  const renderLineageGraph = () => (
    <div style={{ position: "relative", height: 400, background: "#F9FAFB", borderRadius: 8, overflow: "hidden" }}>
      {/* 背景网格 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, #E5E7EB 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* 血缘节点 */}
      {mockLineageNodes.map((node, index) => {
        const style = getNodeStyle(node.type);
        const left = 50 + index * 200;
        const top = 150;

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left,
              top,
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
            }}
            onClick={() => setSelectedNode(node)}
          >
            {/* 连接线 */}
            {index > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: -200,
                  top: "50%",
                  width: 180,
                  height: 2,
                  background: "#D1D5DB",
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid #D1D5DB",
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                  }}
                />
              </div>
            )}

            {/* 节点卡片 */}
            <div
              style={{
                background: "white",
                border: `2px solid ${style.color}`,
                borderRadius: 8,
                padding: 12,
                minWidth: 140,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: style.color }}>
                {style.icon}
                <span style={{ fontWeight: 500 }}>{node.name}</span>
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                类型: {node.type}
              </div>
            </div>
          </div>
        );
      })}

      {/* 工具栏 */}
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
        <Button icon={<ZoomIn size={14} />} />
        <Button icon={<ZoomOut size={14} />} />
        <Button icon={<Maximize2 size={14} />} />
      </div>
    </div>
  );

  /**
   * 上游节点表格
   */
  const upstreamColumns = [
    { title: "节点名称", dataIndex: "name", key: "name" },
    { title: "类型", dataIndex: "type", key: "type" },
    { title: "数据量", dataIndex: "count", key: "count", render: (v: number) => v?.toLocaleString() },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt" },
  ];

  /**
   * 下游节点表格
   */
  const downstreamColumns = [
    { title: "节点名称", dataIndex: "name", key: "name" },
    { title: "类型", dataIndex: "type", key: "type" },
    { title: "影响用户", dataIndex: "users", key: "users" },
    { title: "操作", key: "actions", render: () => <Button type="link" size="small">查看</Button> },
  ];

  return (
    <PageLayout title="数据血缘">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Input
              placeholder="输入表名搜索..."
              prefix={<Search size={14} />}
              style={{ width: 300 }}
            />
            <Select
              value={lineageLevel}
              onChange={setLineageLevel}
              options={[
                { value: "table", label: "表级血缘" },
                { value: "field", label: "字段级血缘" },
              ]}
              style={{ width: 120 }}
            />
          </Space>
          <Space>
            <Button icon={<GitBranch size={14} />} onClick={() => setImpactModalOpen(true)}>
              影响分析
            </Button>
            <Button icon={<Download size={14} />}>
              导出血缘图
            </Button>
            <Button icon={<RefreshCw size={14} />}>
              刷新血缘
            </Button>
          </Space>
        </div>
      </Card>

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧表树 */}
        <Card style={{ width: 280 }} title="数据资源">
          <DirectoryTree
            treeData={mockTableTree}
            onSelect={handleTableSelect}
            showSearch
            defaultSelectedKeys={[selectedTable]}
          />
        </Card>

        {/* 中间血缘图 */}
        <div style={{ flex: 1 }}>
          {renderLineageGraph()}

          {/* 下方节点详情 */}
          {selectedNode && (
            <Card style={{ marginTop: 16 }} title={`节点: ${selectedNode.name}`}>
              <Descriptions column={3} bordered size="small">
                <Descriptions.Item label="节点类型">{selectedNode.type}</Descriptions.Item>
                <Descriptions.Item label="数据量">1,500,000 行</Descriptions.Item>
                <Descriptions.Item label="更新时间">2024-01-20 10:00:00</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </div>

        {/* 右侧属性面板 */}
        <Card style={{ width: 280 }} title="血缘统计">
          <Tabs
            items={[
              {
                key: "upstream",
                label: "上游节点",
                children: (
                  <Table
                    dataSource={[
                      { key: "u1", name: "customer_info", type: "数据表", count: 1500000, updatedAt: "2024-01-20" },
                    ]}
                    columns={upstreamColumns}
                    pagination={false}
                    size="small"
                  />
                ),
              },
              {
                key: "downstream",
                label: "下游节点",
                children: (
                  <Table
                    dataSource={[
                      { key: "d1", name: "客户查询API", type: "数据服务", users: 50 },
                      { key: "d2", name: "客户报表", type: "报表", users: 20 },
                    ]}
                    columns={downstreamColumns}
                    pagination={false}
                    size="small"
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* 影响分析弹窗 */}
      <Modal
        title="影响分析"
        open={impactModalOpen}
        onCancel={() => setImpactModalOpen(false)}
        footer={null}
        width={700}
      >
        <Card>
          <div style={{ marginBottom: 16 }}>
            <strong>修改 customer_info 表结构将影响:</strong>
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#2563EB" }}>3</div>
              <div style={{ color: "#6B7280" }}>数据表</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#F59E0B" }}>2</div>
              <div style={{ color: "#6B7280" }}>ETL任务</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#8B5CF6" }}>5</div>
              <div style={{ color: "#6B7280" }}>数据服务</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#EC4899" }}>8</div>
              <div style={{ color: "#6B7280" }}>报表/指标</div>
            </div>
          </div>
          <Button icon={<Download size={14} />} block>
            导出影响分析报告
          </Button>
        </Card>
      </Modal>
    </PageLayout>
  );
}