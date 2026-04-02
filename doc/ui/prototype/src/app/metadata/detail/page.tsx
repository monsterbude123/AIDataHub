"use client";

/**
 * 元数据详情页
 * 页面路径: /metadata/detail/[id]
 */

import { useState } from "react";
import { Card, Tabs, Button, Form, Input, Select, TreeSelect, Table, Tag, Space, Descriptions, Modal, List, message, Badge, Timeline } from "antd";
import { Edit, History, Bell, BellOff, Save, RotateCcw, Diff, Download, Database, Code, Briefcase, Settings } from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import { METADATA_TYPE_LABELS } from "@/types/metadata";
import { mockMetadataList, mockMetadataCategories } from "@/services/mock/metadata";

/**
 * 面包屑配置
 */
const BREADCRUMB_ITEMS = [
  { title: "元数据管理", href: ROUTES.METADATA },
  { title: "元数据列表", href: ROUTES.METADATA },
  { title: "详情" },
];

/**
 * Mock 字段列表
 */
const mockFields = [
  { name: "id", type: "BIGINT", precision: "20", nullable: false, description: "主键ID" },
  { name: "customer_name", type: "VARCHAR", precision: "100", nullable: false, description: "客户姓名" },
  { name: "email", type: "VARCHAR", precision: "200", nullable: true, description: "邮箱地址" },
  { name: "phone", type: "VARCHAR", precision: "20", nullable: true, description: "联系电话" },
  { name: "status", type: "INT", precision: "11", nullable: false, description: "状态" },
  { name: "created_at", type: "DATETIME", precision: "", nullable: false, description: "创建时间" },
];

/**
 * Mock 版本历史
 */
const mockVersionHistory = [
  { version: "v1.2.3", updatedBy: "张三", updatedAt: "2024-01-15 10:30:00", comment: "新增phone字段" },
  { version: "v1.2.2", updatedBy: "李四", updatedAt: "2024-01-10 14:20:00", comment: "修改字段描述" },
  { version: "v1.2.1", updatedBy: "张三", updatedAt: "2024-01-05 09:00:00", comment: "新增索引" },
  { version: "v1.2.0", updatedBy: "王五", updatedAt: "2024-01-01 00:00:00", comment: "表结构优化" },
  { version: "v1.1.0", updatedBy: "张三", updatedAt: "2023-12-15 16:45:00", comment: "初始版本" },
];

/**
 * 元数据详情页面组件
 */
export default function MetadataDetailPage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [subscribed, setSubscribed] = useState(true);
  const [versionCompareModal, setVersionCompareModal] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // 模拟获取第一个元数据作为示例
  const metadata = mockMetadataList[0];

  /**
   * 处理保存
   */
  const handleSave = async () => {
    try {
      await form.validateFields();
      message.success("保存成功!");
      setEditMode(false);
    } catch {
      message.error("请完成必填项");
    }
  };

  /**
   * 处理订阅切换
   */
  const handleSubscribe = () => {
    setSubscribed(!subscribed);
    message.success(subscribed ? "已取消订阅" : "已订阅");
  };

  /**
   * 处理版本回滚
   */
  const handleRollback = (version: string) => {
    Modal.confirm({
      title: "确认回滚",
      content: `确定要回滚到版本 ${version} 吗？`,
      onOk: () => {
        message.success(`已回滚到 ${version}`);
      },
    });
  };

  /**
   * 处理版本对比
   */
  const handleVersionCompare = () => {
    if (selectedVersions.length !== 2) {
      message.warning("请选择两个版本进行对比");
      return;
    }
    setVersionCompareModal(true);
  };

  /**
   * 字段表格列
   */
  const fieldColumns = [
    { title: "字段名", dataIndex: "name", key: "name", width: 150 },
    { title: "数据类型", dataIndex: "type", key: "type", width: 100 },
    { title: "精度", dataIndex: "precision", key: "precision", width: 80 },
    {
      title: "可空",
      dataIndex: "nullable",
      key: "nullable",
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? "default" : "red"}>{v ? "是" : "否"}</Tag>
      ),
    },
    { title: "描述", dataIndex: "description", key: "description" },
    ...(editMode
      ? [
          {
            title: "操作",
            key: "actions",
            width: 100,
            render: () => (
              <Space>
                <Button type="link" size="small">编辑</Button>
                <Button type="link" size="small" danger>删除</Button>
              </Space>
            ),
          },
        ]
      : []),
  ];

  /**
   * 版本历史表格列
   */
  const versionColumns = [
    { title: "版本号", dataIndex: "version", key: "version", width: 100 },
    { title: "更新人", dataIndex: "updatedBy", key: "updatedBy", width: 100 },
    { title: "更新时间", dataIndex: "updatedAt", key: "updatedAt", width: 180 },
    { title: "更新说明", dataIndex: "comment", key: "comment" },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: (_: unknown, record: typeof mockVersionHistory[0]) => (
        <Space>
          <Button type="link" size="small">查看详情</Button>
          <Button type="link" size="small" onClick={() => handleRollback(record.version)}>
            回滚
          </Button>
        </Space>
      ),
    },
  ];

  /**
   * Tab 项配置
   */
  const tabItems = [
    {
      key: "basic",
      label: (
        <span>
          <Database size={14} style={{ marginRight: 4 }} />
          基本信息
        </span>
      ),
      children: (
        <Card>
          <Form form={form} layout="vertical" initialValues={metadata}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="元数据名称">
                {editMode ? (
                  <Form.Item name="name" noStyle rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                ) : (
                  metadata.name
                )}
              </Descriptions.Item>
              <Descriptions.Item label="元数据类型">
                {editMode ? (
                  <Form.Item name="type" noStyle>
                    <Select options={Object.entries(METADATA_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
                  </Form.Item>
                ) : (
                  METADATA_TYPE_LABELS[metadata.type]
                )}
              </Descriptions.Item>
              <Descriptions.Item label="所属分类">
                {editMode ? (
                  <Form.Item name="categoryId" noStyle>
                    <TreeSelect
                      treeData={mockMetadataCategories.map((cat) => ({
                        value: cat.id,
                        title: cat.name,
                        children: cat.children?.map((child) => ({
                          value: child.id,
                          title: child.name,
                        })),
                      }))}
                    />
                  </Form.Item>
                ) : (
                  "客户数据"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="数据源">
                {editMode ? (
                  <Form.Item name="dataSource" noStyle>
                    <Select options={[{ value: "MySQL-生产库", label: "MySQL-生产库" }]} />
                  </Form.Item>
                ) : (
                  metadata.dataSource
                )}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {editMode ? (
                  <Form.Item name="description" noStyle>
                    <Input.TextArea rows={3} />
                  </Form.Item>
                ) : (
                  metadata.description
                )}
              </Descriptions.Item>
              <Descriptions.Item label="绑定元模型">
                {editMode ? (
                  <Form.Item name="metaModel" noStyle>
                    <Select placeholder="选择元模型" allowClear />
                  </Form.Item>
                ) : (
                  "未绑定"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Form>
        </Card>
      ),
    },
    {
      key: "technical",
      label: (
        <span>
          <Code size={14} style={{ marginRight: 4 }} />
          技术元数据
        </span>
      ),
      children: (
        <Card
          title="字段信息"
          extra={editMode && <Button type="primary">添加字段</Button>}
        >
          <Table
            dataSource={mockFields}
            columns={fieldColumns}
            rowKey="name"
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: "business",
      label: (
        <span>
          <Briefcase size={14} style={{ marginRight: 4 }} />
          业务元数据
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="业务定义" span={2}>
                {editMode ? (
                  <Input.TextArea rows={3} defaultValue="存储客户基本信息，用于业务系统查询和报表分析" />
                ) : (
                  "存储客户基本信息，用于业务系统查询和报表分析"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="业务责任人">
                {editMode ? (
                  <Select defaultValue="张三" options={[{ value: "张三", label: "张三" }]} />
                ) : (
                  "张三"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="分级分类">
                {editMode ? (
                  <Select defaultValue="secret" options={[{ value: "secret", label: "秘密" }, { value: "internal", label: "内部" }]} />
                ) : (
                  <Tag color="red">秘密</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="关联标准数据元">
                {editMode ? (
                  <Select mode="multiple" defaultValue={["customer_name"]} options={[{ value: "customer_name", label: "客户姓名" }]} />
                ) : (
                  <Tag>客户姓名</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="关联字典">
                {editMode ? (
                  <Select defaultValue="status_dict" options={[{ value: "status_dict", label: "状态字典" }]} />
                ) : (
                  <Tag color="blue">状态字典</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Form>
        </Card>
      ),
    },
    {
      key: "management",
      label: (
        <span>
          <Settings size={14} style={{ marginRight: 4 }} />
          管理元数据
        </span>
      ),
      children: (
        <Card>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="创建人">{metadata.updatedBy}</Descriptions.Item>
            <Descriptions.Item label="创建时间">2023-12-01 00:00:00</Descriptions.Item>
            <Descriptions.Item label="当前版本">
              <Tag color="blue">{metadata.currentVersion}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="最后更新人">{metadata.updatedBy}</Descriptions.Item>
            <Descriptions.Item label="最后更新时间">{metadata.updatedAt}</Descriptions.Item>
            <Descriptions.Item label="存储位置">
              <code>hdfs://cluster/data/customer_info</code>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: "version",
      label: (
        <span>
          <History size={14} style={{ marginRight: 4 }} />
          版本历史
        </span>
      ),
      children: (
        <Card
          title="版本历史"
          extra={
            <Space>
              <Select
                mode="multiple"
                placeholder="选择两个版本对比"
                value={selectedVersions}
                onChange={setSelectedVersions}
                maxCount={2}
                options={mockVersionHistory.map((v) => ({ value: v.version, label: v.version }))}
                style={{ width: 200 }}
              />
              <Button icon={<Diff size={14} />} onClick={handleVersionCompare}>
                版本对比
              </Button>
            </Space>
          }
        >
          <Table
            dataSource={mockVersionHistory}
            columns={versionColumns}
            rowKey="version"
            pagination={false}
          />
        </Card>
      ),
    },
  ];

  return (
    <PageLayout title="元数据详情">
      {/* 面包屑 */}
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h2 style={{ margin: 0 }}>{metadata.name}</h2>
            <Tag color="blue">{METADATA_TYPE_LABELS[metadata.type]}</Tag>
            <Tag color="green">{metadata.currentVersion}</Tag>
          </div>
          <Space>
            {editMode ? (
              <>
                <Button type="primary" icon={<Save size={14} />} onClick={handleSave}>
                  保存
                </Button>
                <Button onClick={() => setEditMode(false)}>取消</Button>
              </>
            ) : (
              <>
                <Button icon={<Edit size={14} />} onClick={() => setEditMode(true)}>
                  编辑
                </Button>
                <Button
                  icon={subscribed ? <BellOff size={14} /> : <Bell size={14} />}
                  onClick={handleSubscribe}
                >
                  {subscribed ? "取消订阅" : "订阅"}
                </Button>
                <Button icon={<Download size={14} />}>
                  导出
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>

      {/* Tab 内容 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* 版本对比弹窗 */}
      <Modal
        title="版本对比"
        open={versionCompareModal}
        onCancel={() => setVersionCompareModal(false)}
        footer={null}
        width={900}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <Card title={selectedVersions[0]} style={{ flex: 1 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="字段数">5</Descriptions.Item>
              <Descriptions.Item label="新增字段">
                <Tag color="green">phone</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title={selectedVersions[1]} style={{ flex: 1 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="字段数">4</Descriptions.Item>
              <Descriptions.Item label="新增字段">
                <Tag color="green">phone</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </Modal>
    </PageLayout>
  );
}