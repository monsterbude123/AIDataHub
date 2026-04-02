"use client";

/**
 * Spark SQL 开发页
 * 页面路径: /data-integration/sql-dev
 */

import { useState, useMemo, useCallback } from "react";
import { Card, Table, Button, Input, Select, InputNumber, Tabs, Tag, Space, message, Dropdown, Tree, Empty, List, Typography } from "antd";
import type { TreeDataNode } from "antd";
import { Play, PlayCircle, Save, Settings, Download, Search, RefreshCw, Clock, ChevronRight } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockDataSources } from "@/services/mock/data-integration";
import type { DirectoryTreeNode } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据集成", href: ROUTES.DATA_INTEGRATION },
  { title: "SQL 开发工作台" },
];

/**
 * Mock 表资源树数据
 */
const mockTableTree: TreeDataNode[] = [
  {
    title: "生产订单数据库",
    key: "ds-001",
    children: [
      { title: "orders", key: "ds-001-orders", isLeaf: true },
      { title: "products", key: "ds-001-products", isLeaf: true },
      { title: "customers", key: "ds-001-customers", isLeaf: true },
    ],
  },
  {
    title: "客户管理系统",
    key: "ds-002",
    children: [
      { title: "users", key: "ds-002-users", isLeaf: true },
      { title: "profiles", key: "ds-002-profiles", isLeaf: true },
      { title: "activities", key: "ds-002-activities", isLeaf: true },
    ],
  },
  {
    title: "日志数据湖",
    key: "ds-004",
    children: [
      { title: "system_logs", key: "ds-004-system_logs", isLeaf: true },
      { title: "user_behaviors", key: "ds-004-user_behaviors", isLeaf: true },
      { title: "access_records", key: "ds-004-access_records", isLeaf: true },
    ],
  },
];

/**
 * Mock 执行历史
 */
const mockExecutionHistory = [
  { id: "exec-001", sql: "SELECT * FROM orders LIMIT 10", time: "2024-01-20 10:00:00", status: "success", duration: "2.5s", rows: 10 },
  { id: "exec-002", sql: "SELECT COUNT(*) FROM products", time: "2024-01-20 10:05:00", status: "success", duration: "1.2s", rows: 1 },
  { id: "exec-003", sql: "SELECT * FROM invalid_table", time: "2024-01-20 10:10:00", status: "failed", duration: "0.5s", rows: 0 },
  { id: "exec-004", sql: "JOIN orders AND customers", time: "2024-01-20 10:15:00", status: "success", duration: "15.3s", rows: 500 },
];

/**
 * Mock 执行日志
 */
const mockExecutionLogs = [
  { time: "10:00:00", level: "INFO", message: "开始执行 Spark SQL 任务" },
  { time: "10:00:01", level: "INFO", message: "解析 SQL 语句..." },
  { time: "10:00:02", level: "INFO", message: "生成执行计划..." },
  { time: "10:00:03", level: "INFO", message: "分配执行器资源: 2G 内存, 2 核" },
  { time: "10:00:05", level: "INFO", message: "开始数据读取..." },
  { time: "10:00:08", level: "INFO", message: "数据读取完成, 共 1000 行" },
  { time: "10:00:10", level: "INFO", message: "执行完成, 返回结果 10 行" },
];

/**
 * Spark SQL 开发页面组件
 */
export default function SqlDevPage() {
  const [modelName, setModelName] = useState("");
  const [modelCategory, setModelCategory] = useState("");
  const [executorMemory, setExecutorMemory] = useState("2G");
  const [executorCores, setExecutorCores] = useState(2);
  const [executorCount, setExecutorCount] = useState(2);
  const [sqlContent, setSqlContent] = useState("SELECT * FROM orders LIMIT 1000");
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState("result");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tablePreviewData, setTablePreviewData] = useState<Record<string, unknown>[] | null>(null);
  const [resultData, setResultData] = useState<Record<string, unknown>[] | null>(null);

  /**
   * 处理测试执行
   */
  const handleTestExecute = async () => {
    setExecuting(true);
    setActiveTab("log");
    message.loading({ content: "测试执行中...", key: "exec" });

    // 模拟执行
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResultData([
      { order_id: 1001, product_name: "产品A", quantity: 10, price: 100.00, customer: "张三" },
      { order_id: 1002, product_name: "产品B", quantity: 5, price: 200.00, customer: "李四" },
      { order_id: 1003, product_name: "产品C", quantity: 3, price: 150.00, customer: "王五" },
    ]);

    setExecuting(false);
    setActiveTab("result");
    message.success({ content: "测试执行完成!", key: "exec" });
  };

  /**
   * 处理完全执行
   */
  const handleFullExecute = async () => {
    setExecuting(true);
    setActiveTab("log");
    message.loading({ content: "完全执行中...", key: "exec" });

    // 模拟执行
    await new Promise((resolve) => setTimeout(resolve, 5000));

    setResultData([
      { order_id: 1001, product_name: "产品A", quantity: 10, price: 100.00, customer: "张三" },
      { order_id: 1002, product_name: "产品B", quantity: 5, price: 200.00, customer: "李四" },
      { order_id: 1003, product_name: "产品C", quantity: 3, price: 150.00, customer: "王五" },
      { order_id: 1004, product_name: "产品D", quantity: 8, price: 80.00, customer: "孙七" },
      { order_id: 1005, product_name: "产品E", quantity: 2, price: 300.00, customer: "周八" },
    ]);

    setExecuting(false);
    setActiveTab("result");
    message.success({ content: "完全执行完成!", key: "exec" });
  };

  /**
   * 处理保存模型
   */
  const handleSaveModel = () => {
    if (!modelName) {
      message.error("请输入模型名称");
      return;
    }
    message.success("模型保存成功!");
  };

  /**
   * 处理导出结果
   */
  const handleExport = () => {
    message.success("导出 CSV 成功!");
  };

  /**
   * 处理表节点点击
   */
  const handleTableClick = (key: string) => {
    setSelectedTable(key);
    // 模拟预览数据
    setTablePreviewData([
      { id: 1, name: "示例数据1", value: 100 },
      { id: 2, name: "示例数据2", value: 200 },
      { id: 3, name: "示例数据3", value: 300 },
    ]);
  };

  /**
   * 处理表拖拽到编辑器
   */
  const handleTableDrag = (tableName: string) => {
    setSqlContent((prev) => prev + `\nSELECT * FROM ${tableName}`);
  };

  /**
   * 内存选项
   */
  const memoryOptions = [
    { value: "1G", label: "1G" },
    { value: "2G", label: "2G" },
    { value: "4G", label: "4G" },
    { value: "8G", label: "8G" },
  ];

  /**
   * 结果表格列
   */
  const resultColumns = resultData
    ? Object.keys(resultData[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
        ellipsis: true,
      }))
    : [];

  /**
   * 执行历史列
   */
  const historyColumns = [
    { title: "执行时间", dataIndex: "time", key: "time", width: 180 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) =>
        status === "success" ? (
          <Tag color="green">成功</Tag>
        ) : (
          <Tag color="red">失败</Tag>
        ),
    },
    { title: "耗时", dataIndex: "duration", key: "duration", width: 80 },
    { title: "返回行数", dataIndex: "rows", key: "rows", width: 100 },
    {
      title: "SQL",
      dataIndex: "sql",
      key: "sql",
      ellipsis: true,
      render: (sql: string) => (
        <Typography.Text style={{ maxWidth: 200 }} ellipsis title={sql}>
          {sql}
        </Typography.Text>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      render: () => <Button type="link" size="small">查看</Button>,
    },
  ];

  return (
    <PageLayout title="SQL 开发工作台">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧表资源树 */}
        <Card
          title={
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Search size={16} />
              表资源
            </span>
          }
          style={{ width: 280 }}
          styles={{ body: { padding: 8 } }}
        >
          <Input
            placeholder="搜索表名称..."
            prefix={<Search size={14} />}
            size="small"
            style={{ marginBottom: 8 }}
            allowClear
          />
          <Tree
            treeData={mockTableTree}
            defaultExpandAll
            onSelect={(keys) => {
              if (keys.length > 0) {
                const key = keys[0] as string;
                if (key.includes("-")) {
                  handleTableClick(key);
                }
              }
            }}
            showIcon
            icon={<ChevronRight size={12} />}
          />

          {/* 表预览 */}
          {selectedTable && tablePreviewData && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                {selectedTable.split("-").pop()} 预览
              </div>
              <Table
                dataSource={tablePreviewData}
                columns={Object.keys(tablePreviewData[0]).map((k) => ({
                  title: k,
                  dataIndex: k,
                  key: k,
                }))}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          )}
        </Card>

        {/* 右侧编辑区域 */}
        <div style={{ flex: 1 }}>
          {/* 模型信息 */}
          <Card style={{ marginBottom: 16 }}>
            <Space size="large">
              <div>
                <span style={{ marginRight: 8, color: "#6B7280" }}>模型名称:</span>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="输入模型名称"
                  style={{ width: 200 }}
                />
              </div>
              <div>
                <span style={{ marginRight: 8, color: "#6B7280" }}>模型分类:</span>
                <Select
                  value={modelCategory}
                  onChange={setModelCategory}
                  placeholder="选择分类"
                  options={[
                    { value: "report", label: "报表查询" },
                    { value: "analysis", label: "数据分析" },
                    { value: "export", label: "数据导出" },
                  ]}
                  style={{ width: 150 }}
                />
              </div>
              <div>
                <span style={{ marginRight: 8, color: "#6B7280" }}>执行器内存:</span>
                <Select
                  value={executorMemory}
                  onChange={setExecutorMemory}
                  options={memoryOptions}
                  style={{ width: 80 }}
                />
              </div>
              <div>
                <span style={{ marginRight: 8, color: "#6B7280" }}>执行器核数:</span>
                <InputNumber
                  value={executorCores}
                  onChange={(v) => setExecutorCores(v ?? 2)}
                  min={1}
                  max={16}
                  style={{ width: 80 }}
                />
              </div>
              <div>
                <span style={{ marginRight: 8, color: "#6B7280" }}>执行器个数:</span>
                <InputNumber
                  value={executorCount}
                  onChange={(v) => setExecutorCount(v ?? 2)}
                  min={1}
                  max={10}
                  style={{ width: 80 }}
                />
              </div>
            </Space>
          </Card>

          {/* SQL 编辑器 */}
          <Card
            title="SQL 编辑器"
            style={{ marginBottom: 16 }}
            extra={
              <Dropdown
                menu={{
                  items: [
                    { key: "temp-view", label: "创建临时视图" },
                    { key: "udf", label: "选择自定义函数" },
                    { key: "output-config", label: "输出配置" },
                  ],
                }}
              >
                <Button type="text" icon={<Settings size={14} />}>
                  高级配置
                </Button>
              </Dropdown>
            }
          >
            <textarea
              value={sqlContent}
              onChange={(e) => setSqlContent(e.target.value)}
              style={{
                width: "100%",
                height: 200,
                fontFamily: "monospace",
                fontSize: 14,
                padding: 16,
                border: "1px solid #E5E7EB",
                borderRadius: 4,
                resize: "vertical",
              }}
              placeholder="输入 Spark SQL 语句..."
            />

            {/* 执行控制栏 */}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
              <Space>
                <Button
                  type="primary"
                  icon={<Play size={14} />}
                  onClick={handleTestExecute}
                  loading={executing}
                >
                  测试执行 (采样1000行)
                </Button>
                <Button
                  icon={<PlayCircle size={14} />}
                  onClick={handleFullExecute}
                  loading={executing}
                >
                  完全执行
                </Button>
                <Button icon={<Save size={14} />} onClick={handleSaveModel}>
                  保存模型
                </Button>
              </Space>
              <Button icon={<RefreshCw size={14} />}>
                清空
              </Button>
            </div>
          </Card>

          {/* 结果区域 */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "result",
                label: "结果预览",
                children: (
                  <Card>
                    {resultData ? (
                      <>
                        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                          <span>返回 {resultData.length} 行</span>
                          <Button icon={<Download size={14} />} onClick={handleExport}>
                            导出 CSV
                          </Button>
                        </div>
                        <Table
                          dataSource={resultData}
                          columns={resultColumns}
                          rowKey={(record) => JSON.stringify(record)}
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 800 }}
                          size="small"
                        />
                      </>
                    ) : (
                      <Empty description="请执行 SQL 查看结果" />
                    )}
                  </Card>
                ),
              },
              {
                key: "log",
                label: "执行日志",
                children: (
                  <Card styles={{ body: { padding: 0 } }}>
                    <List
                      dataSource={mockExecutionLogs}
                      renderItem={(item) => (
                        <List.Item style={{ padding: 8, borderBottom: "1px solid #E5E7EB" }}>
                          <div style={{ display: "flex", gap: 16, fontFamily: "monospace", fontSize: 12 }}>
                            <span style={{ color: "#6B7280" }}>{item.time}</span>
                            <Tag color={item.level === "ERROR" ? "red" : item.level === "WARN" ? "orange" : "blue"}>
                              {item.level}
                            </Tag>
                            <span>{item.message}</span>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                ),
              },
              {
                key: "history",
                label: "历史执行",
                children: (
                  <Card>
                    <Table
                      dataSource={mockExecutionHistory}
                      columns={historyColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                ),
              },
            ]}
          />
        </div>
      </div>
    </PageLayout>
  );
}