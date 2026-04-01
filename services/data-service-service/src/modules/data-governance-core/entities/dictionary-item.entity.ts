import type { DictionaryItem } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export class DictionaryItemEntity implements DictionaryItem {
  id!: ID;
  dictionaryId!: ID;
  key!: string;
  value!: string;
  description?: string;

  constructor(initial: Partial<DictionaryItemEntity>) {
    Object.assign(this, initial);
  }
}
