import type { MetadataVersion } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class MetadataVersionEntity implements MetadataVersion {
  id: ID;
  dataAssetId: ID;
  version: string;
  createdAt: ISODateTime;
  createdBy?: ID;
  summary?: string;

  constructor(data: Omit<MetadataVersion, 'id' | 'createdAt'>) {
    this.id = '';
    this.dataAssetId = data.dataAssetId;
    this.version = data.version;
    this.createdBy = data.createdBy;
    this.summary = data.summary;
    this.createdAt = new Date().toISOString();
  }
}
