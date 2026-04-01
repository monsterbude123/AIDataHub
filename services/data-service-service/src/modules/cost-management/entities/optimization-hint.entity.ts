import type { OptimizationHint } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class OptimizationHintEntity implements OptimizationHint {
  id!: ID;
  type!: 'ZOMBIE_TABLE' | 'UNUSED_DATA' | 'OVER_QUOTA';
  title!: string;
  detail!: string;
  severity!: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt!: ISODateTime;

  constructor(initial: Partial<OptimizationHintEntity>) {
    Object.assign(this, initial);
  }
}
