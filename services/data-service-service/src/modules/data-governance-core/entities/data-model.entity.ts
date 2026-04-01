import type { DataModel } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class DataModelEntity implements DataModel {
  id!: ID;
  name!: string;
  version!: string;
  status!: 'DRAFT' | 'APPROVED' | 'ONLINE' | 'OFFLINE';
  definition!: Record<string, unknown>;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;

  constructor(initial: Partial<DataModelEntity>) {
    Object.assign(this, initial);
  }
}
