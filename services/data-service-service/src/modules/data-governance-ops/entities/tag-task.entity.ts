import type { TagTask, ID, ISODateTime } from '@ai-datahub/contract';

export class TagTaskEntity implements TagTask {
  id!: ID;
  name!: string;
  tagId!: ID;
  ruleIds!: ID[];
  schedule?: string;
  enabled!: boolean;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;
}
