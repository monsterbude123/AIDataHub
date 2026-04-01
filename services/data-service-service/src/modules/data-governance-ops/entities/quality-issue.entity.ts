import type { QualityIssue, ID, ISODateTime } from '@ai-datahub/contract';

export class QualityIssueEntity implements QualityIssue {
  id!: ID;
  taskId!: ID;
  ruleId!: ID;
  dataAssetId!: ID;
  locator?: Record<string, unknown>;
  description?: string;
  createdAt!: ISODateTime;
}
