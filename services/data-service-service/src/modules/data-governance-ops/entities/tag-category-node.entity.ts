import type { TagCategoryNode, ID, ISODateTime } from '@ai-datahub/contract';

export class TagCategoryNodeEntity implements TagCategoryNode {
  id!: ID;
  parentId?: ID;
  name!: string;
  code!: string;
  sort?: number;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;
}
