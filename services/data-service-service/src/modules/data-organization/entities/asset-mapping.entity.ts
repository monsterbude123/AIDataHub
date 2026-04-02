import type { AssetMapping } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class AssetMappingEntity implements AssetMapping {
  id: ID;
  fromAssetId: ID;
  toAssetId: ID;
  fieldMappings: Array<{
    fromField: string;
    toField: string;
    transform?: string;
  }>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;

  constructor(data: Omit<AssetMapping, 'id' | 'createdAt' | 'updatedAt'>) {
    this.id = '';
    this.fromAssetId = data.fromAssetId;
    this.toAssetId = data.toAssetId;
    this.fieldMappings = data.fieldMappings;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
