import type { Dictionary } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class DictionaryEntity implements Dictionary {
  id!: ID;
  name!: string;
  type!: 'CUSTOM' | 'DATASET';
  config!: Record<string, unknown>;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;

  constructor(initial: Partial<DictionaryEntity>) {
    Object.assign(this, initial);
  }
}
