"use client";

/**
 * 服务监控仪表盘
 * 页面路径: /data-service/monitoring
 */

import { useState, useMemo } from "react";
import { Card, Table, Button, Input, Select, Space, Tag, Tabs, List, Typography, DatePicker, Statistic, Row, Col } from "antd";
import { TrendingUp, Users, Activity, BarChart2, Search, Download, RefreshCw, Clock, Server, Zap } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb, KPICardGrid, StatusBadge } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockServiceList } from "@/services/mock/data-service";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据服务", href: ROUTES.DATA_SERVICE },
  { title: "服务监控" },
];

/**
 * Mock 调用日志
 */
const mockCallLogs = [
  { id: "log-001", serviceName: "客户信息查询API", caller: "张三", callerIp: "192.168.1.100", mac: "00:1A:2B:3C:4D:5E", duration: 125, status: "success", time: "2024-01-20 10:30:00" },
  { id: "log-002", serviceName: "订单数据下载服务", caller: "李四", callerIp: "192.168.1.101", mac: "00:1A:2B:3C:4D:5F", duration: 2340, status: "success", time: "2024-01-20 10:29:00" },
  { id: "log-003", serviceName: "客户信息查询API", caller: "王五", callerIp: "192.168.1.102", mac: "00:1A:2B:3C:4D:60", duration: 89, status: "success", time: "2024-01-20 10:28:00" },
  { id: "log-004", serviceName: "实时数据同步状态", caller: "系统", callerIp: "192.168.1.103", mac: "00:1A:2B:3C:4D:61", duration: 45, status: "success", time: "2024-01-20 10:27:00" },
  { id: "log-005", serviceName: "客户身份比对服务", caller: "赵六", callerIp: "192.168.1.104", mac: "00:1A:2B:3C:4D:62", duration: 560, status: "failed", time: "2024-01-20 10:26:00" },
  { id: "log-006", serviceName: "客户信息查询API", caller: "孙七", callerIp: "192.168.1.105", mac: "00:1A:2B:3C:4D:63", duration: 110, status: "success", time: "2024-01-20 10:25:00" },
];

/**
 * Mock 热门服务数据
 */
const mockHotServices = [
  { name: "实时数据同步状态", calls: 98765 },
  { name: "客户信息查询API", calls: 15234 },
  { name: "订单数据下载服务", calls: 8567 },
  { name: "客户身份比对服务", calls: 3421 },
  { name: "产品库存查询", calls: 2100 },
  { name: "历史交易数据导出", calls: 1500 },
  { name: "用户行为分析", calls: 980 },
  { name: "数据质量检测", calls: 760 },
  { name: "标签管理服务", calls: 540 },
  { name: "权限验证服务", calls: 320 },
];

/**
 * Mock 活跃用户数据
 */
const mockActiveUsers = [
  { name: "张三", calls: 1250, avatar: "张" },
  { name: "李四", calls: 980, avatar: "李" },
  { name: "王五", calls: 760, avatar: "王" },
  { name: "赵六", calls: 540, avatar: "赵" },
  { name: "孙七", calls: 320, avatar: "孙" },
];

/**
 * 服务监控页面组件
 */
export default function ServiceMonitoringPage() {
  const [timeRange, setTimeRange] = useState("today");
  const [searchKeyword, setSearchKeyword] = useState("");

  /**
   * KPI 数据
   */
  const kpiData = [
    { title: "总服务数", value: mockServiceList.length.toString(), icon: <Server size={20} />, trend: "up" as const, trendValue: 2 },
    { title: "今日调用", value: "12,580", icon: <Activity size={20} />, trend: "up" as const, trendValue: 15.2 },
    { title: "累计调用", value: "168,523", icon: <BarChart2 size={20} /> },
    { title: "活跃用户", value: "156", icon: <Users size={20} />, trend: "up" as const, trendValue: 8 },
  ];

  /**
   * 过滤后的日志
   */
  const filteredLogs = useMemo(() => {
    if (!searchKeyword) return mockCallLogs;
    return mockCallLogs.filter(
      (log) =>
        log.serviceName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        log.caller.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [searchKeyword]);

  /**
   * 处理刷新
   */
  const handleRefresh = () => {
    // 刷新数据
  };

  /**
   * 处理导出
   */
  const handleExport = () => {
    // 导出报表
  };

  /**
   * 日志表格列
   */
  const logColumns = [
    { title: "服务名称", dataIndex: "serviceName", key: "serviceName", width: 200 },
    { title: "调用方", dataIndex: "caller", key: "caller", width: 100 },
    { title: "调用方IP", dataIndex: "callerIp", key: "callerIp", width: 140 },
    { title: "MAC地址", dataIndex: "mac", key: "mac", width: 160 },
    {
      title: "耗时",
      dataIndex: "duration",
      key: "duration",
      width: 80,
      render: (v: number) => (
        <span style={{ color: v > 1000 ? "#F59E0B" : "#10B981" }}>
          {v}ms
        </span>
      ),
    },
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
    { title: "时间", dataIndex: "time", key: "time", width: 180 },
  ];

  /**
   * 访问趋势数据 - 用于渲染模拟图表
   */
  const trendData = [
    { date: "01-15", value: 8500 },
    { date: "01-16", value: 9200 },
    { date: "01-17", value: 8800 },
    { date: "01-18", value: 10500 },
    { date: "01-19", value: 11200 },
    { date: "01-20", value: 12580 },
  ];

  const maxValue = Math.max(...trendData.map((d) => d.value));

  return (
    <PageLayout title="服务监控">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 时间范围筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { value: "today", label: "今日" },
                { value: "week", label: "本周" },
                { value: "month", label: "本月" },
                { value: "custom", label: "自定义" },
              ]}
              style={{ width: 120 }}
            />
            {timeRange === "custom" && <DatePicker.RangePicker />}
          </Space>
          <Space>
            <Button icon={<RefreshCw size={14} />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button icon={<Download size={14} />} onClick={handleExport}>
              导出报表
            </Button>
          </Space>
        </div>
      </Card>

      {/* KPI 卡片 */}
      <KPICardGrid data={kpiData} columns={4} />

      {/* 访问趋势图表 */}
      <Card title="访问趋势 (最近30天)" style={{ marginTop: 16 }}>
        <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8 }}>
          {trendData.map((item) => (
            <div key={item.date} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  height: (item.value / maxValue) * 150,
                  background: "linear-gradient(180deg, #2563EB 0%, #3B82F6 100%)",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.3s",
                }}
                title={`${item.value} 次`}
              />
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{item.date}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 热门服务和活跃用户 */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="热门服务 TOP 10">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mockHotServices.map((service, index) => {
                const maxCalls = mockHotServices[0].calls;
                return (
                  <div key={service.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 24, fontWeight: index < 3 ? "bold" : "normal", color: index < 3 ? "#2563EB" : "#6B7280" }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span>{service.name}</span>
                        <span style={{ color: "#6B7280" }}>{service.calls.toLocaleString()}</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "#E5E7EB",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${(service.calls / maxCalls) * 100}%`,
                            height: "100%",
                            background: index < 3 ? "#2563EB" : "#3B82F6",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="活跃用户 TOP 5">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mockActiveUsers.map((user, index) => (
                <div
                  key={user.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    background: "#F9FAFB",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: index === 0 ? "#2563EB" : "#3B82F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {user.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>{user.calls.toLocaleString()} 次调用</div>
                  </div>
                  {index === 0 && <Tag color="gold">TOP 1</Tag>}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 调用日志列表 */}
      <Card
        title="服务调用日志"
        style={{ marginTop: 16 }}
        extra={
          <Input
            placeholder="搜索服务名称、调用方..."
            prefix={<Search size={14} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        }
      >
        <Table
          dataSource={filteredLogs}
          columns={logColumns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </PageLayout>
  );
}