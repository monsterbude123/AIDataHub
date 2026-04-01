import type { TagRule, ID, ISODateTime } from '@ai-datahub/contract';

export class TagRuleEntity implements TagRule {
  id!: ID;
  tagId!: ID;
  sourceType!: 'DATA_ASSET' | 'SQL';
  dataAssetIds?: ID[];
  sql?: string;
  mode!: 'FULL' | 'INCREMENTAL';
  config?: Record<string, unknown>;
  enabled!: boolean;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;
}
