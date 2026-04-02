"use client";

import { useState } from "react";
import { Card, Tabs, Select, Button, Space, Table, Tag, message, Row, Col, Statistic } from "antd";
import { Download, Share2, RefreshCw, BarChart2, PieChart, LineChart, Table as TableIcon, Save } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";

const BREADCRUMB_ITEMS = [{ title: "自助数据分析", href: "/analytics" }, { title: "结果可视化" }];

const mockData = [
  { month: "2024-01", orders: 1200, amount: 125000 },
  { month: "2024-02", orders: 1350, amount: 142000 },
  { month: "2024-03", orders: 980, amount: 98000 },
  { month: "2024-04", orders: 1560, amount: 168000 },
  { month: "2024-05", orders: 1820, amount: 195000 },
  { month: "2024-06", orders: 2100, amount: 230000 },
];

const mockPieData = [
  { category: "电子产品", value: 35 },
  { category: "服装", value: 25 },
  { category: "食品", value: 20 },
  { category: "家居", value: 15 },
  { category: "其他", value: 5 },
];

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function VisualizationPage() {
  const [chartType, setChartType] = useState("bar");
  const [results] = useState(mockData);

  const tableColumns = [
    { title: "月份", dataIndex: "month", key: "month" },
    { title: "订单数", dataIndex: "orders", key: "orders", render: (v: number) => v.toLocaleString() },
    { title: "金额", dataIndex: "amount", key: "amount", render: (v: number) => `¥${v.toLocaleString()}` },
  ];

  const handleExport = (format: string) => {
    message.success(`导出 ${format.toUpperCase()} 成功`);
  };

  return (
    <PageLayout title="结果可视化">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Select
              value={chartType}
              onChange={setChartType}
              options={[
                { value: "bar", label: "柱状图" },
                { value: "line", label: "折线图" },
                { value: "pie", label: "饼图" },
                { value: "table", label: "数据表" },
              ]}
              style={{ width: 120 }}
            />
            <Button icon={<RefreshCw size={14} />}>刷新数据</Button>
          </Space>
          <Space>
            <Button icon={<Save size={14} />}>保存图表</Button>
            <Button icon={<Share2 size={14} />}>分享</Button>
            <Button icon={<Download size={14} />} onClick={() => handleExport("csv")}>导出 CSV</Button>
            <Button icon={<Download size={14} />} onClick={() => handleExport("excel")}>导出 Excel</Button>
          </Space>
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={18}>
          <Card title="数据可视化">
            {chartType === "table" ? (
              <Table dataSource={results} columns={tableColumns} rowKey="month" pagination={false} />
            ) : chartType === "pie" ? (
              <div style={{ display: "flex", gap: 32 }}>
                {/* 简化饼图展示 */}
                <div style={{ width: 200, height: 200, borderRadius: "50%", background: `conic-gradient(${mockPieData.map((d, i) => `${COLORS[i]} ${i === 0 ? 0 : mockPieData.slice(0, i).reduce((a, b) => a + b.value, 0) * 3.6}% ${mockPieData.slice(0, i + 1).reduce((a, b) => a + b.value, 0) * 3.6}%`).join(", ")})` }} />
                <div>
                  {mockPieData.map((d, i) => (
                    <div key={d.category} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 16, height: 16, background: COLORS[i], borderRadius: 2 }} />
                      <span>{d.category}: {d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 16 }}>
                {results.map((item, index) => {
                  const maxOrders = Math.max(...results.map((r) => r.orders));
                  const height = (item.orders / maxOrders) * 250;
                  return (
                    <div key={item.month} style={{ flex: 1, textAlign: "center" }}>
                      <div
                        style={{
                          height,
                          background: chartType === "line" ? "#2563EB" : `linear-gradient(180deg, #2563EB 0%, #3B82F6 100%)`,
                          borderRadius: chartType === "line" ? "50% 50% 0 0" : "4px 4px 0 0",
                          marginBottom: 8,
                        }}
                        title={`${item.orders} 订单`}
                      />
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{item.month}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="统计摘要">
            <Statistic title="总订单数" value={results.reduce((a, b) => a + b.orders, 0)} suffix="单" />
            <Statistic title="总金额" value={results.reduce((a, b) => a + b.amount, 0)} prefix="¥" style={{ marginTop: 16 }} />
            <Statistic title="平均订单金额" value={Math.round(results.reduce((a, b) => a + b.amount, 0) / results.reduce((a, b) => a + b.orders, 0))} prefix="¥" style={{ marginTop: 16 }} />
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}