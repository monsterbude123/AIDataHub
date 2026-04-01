import type { ColumnMetadata } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export class ColumnMetadataEntity implements ColumnMetadata {
  id: ID;
  dataAssetId: ID;
  name: string;
  code?: string;
  dataType: string;
  precision?: number;
  scale?: number;
  description?: string;
  isPrimaryKey?: boolean;
  standardDataElementId?: ID;
  dictionaryId?: ID;

  constructor(data: Omit<ColumnMetadata, 'id'>) {
    this.id = '';
    this.dataAssetId = data.dataAssetId;
    this.name = data.name;
    this.code = data.code;
    this.dataType = data.dataType;
    this.precision = data.precision;
    this.scale = data.scale;
    this.description = data.description;
    this.isPrimaryKey = data.isPrimaryKey;
    this.standardDataElementId = data.standardDataElementId;
    this.dictionaryId = data.dictionaryId;
  }
}
