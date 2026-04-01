import type { StandardDataElement } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class StandardDataElementEntity implements StandardDataElement {
  id!: ID;
  name!: string;
  identifier!: string;
  type!: string;
  length?: number;
  description?: string;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;

  constructor(initial: Partial<StandardDataElementEntity>) {
    Object.assign(this, initial);
  }
}
