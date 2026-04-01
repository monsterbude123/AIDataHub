/**
 * 任务执行状态
 */
export enum TaskExecutionStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

/**
 * 触发类型
 */
export type TriggerType = 'MANUAL' | 'SCHEDULED' | 'EVENT';

/**
 * 任务执行实体
 */
export class TaskExecutionEntity {
  id!: string;
  taskId!: string;
  status!: TaskExecutionStatus;
  triggerType!: TriggerType;
  startedAt?: Date;
  endedAt?: Date;
  durationMs?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  rowsProcessed?: number;
  errorMessage?: string;
  errorStack?: string;
  logsRef?: string;
  retryCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
