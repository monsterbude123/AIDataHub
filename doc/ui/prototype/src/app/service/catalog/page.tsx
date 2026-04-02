"use client";

/**
 * 数据服务目录页
 * 页面路径: /service/catalog
 */

import { useState, useMemo } from "react";
import { Card, Tag, Button, Space, Input, Select, Modal, Form, Empty, Row, Col } from "antd";
import { Search, Plus, Eye, Play, Download, Trash2, FileText } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import { mockServiceList, filterServices } from "@/services/mock/data-service";
import {
  SERVICE_TYPE_LABELS,
  SERVICE_STATUS_LABELS,
  type DataService,
  type ServiceType,
  type ServiceStatus,
} from "@/types/data-service";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据服务", href: ROUTES.DATA_SERVICE },
  { title: "服务目录" },
];

/**
 * 服务类型颜色
 */
const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  query: "blue",
  download: "green",
  compare: "orange",
};

/**
 * 服务状态颜色
 */
const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  published: "success",
  unpublished: "default",
  offline: "error",
};

/**
 * 数据服务目录页面组件
 */
export default function ServiceCatalogPage() {
  const [filters, setFilters] = useState<{
    keyword: string;
    type: ServiceType | "";
    status: ServiceStatus | "";
  }>({
    keyword: "",
    type: "",
    status: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<DataService | null>(null);

  /**
   * 过滤后的服务列表
   */
  const filteredServices = useMemo(() => {
    return filterServices(filters);
  }, [filters]);

  /**
   * 查看服务详情
   */
  const handleViewDetail = (service: DataService) => {
    setSelectedService(service);
    setDetailModalOpen(true);
  };

  /**
   * 测试服务
   */
  const handleTestService = (service: DataService) => {
    // 实际项目中打开测试弹窗或跳转测试页面
    console.log("Test service:", service.id);
  };

  /**
   * 下载服务文档
   */
  const handleDownloadDoc = (service: DataService) => {
    // 实际项目中调用API下载Word文档
    console.log("Download doc:", service.id);
  };

  /**
   * 渲染服务卡片
   */
  const renderServiceCard = (service: DataService) => (
    <Card
      key={service.id}
      hoverable
      style={{ marginBottom: 16 }}
      onClick={() => handleViewDetail(service)}
    >
      {/* 类型标签 */}
      <div style={{ marginBottom: 8 }}>
        <Tag color={SERVICE_TYPE_COLORS[service.type]}>
          {SERVICE_TYPE_LABELS[service.type]}
        </Tag>
        <Tag color={SERVICE_STATUS_COLORS[service.status]}>
          {SERVICE_STATUS_LABELS[service.status]}
        </Tag>
      </div>

      {/* 服务名称 */}
      <div style={{ fontSize: 16, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>
        {service.name}
      </div>

      {/* 服务描述 */}
      <div
        style={{
          fontSize: 14,
          color: "#6B7280",
          marginBottom: 12,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {service.description}
      </div>

      {/* 发布人和时间 */}
      <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
        发布人: {service.publisher} | {service.createdAt}
      </div>

      {/* 调用统计 */}
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
        累计调用: {service.callCount.toLocaleString()} 次
      </div>

      {/* 操作按钮 */}
      <Space>
        <Button
          type="text"
          size="small"
          icon={<Eye size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(service);
          }}
        >
          详情
        </Button>
        <Button
          type="text"
          size="small"
          icon={<Play size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleTestService(service);
          }}
        >
          测试
        </Button>
        <Button
          type="text"
          size="small"
          icon={<FileText size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadDoc(service);
          }}
        >
          文档
        </Button>
        {service.status !== "published" && (
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            删除
          </Button>
        )}
      </Space>
    </Card>
  );

  return (
    <PageLayout title="服务目录">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 过滤栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Input
              placeholder="搜索服务名称..."
              prefix={<Search size={14} />}
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="服务类型"
              value={filters.type}
              onChange={(value) => setFilters((prev) => ({ ...prev, type: value || "" }))}
              style={{ width: 120 }}
              allowClear
              options={Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
            <Select
              placeholder="服务状态"
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value || "" }))}
              style={{ width: 120 }}
              allowClear
              options={Object.entries(SERVICE_STATUS_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
          </Space>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
            新增服务
          </Button>
        </div>
      </Card>

      {/* 服务卡片网格 */}
      <Card title={`数据服务 (${filteredServices.length})`}>
        {filteredServices.length > 0 ? (
          <Row gutter={16}>
            {filteredServices.map((service) => (
              <Col key={service.id} xs={24} md={12} lg={8} style={{ marginBottom: 16 }}>
                {renderServiceCard(service)}
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="没有找到匹配的数据服务" />
        )}
      </Card>

      {/* 新增服务弹窗 */}
      <Modal
        title="新增数据服务"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => setModalOpen(false)}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item name="name" label="服务名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="服务类型" rules={[{ required: true }]}>
            <Select
              options={Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item name="description" label="服务描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="endpoint" label="接口地址">
            <Input placeholder="/api/v1/..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 服务详情弹窗 */}
      <Modal
        title={selectedService?.name}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedService(null);
        }}
        footer={null}
        width={700}
      >
        {selectedService && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ color: "#6B7280" }}>服务类型:</span>{" "}
                  <Tag color={SERVICE_TYPE_COLORS[selectedService.type]}>
                    {SERVICE_TYPE_LABELS[selectedService.type]}
                  </Tag>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>状态:</span>{" "}
                  <Tag color={SERVICE_STATUS_COLORS[selectedService.status]}>
                    {SERVICE_STATUS_LABELS[selectedService.status]}
                  </Tag>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>接口地址:</span> {selectedService.endpoint}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>版本:</span> {selectedService.version}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>发布人:</span> {selectedService.publisher}
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>创建时间:</span> {selectedService.createdAt}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "#6B7280" }}>描述:</span> {selectedService.description}
                </div>
              </div>
            </Card>

            <Card title="调用统计" size="small">
              <div style={{ fontSize: 24, fontWeight: 600, color: "#2563EB" }}>
                {selectedService.callCount.toLocaleString()}
              </div>
              <div style={{ color: "#6B7280" }}>累计调用次数</div>
            </Card>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}