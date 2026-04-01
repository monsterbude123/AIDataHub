import type { AssetTag } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class AssetTagEntity implements AssetTag {
  id!: ID;
  name!: string;
  createdAt!: ISODateTime;

  constructor(initial: Partial<AssetTagEntity>) {
    Object.assign(this, initial);
  }
}
