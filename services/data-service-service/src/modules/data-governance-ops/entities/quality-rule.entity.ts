import type { QualityRule, ID, ISODateTime } from '@ai-datahub/contract';

export class QualityRuleEntity implements QualityRule {
  id!: ID;
  name!: string;
  type!: 'CONSISTENCY' | 'ACCURACY' | 'COMPLETENESS' | 'STANDARD' | 'RELATION';
  definition!: Record<string, unknown>;
  enabled!: boolean;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;
}
