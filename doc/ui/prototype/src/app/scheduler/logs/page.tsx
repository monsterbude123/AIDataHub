"use client";

/**
 * 统一日志中心页
 * 页面路径: /scheduler/logs
 * 功能：日志查看、搜索过滤、下载导出
 */

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Select,
  DatePicker,
  Input,
  Switch,
  Button,
  Tag,
  Space,
  List,
  message,
  Checkbox,
  Dropdown,
  Modal,
  Radio,
} from "antd";
import {
  Search,
  RefreshCw,
  Download,
  Trash2,
  Filter,
  Clock,
  ChevronDown,
  FileText,
  FileJson,
  Table,
} from "lucide-react";

import { PageLayout } from "@/components/layout";
import { PageBreadcrumb } from "@/components/ui";
import { ROUTES } from "@/constants";
import { exportLogs } from "@/lib/utils";
import type { LogRecord, LogLevel, LogDownloadFormat } from "@/types/scheduler";
import { LOG_LEVEL_COLORS } from "@/types/scheduler";

const BREADCRUMB_ITEMS = [
  { title: "任务调度", href: ROUTES.SCHEDULER },
  { title: "日志中心" },
];

/**
 * Mock 日志数据
 */
const mockLogs: LogRecord[] = [
  {
    id: 1,
    time: "2024-01-20 10:30:15.123",
    level: "INFO",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "开始执行任务，读取源数据...",
  },
  {
    id: 2,
    time: "2024-01-20 10:30:15.456",
    level: "INFO",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "源数据读取完成，共 15000 条记录",
  },
  {
    id: 3,
    time: "2024-01-20 10:30:16.789",
    level: "WARN",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "发现 5 条数据格式异常，已跳过",
  },
  {
    id: 4,
    time: "2024-01-20 10:30:18.012",
    level: "INFO",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "数据转换中...",
  },
  {
    id: 5,
    time: "2024-01-20 10:30:20.345",
    level: "ERROR",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "写入目标表失败: 连接超时",
  },
  {
    id: 6,
    time: "2024-01-20 10:30:21.678",
    level: "INFO",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "重试连接...",
  },
  {
    id: 7,
    time: "2024-01-20 10:30:22.901",
    level: "INFO",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "连接成功，继续写入",
  },
  {
    id: 8,
    time: "2024-01-20 10:30:25.234",
    level: "INFO",
    task: "客户数据同步",
    executionId: "exec-001",
    message: "任务执行完成，成功 14995 条，失败 5 条",
  },
  {
    id: 9,
    time: "2024-01-20 10:35:00.000",
    level: "DEBUG",
    task: "订单数据同步",
    executionId: "exec-002",
    message: "调度触发: 定时任务",
  },
  {
    id: 10,
    time: "2024-01-20 10:35:00.123",
    level: "INFO",
    task: "订单数据同步",
    executionId: "exec-002",
    message: "开始执行任务...",
  },
];

const LEVEL_OPTIONS: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR"];

const FORMAT_OPTIONS: { value: LogDownloadFormat; label: string; icon: React.ReactNode }[] = [
  { value: "txt", label: "TXT 文本", icon: <FileText size={16} /> },
  { value: "json", label: "JSON 格式", icon: <FileJson size={16} /> },
  { value: "csv", label: "CSV 表格", icon: <Table size={16} /> },
];

export default function LogCenterPage() {
  const [logs, setLogs] = useState<LogRecord[]>(mockLogs);
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>("all");
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>(["INFO", "WARN", "ERROR"]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<LogDownloadFormat>("txt");

  /**
   * 过滤日志
   */
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedTask !== "all" && log.task !== selectedTask) return false;
      if (selectedExecutionId !== "all" && log.executionId !== selectedExecutionId) return false;
      if (!selectedLevels.includes(log.level)) return false;
      if (searchKeyword && !log.message.toLowerCase().includes(searchKeyword.toLowerCase()))
        return false;
      return true;
    });
  }, [logs, selectedTask, selectedExecutionId, selectedLevels, searchKeyword]);

  /**
   * 获取唯一的任务列表
   */
  const taskOptions = useMemo(() => {
    const tasks = [...new Set(logs.map((log) => log.task))];
    return [
      { value: "all", label: "全部任务" },
      ...tasks.map((task) => ({ value: task, label: task })),
    ];
  }, [logs]);

  /**
   * 获取唯一的执行ID列表
   */
  const executionIdOptions = useMemo(() => {
    const ids = [...new Set(logs.map((log) => log.executionId || "").filter(Boolean))];
    return [
      { value: "all", label: "全部执行" },
      ...ids.map((id) => ({ value: id, label: `执行 ${id}` })),
    ];
  }, [logs]);

  /**
   * 自动刷新
   */
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLogs((prev) => [
          {
            id: Date.now(),
            time: new Date().toISOString().replace("T", " ").slice(0, 23),
            level: "INFO",
            task: "客户数据同步",
            executionId: "exec-001",
            message: `自动刷新测试日志 ${Date.now()}`,
          },
          ...prev,
        ]);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  /**
   * 处理下载确认
   */
  const handleDownloadConfirm = () => {
    if (filteredLogs.length === 0) {
      message.warning("没有可下载的日志");
      return;
    }

    const filename = selectedExecutionId !== "all"
      ? `logs_${selectedExecutionId}`
      : selectedTask !== "all"
        ? `logs_${selectedTask.replace(/\s+/g, "_")}`
        : "logs";

    // 格式化日志内容
    const content = filteredLogs.map((log) =>
      `[${log.time}] [${log.level}] [${log.task}] ${log.executionId ? `[${log.executionId}] ` : ""}${log.message}`
    ).join("\n");

    const fullFilename = `${filename}.${downloadFormat}`;
    exportLogs(content, fullFilename);
    message.success(`已下载 ${filteredLogs.length} 条日志 (${downloadFormat.toUpperCase()} 格式)`);
    setDownloadModalOpen(false);
  };

  /**
   * 处理清空
   */
  const handleClear = () => {
    Modal.confirm({
      title: "确认清空",
      content: "确定要清空当前显示的所有日志吗？此操作不可恢复。",
      okText: "确认清空",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        setLogs([]);
        message.success("日志已清空");
      },
    });
  };

  /**
   * 高亮关键词
   */
  const highlightKeyword = (text: string) => {
    if (!searchKeyword) return text;
    const parts = text.split(new RegExp(`(${searchKeyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchKeyword.toLowerCase()
        ? <span key={i} style={{ backgroundColor: "#FEF08A", padding: "0 2px" }}>{part}</span>
        : part
    );
  };

  return (
    <PageLayout title="日志中心">
      <PageBreadcrumb items={BREADCRUMB_ITEMS} />

      {/* 过滤栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Space wrap>
            <Select
              value={selectedTask}
              onChange={setSelectedTask}
              options={taskOptions}
              style={{ width: 180 }}
              placeholder="选择任务"
            />
            <Select
              value={selectedExecutionId}
              onChange={setSelectedExecutionId}
              options={executionIdOptions}
              style={{ width: 150 }}
              placeholder="执行ID"
            />
            <DatePicker.RangePicker showTime placeholder={["开始时间", "结束时间"]} />
            <Dropdown
              menu={{
                items: LEVEL_OPTIONS.map((level) => ({
                  key: level,
                  label: (
                    <Checkbox
                      checked={selectedLevels.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLevels([...selectedLevels, level]);
                        } else {
                          setSelectedLevels(selectedLevels.filter((l) => l !== level));
                        }
                      }}
                    >
                      <Tag color={LOG_LEVEL_COLORS[level]}>{level}</Tag>
                    </Checkbox>
                  ),
                })),
              }}
            >
              <Button icon={<Filter size={14} />}>
                级别 {selectedLevels.length > 0 && `(${selectedLevels.length})`}
                <ChevronDown size={12} style={{ marginLeft: 4 }} />
              </Button>
            </Dropdown>
            <Input
              placeholder="搜索关键词..."
              prefix={<Search size={14} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Space>
          <Space>
            <span style={{ color: "#6B7280" }}>自动刷新</span>
            <Switch checked={autoRefresh} onChange={setAutoRefresh} />
            <Button icon={<RefreshCw size={14} />}>刷新</Button>
            <Button
              type="primary"
              icon={<Download size={14} />}
              onClick={() => setDownloadModalOpen(true)}
            >
              下载日志
            </Button>
            <Button icon={<Trash2 size={14} />} danger onClick={handleClear}>
              清空
            </Button>
          </Space>
        </div>
      </Card>

      {/* 日志统计 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <span>
            总计: <strong>{filteredLogs.length}</strong> 条
          </span>
          {LEVEL_OPTIONS.map((level) => (
            <span key={level}>
              <Tag color={LOG_LEVEL_COLORS[level]}>{level}</Tag>
              {filteredLogs.filter((l) => l.level === level).length}
            </span>
          ))}
        </Space>
      </Card>

      {/* 日志列表 */}
      <Card>
        <List
          dataSource={filteredLogs}
          renderItem={(log) => (
            <List.Item style={{ padding: "8px 0", borderBottom: "1px solid #F0F0F0" }}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontFamily: "monospace",
                  fontSize: 13,
                  width: "100%",
                }}
              >
                <span style={{ color: "#6B7280", minWidth: 180 }}>
                  <Clock size={12} style={{ marginRight: 4 }} />
                  {log.time}
                </span>
                <Tag
                  color={LOG_LEVEL_COLORS[log.level]}
                  style={{ minWidth: 60, textAlign: "center" }}
                >
                  {log.level}
                </Tag>
                <span style={{ color: "#2563EB", minWidth: 120 }}>{log.task}</span>
                {log.executionId && (
                  <span style={{ color: "#8B5CF6", minWidth: 80 }}>{log.executionId}</span>
                )}
                <span
                  style={{ color: log.level === "ERROR" ? "#EF4444" : "#1E293B", flex: 1 }}
                >
                  {highlightKeyword(log.message)}
                </span>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: "暂无日志记录" }}
          loadMore={
            filteredLogs.length > 0 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button>加载更多</Button>
              </div>
            )
          }
        />
      </Card>

      {/* 下载选项弹窗 */}
      <Modal
        title="下载日志"
        open={downloadModalOpen}
        onOk={handleDownloadConfirm}
        onCancel={() => setDownloadModalOpen(false)}
        okText="确认下载"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8, color: "#6B7280" }}>
            当前筛选条件下共有 <strong>{filteredLogs.length}</strong> 条日志
          </p>
          {selectedTask !== "all" && (
            <p style={{ marginBottom: 4 }}>
              任务: <Tag color="blue">{selectedTask}</Tag>
            </p>
          )}
          {selectedExecutionId !== "all" && (
            <p style={{ marginBottom: 4 }}>
              执行ID: <Tag color="purple">{selectedExecutionId}</Tag>
            </p>
          )}
        </div>
        <div>
          <p style={{ marginBottom: 8, fontWeight: 500 }}>选择导出格式:</p>
          <Radio.Group
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value)}
            style={{ width: "100%" }}
          >
            <Space orientation="vertical" style={{ width: "100%" }}>
              {FORMAT_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  <Space>
                    {option.icon}
                    {option.label}
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </PageLayout>
  );
}