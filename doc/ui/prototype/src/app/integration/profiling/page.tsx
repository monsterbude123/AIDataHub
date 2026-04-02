"use client";

/**
 * 数据探查页
 * 页面路径: /integration/profiling
 */

import { useState, useMemo } from "react";
import { Card, Table, Button, Input, Select, Progress, Tag, InputNumber, message, Tabs, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { Search, Play, Download, Edit, Save, RefreshCw, AlertTriangle, MoreHorizontal } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree, KPICardGrid, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockDataSources } from "@/services/mock/data-integration";
import type { DirectoryTreeNode } from "@/components/ui";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据集成", href: ROUTES.DATA_INTEGRATION },
  { title: "数据探查" },
];

/**
 * Mock 探查字段数据
 */
const mockProfilingFields = [
  { id: "f1", name: "user_id", type: "bigint", description: "", nullRate: 0, valueRate: 100, standardDataElement: null, dictionary: null, sensitivity: "internal" },
  { id: "f2", name: "user_name", type: "varchar(100)", description: "", nullRate: 2.5, valueRate: 97.5, standardDataElement: null, dictionary: null, sensitivity: "internal" },
  { id: "f3", name: "email", type: "varchar(200)", description: "", nullRate: 15, valueRate: 85, standardDataElement: "email", dictionary: null, sensitivity: "secret" },
  { id: "f4", name: "phone", type: "varchar(20)", description: "", nullRate: 30, valueRate: 70, standardDataElement: "phone_number", dictionary: null, sensitivity: "secret" },
  { id: "f5", name: "create_time", type: "datetime", description: "", nullRate: 0, valueRate: 100, standardDataElement: "timestamp", dictionary: null, sensitivity: "public" },
  { id: "f6", name: "status", type: "int", description: "", nullRate: 1, valueRate: 99, standardDataElement: null, dictionary: "status_dict", sensitivity: "public" },
];

/**
 * Mock 样本数据
 */
const mockSampleData = [
  { user_id: 1001, user_name: "张三", email: "zhangsan@example.com", phone: "13800138001", create_time: "2024-01-01 10:00:00", status: 1 },
  { user_id: 1002, user_name: "李四", email: null, phone: "13900139002", create_time: "2024-01-02 11:00:00", status: 0 },
  { user_id: 1003, user_name: "王五", email: "wangwu@example.com", phone: null, create_time: "2024-01-03 12:00:00", status: 1 },
  { user_id: 1004, user_name: null, email: "zhaoliu@example.com", phone: "13700137004", create_time: "2024-01-04 13:00:00", status: 1 },
  { user_id: 1005, user_name: "孙七", email: "sunqi@example.com", phone: "13600136005", create_time: "2024-01-05 14:00:00", status: 0 },
];

/**
 * 数据探查页面组件
 */
export default function DataProfilingPage() {
  const [selectedSource, setSelectedSource] = useState<string>("ds-001");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [profiling, setProfiling] = useState(false);
  const [profilingProgress, setProfilingProgress] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldDescriptions, setFieldDescriptions] = useState<Record<string, string>>({});

  /**
   * 数据源树数据
   */
  const sourceTreeData: DirectoryTreeNode[] = useMemo(() => {
    return [
      { key: "all", title: "全部数据源", isLeaf: false },
      ...mockDataSources.map((ds) => ({
        key: ds.id,
        title: ds.name,
        isLeaf: true,
      })),
    ];
  }, []);

  /**
   * 过滤后的字段列表
   */
  const filteredFields = useMemo(() => {
    if (!searchKeyword) return mockProfilingFields;
    return mockProfilingFields.filter((f) =>
      f.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [searchKeyword]);

  /**
   * KPI 数据
   */
  const kpiData = [
    { title: "资源总量", value: "1,250,000", unit: "行", icon: <Search size={20} /> },
    { title: "空值率", value: "8.2", unit: "%", icon: <AlertTriangle size={20} />, trend: "down" as const, trendValue: 2.1 },
    { title: "有值率", value: "91.8", unit: "%", icon: <Save size={20} />, trend: "up" as const, trendValue: 2.1 },
    { title: "增量数据", value: "15,000", unit: "行", icon: <RefreshCw size={20} /> },
  ];

  /**
   * 处理发起探查
   */
  const handleStartProfiling = () => {
    setProfiling(true);
    setProfilingProgress(0);
    message.loading({ content: "正在执行数据探查...", key: "profiling" });

    // 模拟进度
    const interval = setInterval(() => {
      setProfilingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProfiling(false);
          message.success({ content: "探查完成!", key: "profiling" });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  /**
   * 处理保存元数据
   */
  const handleSaveMetadata = () => {
    message.success("元数据保存成功!");
  };

  /**
   * 字段表格列定义
   */
  const fieldColumns = [
    {
      title: "字段名",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "数据类型",
      dataIndex: "type",
      key: "type",
      width: 120,
    },
    {
      title: "空值率",
      dataIndex: "nullRate",
      key: "nullRate",
      width: 100,
      render: (value: number) => (
        <span style={{ color: value > 20 ? "#F59E0B" : "#10B981" }}>
          {value}%
          {value > 20 && <AlertTriangle size={12} style={{ marginLeft: 4, color: "#F59E0B" }} />}
        </span>
      ),
    },
    {
      title: "有值率",
      dataIndex: "valueRate",
      key: "valueRate",
      width: 100,
      render: (value: number) => <span style={{ color: "#10B981" }}>{value}%</span>,
    },
    {
      title: "描述",
      dataIndex: "id",
      key: "description",
      width: 200,
      render: (id: string, record: { name: string; description: string }) =>
        editingField === id ? (
          <Input
            defaultValue={fieldDescriptions[id] || record.description}
            size="small"
            onBlur={(e) => {
              setFieldDescriptions((prev) => ({ ...prev, [id]: e.target.value }));
              setEditingField(null);
            }}
            autoFocus
          />
        ) : (
          <span
            onClick={() => setEditingField(id)}
            style={{ cursor: "pointer", color: fieldDescriptions[id] ? "#2563EB" : "#6B7280" }}
          >
            {fieldDescriptions[id] || record.description || "点击编辑"}
          </span>
        ),
    },
    {
      title: "关联标准数据元",
      dataIndex: "standardDataElement",
      key: "standardDataElement",
      width: 150,
      render: (value: string | null) =>
        editingField === value ? (
          <Select size="small" options={[{ value: "email", label: "邮箱" }, { value: "phone_number", label: "手机号" }]} />
        ) : (
          value ? <Tag>{value}</Tag> : <span style={{ color: "#6B7280" }}>未关联</span>
        ),
    },
    {
      title: "关联字典",
      dataIndex: "dictionary",
      key: "dictionary",
      width: 120,
      render: (value: string | null) =>
        value ? <Tag color="blue">{value}</Tag> : <span style={{ color: "#6B7280" }}>未关联</span>,
    },
    {
      title: "分级分类",
      dataIndex: "sensitivity",
      key: "sensitivity",
      width: 100,
      render: (value: string) => (
        <Tag color={value === "secret" ? "red" : value === "internal" ? "orange" : "green"}>
          {value === "secret" ? "秘密" : value === "internal" ? "内部" : "公开"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      render: (_: unknown, record: { id: string }) => (
        <Button type="text" icon={<Edit size={14} />} onClick={() => setEditingField(record.id)} />
      ),
    },
  ];

  /**
   * 样本数据表格列
   */
  const sampleColumns = mockProfilingFields.map((field) => ({
    title: field.name,
    dataIndex: field.name,
    key: field.name,
    ellipsis: true,
  }));

  /**
   * 处理数据源选中
   */
  const handleSourceSelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedSource(keys[0] as string);
    }
  };

  return (
    <PageLayout title="数据探查">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 主体布局 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧数据源树 */}
        <DirectoryTree
          treeData={sourceTreeData}
          onSelect={handleSourceSelect}
          showSearch
          width={240}
          collapsible
          defaultSelectedKeys={[selectedSource]}
        />

        {/* 右侧内容区 */}
        <div style={{ flex: 1 }}>
          {/* KPI 卡片 */}
          <KPICardGrid data={kpiData} columns={4} />

          {/* 操作栏 */}
          <Card style={{ marginTop: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Input
                placeholder="搜索字段名称..."
                prefix={<Search size={14} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Space>
                <Button
                  type="primary"
                  icon={<Play size={14} />}
                  onClick={handleStartProfiling}
                  loading={profiling}
                >
                  开始探查
                </Button>
                <Button icon={<Save size={14} />} onClick={handleSaveMetadata}>
                  保存元数据
                </Button>
                <Button icon={<Download size={14} />}>
                  导出报告
                </Button>
              </Space>
            </div>

            {/* 探查进度 */}
            {profiling && (
              <div style={{ marginTop: 16 }}>
                <Progress percent={profilingProgress} status="active" />
              </div>
            )}
          </Card>

          {/* 数据区域 - Tabs */}
          <Tabs
            items={[
              {
                key: "sample",
                label: "数据样本",
                children: (
                  <Card>
                    <Table
                      dataSource={mockSampleData}
                      columns={sampleColumns}
                      rowKey="user_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 800 }}
                      size="small"
                    />
                  </Card>
                ),
              },
              {
                key: "metadata",
                label: "元数据编辑",
                children: (
                  <Card>
                    <Table
                      dataSource={filteredFields}
                      columns={fieldColumns}
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: 1000 }}
                      size="small"
                      rowClassName={(record) =>
                        record.nullRate > 20 ? "high-null-rate-row" : ""
                      }
                    />
                  </Card>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 高空值率行样式 */}
      <style jsx global>{`
        .high-null-rate-row {
          background-color: #FEF3C7 !important;
        }
      `}</style>
    </PageLayout>
  );
}