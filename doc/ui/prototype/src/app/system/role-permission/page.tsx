"use client";

/**
 * 角色权限管理页
 * 页面路径: /system/role-permission
 */

import { useState } from "react";
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, Tree, message, Tabs, Checkbox } from "antd";
import { Plus, Edit, Trash2, User, Settings, Key } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";

const BREADCRUMB_ITEMS = [
  { title: "系统管理", href: ROUTES.SYSTEM },
  { title: "角色权限管理" },
];

const mockRoles = [
  { id: "role-001", name: "系统管理员", code: "admin", userCount: 2, description: "系统最高权限", createTime: "2024-01-01" },
  { id: "role-002", name: "数据管理员", code: "data_admin", userCount: 5, description: "数据管理权限", createTime: "2024-01-05" },
  { id: "role-003", name: "普通用户", code: "user", userCount: 50, description: "基础查看权限", createTime: "2024-01-10" },
];

const mockMenuTree = [
  { title: "数据集成", key: "data-integration", children: [
    { title: "数据源管理", key: "sources" },
    { title: "数据探查", key: "profiling" },
    { title: "数据标准化", key: "standardization" },
  ]},
  { title: "数据服务", key: "data-service", children: [
    { title: "服务目录", key: "catalog" },
    { title: "服务配置", key: "config" },
    { title: "服务授权", key: "authorization" },
  ]},
  { title: "数据治理", key: "governance", children: [
    { title: "数据地图", key: "data-map" },
    { title: "数据质量", key: "data-quality" },
    { title: "数据血缘", key: "lineage" },
  ]},
  { title: "系统管理", key: "system", children: [
    { title: "组织用户", key: "org-user" },
    { title: "角色权限", key: "role-permission" },
  ]},
];

export default function RolePermissionPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const columns = [
    { title: "角色名称", dataIndex: "name", key: "name", width: 150 },
    { title: "角色编码", dataIndex: "code", key: "code", width: 120 },
    { title: "用户数", dataIndex: "userCount", key: "userCount", width: 80 },
    { title: "描述", dataIndex: "description", key: "description" },
    { title: "创建时间", dataIndex: "createTime", key: "createTime", width: 120 },
    {
      title: "操作",
      key: "actions",
      width: 180,
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<Edit size={12} />} onClick={() => setModalOpen(true)}>编辑</Button>
          <Button type="link" size="small" icon={<Key size={12} />}>权限</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title="角色权限管理">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>新增角色</Button>
        </div>
        <Table dataSource={mockRoles} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="角色配置"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => { message.success("保存成功"); setModalOpen(false); }}
        width={800}
      >
        <Tabs
          items={[
            {
              key: "basic",
              label: "基本信息",
              children: (
                <Form layout="vertical">
                  <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
                    <Input placeholder="请输入角色名称" />
                  </Form.Item>
                  <Form.Item name="code" label="角色编码" rules={[{ required: true }]}>
                    <Input placeholder="请输入角色编码" />
                  </Form.Item>
                  <Form.Item name="description" label="描述">
                    <Input.TextArea rows={2} placeholder="角色描述" />
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "menu",
              label: "菜单权限",
              children: (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Checkbox>全选</Checkbox>
                  </div>
                  <Tree
                    checkable
                    treeData={mockMenuTree}
                    checkedKeys={selectedKeys}
                    onCheck={(keys) => setSelectedKeys(keys as string[])}
                    style={{ border: "1px solid #E5E7EB", borderRadius: 4, padding: 12 }}
                  />
                </div>
              ),
            },
            {
              key: "data",
              label: "数据权限",
              children: (
                <Form layout="vertical">
                  <Form.Item name="dataScope" label="数据范围">
                    <Select
                      options={[
                        { value: "all", label: "全部数据" },
                        { value: "dept", label: "本部门数据" },
                        { value: "self", label: "仅本人数据" },
                      ]}
                    />
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </PageLayout>
  );
}