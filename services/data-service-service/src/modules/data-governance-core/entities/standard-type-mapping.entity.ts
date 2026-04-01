import type { StandardTypeMapping } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class StandardTypeMappingEntity implements StandardTypeMapping {
  id!: ID;
  sourceSystem!: string;
  sourceType!: string;
  standardType!: string;
  createdAt!: ISODateTime;

  constructor(initial: Partial<StandardTypeMappingEntity>) {
    Object.assign(this, initial);
  }
}
