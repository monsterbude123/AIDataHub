import type { QualityTask, ID, ISODateTime } from '@ai-datahub/contract';

export class QualityTaskEntity implements QualityTask {
  id!: ID;
  name!: string;
  dataAssetId!: ID;
  ruleIds!: ID[];
  schedule?: string;
  enabled!: boolean;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;
}
