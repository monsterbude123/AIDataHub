import type { AuditRun } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class AuditRunEntity implements AuditRun {
  id!: ID;
  taskId!: ID;
  startedAt!: ISODateTime;
  endedAt?: ISODateTime;
  status!: 'RUNNING' | 'SUCCESS' | 'FAILED';
  summary?: Record<string, unknown>;

  constructor(initial: Partial<AuditRunEntity>) {
    Object.assign(this, initial);
  }
}
