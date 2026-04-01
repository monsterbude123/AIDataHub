import type { QualityApprovalSwitch, ISODateTime } from '@ai-datahub/contract';

export class QualityApprovalSwitchEntity implements QualityApprovalSwitch {
  ruleApprovalEnabled!: boolean;
  taskApprovalEnabled!: boolean;
  updatedAt!: ISODateTime;
}
