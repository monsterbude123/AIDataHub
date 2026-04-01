import type { Tag, ID, ISODateTime } from '@ai-datahub/contract';

export class TagEntity implements Tag {
  id!: ID;
  code!: string;
  name!: string;
  level?: number;
  description?: string;
  createdAt!: ISODateTime;
}
