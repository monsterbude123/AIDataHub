import type { AuditTask } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class AuditTaskEntity implements AuditTask {
  id!: ID;
  type!: 'MODEL_AUDIT';
  enabled!: boolean;
  schedule?: string;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;

  constructor(initial: Partial<AuditTaskEntity>) {
    Object.assign(this, initial);
  }
}
