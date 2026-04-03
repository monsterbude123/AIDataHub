"use client";

/**
 * 组织机构用户管理页
 * 页面路径: /system/org-user
 */

import { useState, useMemo } from "react";
import { Card, Button, Space, message, Tag } from "antd";
import {
  Plus,
  Edit,
  Trash2,
  Key,
  StopCircle,
  PlayCircle,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import {
  PageBreadcrumb,
  DirectoryTree,
  DataTable,
  FilterBar,
  ModalForm,
  StatusBadge,
  SensitivityBadge,
  type DirectoryTreeNode,
  type TableActionItem,
  type FormFieldConfig,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  mockOrganizations,
  mockUsers,
  getUsersByOrgId,
} from "@/services/mock/system";
import type { SystemUser, Organization, UserFormData, OrgFormData } from "@/types/system";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "系统管理", href: ROUTES.SYSTEM },
  { title: "组织机构用户" },
];

/**
 * 组织机构用户管理页面组件
 */
export default function OrgUserPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("all");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  /**
   * 转换组织机构树数据
   */
  const orgTreeData: DirectoryTreeNode[] = useMemo(() => {
    const convertOrg = (orgs: Organization[]): DirectoryTreeNode[] => {
      return orgs.map((org) => ({
        key: org.id,
        title: org.name,
        isLeaf: !org.children || org.children.length === 0,
        children: org.children ? convertOrg(org.children) : undefined,
        data: org,
      }));
    };

    return [
      { key: "all", title: "全部机构", isLeaf: true },
      ...convertOrg(mockOrganizations),
    ];
  }, []);

  /**
   * 过滤后的用户列表
   */
  const filteredUsers = useMemo(() => {
    return getUsersByOrgId(selectedOrgId);
  }, [selectedOrgId]);

  /**
   * 用户表格列配置
   */
  const userColumns = [
    {
      key: "account",
      title: "账号",
      dataIndex: "account",
      width: 120,
    },
    {
      key: "name",
      title: "姓名",
      dataIndex: "name",
      width: 100,
    },
    {
      key: "phone",
      title: "电话",
      dataIndex: "phone",
      width: 130,
    },
    {
      key: "email",
      title: "邮箱",
      dataIndex: "email",
      width: 180,
      ellipsis: true,
    },
    {
      key: "orgName",
      title: "所属机构",
      dataIndex: "orgName",
      width: 120,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (value: unknown) => (
        <StatusBadge status={value === "normal" ? "enabled" : "disabled"} label={value === "normal" ? "正常" : "禁用"} />
      ),
    },
    {
      key: "sensitivityLevel",
      title: "分级分类",
      dataIndex: "sensitivityLevel",
      width: 100,
      render: (value: unknown) => (
        <SensitivityBadge level={value as "public" | "internal" | "secret" | "confidential"} />
      ),
    },
    {
      key: "createdAt",
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
  ];

  /**
   * 用户操作配置
   */
  const userActions: TableActionItem[] = [
    {
      key: "edit",
      label: "编辑",
      icon: <Edit size={14} />,
      onClick: (record) => {
        setEditingUser(record as SystemUser);
        setUserModalOpen(true);
      },
    },
    {
      key: "resetPassword",
      label: "重置密码",
      icon: <Key size={14} />,
      onClick: (record) => message.success(`已重置 ${(record as SystemUser).name} 的密码`),
    },
    {
      key: "toggleStatus",
      label: "切换状态",
      icon: <StopCircle size={14} />,
      onClick: (record) => {
        const user = record as SystemUser;
        message.success(`已${user.status === "normal" ? "禁用" : "启用"}用户 ${user.name}`);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: <Trash2 size={14} />,
      danger: true,
      confirm: true,
      confirmText: "确认删除该用户？",
      onClick: (record) => message.success(`已删除用户 ${(record as SystemUser).name}`),
    },
  ];

  /**
   * 用户表单字段
   */
  const userFormFields: FormFieldConfig[] = [
    {
      name: "account",
      label: "账号",
      type: "text",
      required: true,
      placeholder: "请输入账号",
    },
    {
      name: "name",
      label: "姓名",
      type: "text",
      required: true,
      placeholder: "请输入姓名",
    },
    {
      name: "password",
      label: editingUser ? "密码（留空不修改）" : "密码",
      type: "password",
      required: !editingUser,
      placeholder: "请输入密码",
    },
    {
      name: "orgId",
      label: "所属机构",
      type: "select",
      required: true,
      options: [
        { value: "org-001-001", label: "技术部" },
        { value: "org-001-002", label: "产品部" },
        { value: "org-001-003", label: "市场部" },
        { value: "org-001-004", label: "财务部" },
      ],
    },
    {
      name: "phone",
      label: "电话",
      type: "text",
      placeholder: "请输入电话",
    },
    {
      name: "email",
      label: "邮箱",
      type: "text",
      placeholder: "请输入邮箱",
    },
    {
      name: "sensitivityLevel",
      label: "数据分级",
      type: "select",
      required: true,
      options: [
        { value: "public", label: "公开" },
        { value: "internal", label: "内部" },
        { value: "secret", label: "秘密" },
        { value: "confidential", label: "机密" },
      ],
      initialValue: "internal",
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      options: [
        { value: "normal", label: "正常" },
        { value: "disabled", label: "禁用" },
      ],
      initialValue: "normal",
    },
  ];

  /**
   * 机构表单字段
   */
  const orgFormFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "机构名称",
      type: "text",
      required: true,
      placeholder: "请输入机构名称",
    },
    {
      name: "code",
      label: "机构编码",
      type: "text",
      required: true,
      placeholder: "请输入机构编码",
    },
    {
      name: "parentId",
      label: "上级机构",
      type: "select",
      options: [
        { value: "org-001", label: "集团总部" },
        { value: "org-002", label: "北京分公司" },
      ],
    },
    {
      name: "leader",
      label: "负责人",
      type: "text",
      placeholder: "请输入负责人姓名",
    },
    {
      name: "phone",
      label: "联系电话",
      type: "text",
      placeholder: "请输入联系电话",
    },
    {
      name: "address",
      label: "地址",
      type: "textarea",
      placeholder: "请输入地址",
    },
    {
      name: "order",
      label: "排序",
      type: "number",
      initialValue: 1,
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      options: [
        { value: "enabled", label: "启用" },
        { value: "disabled", label: "禁用" },
      ],
      initialValue: "enabled",
    },
  ];

  /**
   * 处理机构选中
   */
  const handleOrgSelect = (keys: React.Key[], node: DirectoryTreeNode) => {
    if (keys.length > 0) {
      setSelectedOrgId(keys[0] as string);
    }
  };

  /**
   * 处理用户表单提交
   */
  const handleUserSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit user:", values);
    message.success(editingUser ? "用户更新成功" : "用户创建成功");
    setUserModalOpen(false);
    setEditingUser(null);
  };

  /**
   * 处理机构表单提交
   */
  const handleOrgSubmit = async (values: Record<string, unknown>) => {
    console.log("Submit org:", values);
    message.success(editingOrg ? "机构更新成功" : "机构创建成功");
    setOrgModalOpen(false);
    setEditingOrg(null);
  };

  return (
    <PageLayout title="组织机构用户管理">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 顶部操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingOrg(null);
              setOrgModalOpen(true);
            }}
          >
            新增机构
          </Button>
          <Button
            icon={<Plus size={14} />}
            onClick={() => {
              setEditingUser(null);
              setUserModalOpen(true);
            }}
          >
            新增用户
          </Button>
        </Space>
      </div>

      {/* 主体布局：左侧机构树 + 右侧用户列表 */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* 左侧机构树 */}
        <DirectoryTree
          treeData={orgTreeData}
          onSelect={handleOrgSelect}
          showSearch
          width={260}
          collapsible
          defaultSelectedKeys={["all"]}
          contextMenuItems={[
            { key: "addChild", label: "新增子机构" },
            { key: "addSibling", label: "新增同级机构" },
            { key: "edit", label: "编辑机构" },
            { key: "delete", label: "删除机构", danger: true },
          ]}
          onContextMenuClick={(menuKey, nodeKey) => {
            if (menuKey === "delete") {
              message.warning("该机构下存在子机构或用户，无法删除");
            } else {
              message.info(`${menuKey} 功能开发中...`);
            }
          }}
        />

        {/* 右侧用户列表 */}
        <div style={{ flex: 1 }}>
          <Card title={`用户列表 (${filteredUsers.length}人)`}>
            <DataTable
              columns={userColumns}
              dataSource={filteredUsers}
              actions={userActions}
              rowKey="id"
              pagination
              defaultPageSize={10}
            />
          </Card>
        </div>
      </div>

      {/* 用户编辑弹窗 */}
      <ModalForm
        title={editingUser ? "编辑用户" : "新增用户"}
        open={userModalOpen}
        onCancel={() => {
          setUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUserSubmit}
        fields={userFormFields}
        initialValues={editingUser ? { ...editingUser } : undefined}
        width={600}
      />

      {/* 机构编辑弹窗 */}
      <ModalForm
        title={editingOrg ? "编辑机构" : "新增机构"}
        open={orgModalOpen}
        onCancel={() => {
          setOrgModalOpen(false);
          setEditingOrg(null);
        }}
        onSubmit={handleOrgSubmit}
        fields={orgFormFields}
        initialValues={editingOrg ? { ...editingOrg } : undefined}
        width={600}
      />
    </PageLayout>
  );
}