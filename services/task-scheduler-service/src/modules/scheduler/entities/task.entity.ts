/**
 * 任务状态
 */
export enum TaskStatus {
  READY = 'READY',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED',
}

/**
 * 任务类型
 */
export enum TaskType {
  ONE_TIME = 'ONE_TIME',
  SCHEDULED = 'SCHEDULED',
  EVENT_DRIVEN = 'EVENT_DRIVEN',
}

/**
 * 重试策略
 */
export interface RetryPolicy {
  maxRetries: number;
  retryDelayMs: number;
  backoffMultiplier?: number;
}

/**
 * 任务实体
 */
export class TaskEntity {
  id!: string;
  name!: string;
  description?: string;
  module!: string;
  type!: TaskType;
  status!: TaskStatus;
  cronExpression?: string;
  config!: Record<string, unknown>;
  priority!: number;
  queueId?: string;
  retryPolicy?: RetryPolicy;
  enabled!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
