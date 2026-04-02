import type { LayerDirectoryNode, DataLayerNode } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class LayerDirectoryEntity implements LayerDirectoryNode {
  id: ID;
  layer: DataLayerNode;
  parentId?: ID;
  name: string;
  code: string;
  sort?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;

  constructor(
    data: Omit<LayerDirectoryNode, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    this.id = '';
    this.layer = data.layer;
    this.parentId = data.parentId;
    this.name = data.name;
    this.code = data.code;
    this.sort = data.sort;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
