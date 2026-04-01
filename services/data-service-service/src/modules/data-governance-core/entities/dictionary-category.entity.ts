import type { DictionaryCategoryNode } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class DictionaryCategoryEntity implements DictionaryCategoryNode {
  id!: ID;
  parentId?: ID;
  name!: string;
  code!: string;
  sort?: number;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;

  constructor(initial: Partial<DictionaryCategoryEntity>) {
    Object.assign(this, initial);
  }
}
