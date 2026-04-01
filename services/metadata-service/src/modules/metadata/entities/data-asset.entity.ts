import type { DataAsset } from '@ai-datahub/contract';
import type {
  ID,
  ISODateTime,
  DataAssetType,
  DataLayer,
} from '@ai-datahub/contract';

export class DataAssetEntity implements DataAsset {
  id: ID;
  name: string;
  code: string;
  dataSourceId: ID;
  type: DataAssetType;
  layer: DataLayer;
  description?: string;
  ownerId?: ID;
  securityLevel?: number;
  securityCategory?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;

  constructor(data: Omit<DataAsset, 'id' | 'createdAt' | 'updatedAt'>) {
    this.id = '';
    this.name = data.name;
    this.code = data.code;
    this.dataSourceId = data.dataSourceId;
    this.type = data.type;
    this.layer = data.layer;
    this.description = data.description;
    this.ownerId = data.ownerId;
    this.securityLevel = data.securityLevel;
    this.securityCategory = data.securityCategory;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
