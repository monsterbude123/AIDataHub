import type { Quota } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';
import type { CostDimension, ResourceType } from '@ai-datahub/contract';

export class QuotaEntity implements Quota {
  id!: ID;
  dimension!: CostDimension;
  orgId?: ID;
  projectId?: ID;
  resourceType!: ResourceType;
  limit!: number;
  enabled!: boolean;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;

  constructor(initial: Partial<QuotaEntity>) {
    Object.assign(this, initial);
  }
}
