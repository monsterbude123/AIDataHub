"use client";

/**
 * 分级分类管理页
 * 页面路径: /security/classification
 */

import { useState } from "react";
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, Tabs, Tree, Switch } from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  DEFAULT_SENSITIVITY_LEVELS,
  mockClassifications,
  mockClassificationConfigs,
  mockResourceTree,
} from "@/services/mock/security";
import type { SensitivityLevel, DataClassification, ClassificationConfig } from "@/types/security";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "数据安全", href: ROUTES.SECURITY },
  { title: "分级分类" },
];

/**
 * 分级分类管理页面组件
 */
export default function ClassificationPage() {
  const [activeTab, setActiveTab] = useState("levels");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  /**
   * 分级字典表格列
   */
  const levelColumns = [
    {
      title: "级别代码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "级别名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: SensitivityLevel) => (
        <Tag color={record.code === 1 ? "green" : record.code === 2 ? "blue" : record.code === 3 ? "orange" : "red"}>
          {name}
        </Tag>
      ),
    },
    {
      title: "说明",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "访问要求",
      dataIndex: "accessRequirement",
      key: "accessRequirement",
    },
    {
      title: "操作",
      key: "actions",
      render: (_: unknown, record: SensitivityLevel) => (
        <Space size="small">
          <Button type="text" size="small" icon={<Edit size={14} />}>
            编辑
          </Button>
          <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  /**
   * 分类字典表格列
   */
  const classificationColumns = [
    {
      title: "分类代码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "分类名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "关联分级",
      dataIndex: "relatedLevel",
      key: "relatedLevel",
      render: (level: number) => {
        const levelInfo = DEFAULT_SENSITIVITY_LEVELS.find((l) => l.code === level);
        return levelInfo ? (
          <Tag color={level === 1 ? "green" : level === 2 ? "blue" : level === 3 ? "orange" : "red"}>
            {levelInfo.name}
          </Tag>
        ) : level;
      },
    },
    {
      title: "定级依据",
      dataIndex: "basis",
      key: "basis",
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
    },
    {
      title: "操作",
      key: "actions",
      render: () => (
        <Space size="small">
          <Button type="text" size="small" icon={<Edit size={14} />}>
            编辑
          </Button>
          <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  /**
   * 分级配置表格列
   */
  const configColumns = [
    {
      title: "数据对象",
      dataIndex: "resourceName",
      key: "resourceName",
      render: (name: string, record: ClassificationConfig) => (
        <span>
          {name}
          <Tag style={{ marginLeft: 8 }} color={record.resourceType === "dataset" ? "blue" : "cyan"}>
            {record.resourceType === "dataset" ? "数据集" : record.resourceType === "column" ? "字段" : "行"}
          </Tag>
        </span>
      ),
    },
    {
      title: "当前分级",
      dataIndex: "currentLevel",
      key: "currentLevel",
      render: (level: number) => {
        const levelInfo = DEFAULT_SENSITIVITY_LEVELS.find((l) => l.code === level);
        return (
          <Select
            value={level}
            style={{ width: 100 }}
            size="small"
            options={DEFAULT_SENSITIVITY_LEVELS.map((l) => ({
              value: l.code,
              label: l.name,
            }))}
          />
        );
      },
    },
    {
      title: "当前分类",
      dataIndex: "currentClassification",
      key: "currentClassification",
      render: (cls: string) => (
        <Select
          value={cls}
          style={{ width: 150 }}
          size="small"
          options={mockClassifications.map((c) => ({
            value: c.code,
            label: c.name,
          }))}
        />
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: () => (
        <Button type="text" size="small" icon={<Edit size={14} />}>
          编辑
        </Button>
      ),
    },
  ];

  /**
   * 过滤配置数据
   */
  const filteredConfigs = selectedResource
    ? mockClassificationConfigs.filter((c) => c.resourcePath.startsWith(selectedResource))
    : mockClassificationConfigs;

  /**
   * Tab 内容
   */
  const tabItems = [
    {
      key: "levels",
      label: "分级字典",
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<Plus size={14} />}>
              新增分级
            </Button>
          </div>
          <Table
            columns={levelColumns}
            dataSource={DEFAULT_SENSITIVITY_LEVELS}
            rowKey="id"
            pagination={false}
          />
          <div style={{ marginTop: 16, color: "#6B7280", fontSize: 12 }}>
            说明: 用户只能访问低于等于自身级别的数据
          </div>
        </Card>
      ),
    },
    {
      key: "classifications",
      label: "分类字典",
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<Plus size={14} />}>
              新增分类
            </Button>
          </div>
          <Table
            columns={classificationColumns}
            dataSource={mockClassifications}
            rowKey="id"
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: "config",
      label: "分级分类配置",
      children: (
        <div style={{ display: "flex", gap: 16 }}>
          {/* 左侧资源树 */}
          <Card
            title="数据资源"
            style={{ width: 280, flexShrink: 0 }}
            styles={{ body: { padding: 12, maxHeight: 400, overflow: "auto" } }}
          >
            <Tree
              treeData={mockResourceTree.map((node) => ({
                key: node.id,
                title: node.name,
                children: node.children?.map((child) => ({
                  key: child.id,
                  title: child.name,
                  children: child.children?.map((grandchild: { id: string; name: string }) => ({
                    key: grandchild.id,
                    title: grandchild.name,
                  })) || [],
                })),
              }))}
              selectedKeys={selectedResource ? [selectedResource] : []}
              onSelect={(keys) => setSelectedResource(keys[0] as string | null)}
            />
          </Card>

          {/* 右侧配置表格 */}
          <Card title="分级分类配置" style={{ flex: 1 }}>
            <Table
              columns={configColumns}
              dataSource={filteredConfigs}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <PageLayout title="分级分类管理">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title="新增分级"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => setModalOpen(false)}
      >
        <Form layout="vertical">
          <Form.Item name="code" label="级别代码" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="name" label="级别名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input />
          </Form.Item>
          <Form.Item name="accessRequirement" label="访问要求">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}