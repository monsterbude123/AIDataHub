import type { ID } from '@ai-datahub/contract';

/**
 * 队列实体
 */
export class QueueEntity {
  id!: ID;
  name!: string;
  description?: string;
  priority!: number;
  resourceIsolationKey?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
