"use client";

/**
 * 项目阶段进度组件
 * 展示项目各阶段的进度状态，支持阶段推进和回退操作
 */

import { Steps, Button, Space, Modal, Input, message, Typography } from "antd";
import type { StepsProps } from "antd";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";

import type { ProjectPhase } from "@/types/project";
import { PROJECT_PHASE_LABELS } from "@/types/project";

const { TextArea } = Input;
const { Text } = Typography;

/**
 * 阶段顺序配置
 */
const PHASE_ORDER: ProjectPhase[] = ["initiation", "planning", "execution", "acceptance", "closed"];

/**
 * 阶段状态类型
 */
type PhaseStatus = "completed" | "current" | "pending";

/**
 * ProjectPhaseProgress 组件属性
 */
interface ProjectPhaseProgressProps {
  /** 当前阶段 */
  currentPhase: ProjectPhase;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 是否为项目经理（有权限操作） */
  isManager?: boolean;
  /** 推进阶段回调 */
  onAdvance?: () => void;
  /** 回退阶段回调 */
  onRevert?: (reason: string) => void;
}

/**
 * 项目阶段进度组件
 */
export function ProjectPhaseProgress({
  currentPhase,
  showActions = true,
  isManager = false,
  onAdvance,
  onRevert,
}: ProjectPhaseProgressProps) {
  const [revertModalOpen, setRevertModalOpen] = useState(false);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [revertReason, setRevertReason] = useState("");

  /**
   * 获取阶段索引
   */
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  /**
   * 获取阶段状态
   */
  const getPhaseStatus = (phase: ProjectPhase, index: number): PhaseStatus => {
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "pending";
  };

  /**
   * 步骤配置
   */
  const stepsItems: StepsProps["items"] = PHASE_ORDER.map((phase, index) => ({
    key: phase,
    title: PROJECT_PHASE_LABELS[phase],
    status: (getPhaseStatus(phase, index) === "completed" ? "finish" : getPhaseStatus(phase, index) === "current" ? "process" : "wait") as "finish" | "process" | "wait",
    description: (
      <Text style={{ fontSize: 12, color: getPhaseStatus(phase, index) === "completed" ? "#10B981" : getPhaseStatus(phase, index) === "current" ? "#F59E0B" : "#6B7280" }}>
        {getPhaseStatus(phase, index) === "completed" && "完成"}
        {getPhaseStatus(phase, index) === "current" && "进行中"}
        {getPhaseStatus(phase, index) === "pending" && "待开始"}
      </Text>
    ),
  }));

  /**
   * 是否可以推进
   */
  const canAdvance = currentIndex < PHASE_ORDER.length - 1;

  /**
   * 是否可以回退
   */
  const canRevert = currentIndex > 0;

  /**
   * 处理推进阶段
   */
  const handleAdvance = () => {
    if (!canAdvance) {
      message.warning("已是最后阶段，无法继续推进");
      return;
    }
    setAdvanceModalOpen(true);
  };

  /**
   * 确认推进阶段
   */
  const confirmAdvance = () => {
    onAdvance?.();
    setAdvanceModalOpen(false);
    message.success("阶段已推进");
  };

  /**
   * 处理回退阶段
   */
  const handleRevert = () => {
    if (!canRevert) {
      message.warning("已是初始阶段，无法回退");
      return;
    }
    setRevertModalOpen(true);
  };

  /**
   * 确认回退阶段
   */
  const confirmRevert = () => {
    if (!revertReason.trim()) {
      message.error("请填写回退原因");
      return;
    }
    onRevert?.(revertReason);
    setRevertReason("");
    setRevertModalOpen(false);
    message.success("阶段已回退");
  };

  return (
    <div>
      {/* 阶段进度条 */}
      <Steps
        current={currentIndex}
        items={stepsItems}
        style={{ marginBottom: showActions && isManager ? 16 : 0 }}
      />

      {/* 操作按钮 */}
      {showActions && isManager && (
        <Space style={{ marginTop: 16 }}>
          <Button
            icon={<ArrowRight size={14} />}
            onClick={handleAdvance}
            disabled={!canAdvance}
          >
            推进阶段
          </Button>
          <Button
            icon={<ArrowLeft size={14} />}
            onClick={handleRevert}
            disabled={!canRevert}
          >
            回退阶段
          </Button>
        </Space>
      )}

      {/* 推进确认弹窗 */}
      <Modal
        title="确认推进阶段"
        open={advanceModalOpen}
        onOk={confirmAdvance}
        onCancel={() => setAdvanceModalOpen(false)}
        okText="确认推进"
        cancelText="取消"
      >
        <Text>
          当前阶段: {PROJECT_PHASE_LABELS[currentPhase]}
          <br />
          目标阶段: {PROJECT_PHASE_LABELS[PHASE_ORDER[currentIndex + 1]]}
        </Text>
      </Modal>

      {/* 回退确认弹窗 */}
      <Modal
        title="确认回退阶段"
        open={revertModalOpen}
        onOk={confirmRevert}
        onCancel={() => {
          setRevertModalOpen(false);
          setRevertReason("");
        }}
        okText="确认回退"
        cancelText="取消"
      >
        <Text style={{ marginBottom: 12, display: "block" }}>
          当前阶段: {PROJECT_PHASE_LABELS[currentPhase]}
          <br />
          目标阶段: {PROJECT_PHASE_LABELS[PHASE_ORDER[currentIndex - 1]]}
        </Text>
        <TextArea
          placeholder="请填写回退原因（必填）"
          value={revertReason}
          onChange={(e) => setRevertReason(e.target.value)}
          rows={4}
          required
        />
      </Modal>
    </div>
  );
}