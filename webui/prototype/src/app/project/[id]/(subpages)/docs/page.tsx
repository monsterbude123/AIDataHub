"use client";

/**
 * 项目文档管理页
 */

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Empty,
  Spin,
  Modal,
  Upload,
  message,
} from "antd";
import {
  Search,
  Plus,
  Download,
  FileText,
  PenTool,
  BookOpen,
  TestTube,
  File,
  Trash2,
  Upload as UploadIcon,
} from "lucide-react";
import {
  getProjectById,
} from "@/services/mock/project";
import { mockProjectDocuments } from "@/mock/project-detail";
import type { Project } from "@/types/project";

const documentTypeIcons: Record<string, React.ReactNode> = {
  requirement: <FileText size={16} />,
  design: <PenTool size={16} />,
  manual: <BookOpen size={16} />,
  test: <TestTube size={16} />,
  other: <File size={16} />,
};

const documentTypeLabels: Record<string, string> = {
  requirement: "需求文档",
  design: "设计文档",
  manual: "操作手册",
  test: "测试文档",
  other: "其他",
};

const documentTypeColors: Record<string, string> = {
  requirement: "blue",
  design: "purple",
  manual: "cyan",
  test: "orange",
  other: "default",
};

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploader: string;
  uploadedAt: string;
}

export default function ProjectDocsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal 状态
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);

  useEffect(() => {
    setLoading(true);
    const projectData = getProjectById(projectId);
    if (projectData) {
      setProject(projectData);
      setDocuments([...mockProjectDocuments]);
    }
    setLoading(false);
  }, [projectId]);

  const filteredDocs = documents.filter((doc) => {
    if (typeFilter !== "all" && doc.type !== typeFilter) return false;
    if (keyword && !doc.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 打开上传弹窗
  const handleUpload = () => {
    setFileList([]);
    setUploadModalOpen(true);
  };

  // 下载文档
  const handleDownload = (doc: DocumentItem) => {
    message.success(`开始下载: ${doc.name}`);
    // 实际项目中这里会触发真实的下载
  };

  // 删除文档
  const handleDelete = (docId: string, docName: string) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除文档「${docName}」吗？此操作不可恢复。`,
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        setDocuments(documents.filter((d) => d.id !== docId));
        message.success("文档已删除");
      },
    });
  };

  // 确认上传
  const handleUploadConfirm = () => {
    if (fileList.length === 0) {
      message.warning("请选择要上传的文件");
      return;
    }

    // 模拟上传
    fileList.forEach((file) => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: "other",
        size: file.size,
        uploader: "当前用户",
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      setDocuments((prev) => [newDoc, ...prev]);
    });

    message.success(`成功上传 ${fileList.length} 个文件`);
    setUploadModalOpen(false);
  };

  const columns = [
    {
      title: "文档名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: DocumentItem) => (
        <Space>
          {documentTypeIcons[record.type]}
          <a onClick={() => handleDownload(record)}>{name}</a>
        </Space>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={documentTypeColors[type]}>
          {documentTypeLabels[type]}
        </Tag>
      ),
    },
    {
      title: "大小",
      dataIndex: "size",
      key: "size",
      render: (size: number) => formatFileSize(size),
    },
    {
      title: "上传者",
      dataIndex: "uploader",
      key: "uploader",
    },
    {
      title: "上传时间",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: DocumentItem) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<Download size={14} />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record.id, record.name)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <Empty description="项目不存在" />;
  }

  return (
    <>
      <Card
        title="项目文档"
        extra={
          <Button type="primary" icon={<UploadIcon size={16} />} onClick={handleUpload}>
            上传文档
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="搜索文档名称"
              prefix={<Search size={16} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="类型筛选"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              options={[
                { label: "全部类型", value: "all" },
                { label: "需求文档", value: "requirement" },
                { label: "设计文档", value: "design" },
                { label: "操作手册", value: "manual" },
                { label: "测试文档", value: "test" },
                { label: "其他", value: "other" },
              ]}
            />
          </Space>
        </div>

        <Table
          dataSource={filteredDocs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="上传文档"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        onOk={handleUploadConfirm}
        okText="确认上传"
        cancelText="取消"
        width={600}
      >
        <Upload.Dragger
          multiple
          beforeUpload={(file) => {
            setFileList((prev) => [...prev, file]);
            return false;
          }}
          fileList={fileList.map((f, i) => ({
            uid: `-${i}`,
            name: f.name,
            status: "done" as const,
          }))}
          onRemove={(file) => {
            setFileList(fileList.filter((f) => f.name !== file.name));
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadIcon size={48} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持单个或批量上传，支持多种文档格式</p>
        </Upload.Dragger>
      </Modal>
    </>
  );
}