"use client";

import { useState } from "react";
import { Card, Table, Button, Space, Tree, Input, Select, Tag, message, Tabs, Checkbox, Modal, Form, Radio } from "antd";
import { Play, Save, Download, Search, Database, RefreshCw, Plus, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, DirectoryTree } from "@/components/ui";
import { ROUTES } from "@/constants";
import { exportQueryResult, type ExportFormat } from "@/services/export";
import type { DirectoryTreeNode } from "@/components/ui";

const BREADCRUMB_ITEMS = [{ title: "自助数据分析", href: "/analytics" }, { title: "自助查询构建" }];

const mockTableTree: DirectoryTreeNode[] = [
  { key: "all", title: "全部数据源", isLeaf: false },
  { key: "customer_db", title: "客户数据库", isLeaf: false, children: [
    { key: "customer_info", title: "customer_info", isLeaf: true },
    { key: "customer_order", title: "customer_order", isLeaf: true },
  ]},
  { key: "order_db", title: "订单数据库", isLeaf: false, children: [
    { key: "order_detail", title: "order_detail", isLeaf: true },
    { key: "order_item", title: "order_item", isLeaf: true },
  ]},
];

const mockFields = [
  { key: "customer_id", title: "customer_id", type: "BIGINT", selected: false },
  { key: "customer_name", title: "customer_name", type: "VARCHAR", selected: false },
  { key: "email", title: "email", type: "VARCHAR", selected: false },
  { key: "phone", title: "phone", type: "VARCHAR", selected: false },
  { key: "create_time", title: "create_time", type: "DATETIME", selected: false },
];

const mockConditions = [
  { field: "customer_id", operator: "=", value: "1001" },
];

const mockResults = [
  { customer_id: 1001, customer_name: "张三", email: "zhangsan@example.com", phone: "13800138001", create_time: "2024-01-01" },
  { customer_id: 1002, customer_name: "李四", email: "lisi@example.com", phone: "13900139002", create_time: "2024-01-02" },
];

export default function AdHocQueryPage() {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [conditions, setConditions] = useState(mockConditions);
  const [results, setResults] = useState<typeof mockResults>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("xlsx");
  const [exportFilename, setExportFilename] = useState("");

  const resultColumns = results.length > 0
    ? Object.keys(results[0]).map((k) => ({ title: k, dataIndex: k, key: k }))
    : [];

  const handleExecute = () => {
    message.loading({ content: "执行查询中...", key: "query" });
    setTimeout(() => {
      setResults(mockResults);
      message.success({ content: "查询完成，返回 2 条记录", key: "query" });
    }, 1000);
  };

  const handleExport = () => {
    if (results.length === 0) {
      message.warning("没有可导出的数据");
      return;
    }
    setExportFilename("");
    setExportFormat("xlsx");
    setExportModalOpen(true);
  };

  const handleExportConfirm = () => {
    exportQueryResult(results, {
      format: exportFormat,
      filename: exportFilename || undefined,
    });
    message.success(`已导出 ${results.length} 条记录为 ${exportFormat.toUpperCase()} 文件`);
    setExportModalOpen(false);
  };

  return (
    <PageLayout title="自助查询构建">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧表字段树 */}
        <Card style={{ width: 280 }} title="数据资源" extra={<Search size={14} />}>
          <Input placeholder="搜索表/字段..." prefix={<Search size={12} />} style={{ marginBottom: 8 }} size="small" />
          <Tree
            treeData={[
              { title: "customer_info", key: "tbl-customer", children: mockFields.map((f) => ({ title: `${f.title} (${f.type})`, key: f.key })) },
              { title: "order_detail", key: "tbl-order", children: [{ title: "order_id (BIGINT)", key: "order_id" }] },
            ]}
            checkable
            checkedKeys={selectedFields}
            onCheck={(keys) => setSelectedFields(keys as string[])}
          />
        </Card>

        {/* 中间选择区 */}
        <div style={{ flex: 1 }}>
          <Card title="已选字段" style={{ marginBottom: 16 }} extra={<Button size="small" onClick={() => setSelectedFields([])}>清空</Button>}>
            <Space wrap>
              {selectedFields.length > 0 ? selectedFields.map((f) => (
                <Tag key={f} closable onClose={() => setSelectedFields(selectedFields.filter((k) => k !== f))}>{f}</Tag>
              )) : <span style={{ color: "#6B7280" }}>请从左侧选择字段</span>}
            </Space>
          </Card>

          <Card title="查询条件" style={{ marginBottom: 16 }} extra={<Button size="small" icon={<Plus size={12} />}>添加条件</Button>}>
            <Table
              dataSource={conditions}
              columns={[
                { title: "字段", dataIndex: "field", key: "field" },
                { title: "操作符", dataIndex: "operator", key: "operator" },
                { title: "值", dataIndex: "value", key: "value" },
                { title: "操作", key: "actions", render: () => <Button type="link" size="small" danger icon={<Trash2 size={12} />} /> },
              ]}
              rowKey="field"
              pagination={false}
              size="small"
            />
          </Card>

          <Card>
            <Space>
              <Button type="primary" icon={<Play size={14} />} onClick={handleExecute}>执行查询</Button>
              <Button icon={<Save size={14} />} onClick={() => setSaveModalOpen(true)}>保存查询</Button>
              <Button icon={<Download size={14} />} disabled={results.length === 0} onClick={handleExport}>导出结果</Button>
            </Space>
          </Card>

          <Card title="查询结果" style={{ marginTop: 16 }} extra={results.length > 0 && <span>共 {results.length} 条记录</span>}>
            {results.length > 0 ? (
              <Table dataSource={results} columns={resultColumns} rowKey="customer_id" pagination={{ pageSize: 10 }} />
            ) : (
              <div style={{ padding: 48, textAlign: "center", color: "#6B7280" }}>执行查询后显示结果</div>
            )}
          </Card>
        </div>
      </div>

      <Modal title="保存查询" open={saveModalOpen} onCancel={() => setSaveModalOpen(false)} onOk={() => { message.success("保存成功"); setSaveModalOpen(false); }}>
        <Form layout="vertical">
          <Form.Item name="name" label="查询名称" rules={[{ required: true }]}><Input placeholder="请输入查询名称" /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} placeholder="查询描述" /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title="导出查询结果"
        open={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        onOk={handleExportConfirm}
        okText="导出"
      >
        <Form layout="vertical">
          <Form.Item label="导出格式">
            <Radio.Group value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
              <Radio value="xlsx">
                <Space>
                  <FileSpreadsheet size={16} />
                  Excel (.xlsx)
                </Space>
              </Radio>
              <Radio value="csv">
                <Space>
                  <FileText size={16} />
                  CSV (.csv)
                </Space>
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="文件名（可选）">
            <Input
              placeholder="默认: query_result_日期"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
            />
          </Form.Item>
          <div style={{ color: "#6B7280", fontSize: 12 }}>
            将导出 {results.length} 条记录
          </div>
        </Form>
      </Modal>
    </PageLayout>
  );
}