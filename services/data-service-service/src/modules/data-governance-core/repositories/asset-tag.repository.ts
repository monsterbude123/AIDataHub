import type { AssetTag } from '@ai-datahub/contract';

export interface AssetTagRepository {
  findAll(keyword?: string): Promise<AssetTag[]>;
}

export class InMemoryAssetTagRepository implements AssetTagRepository {
  private tags: AssetTag[] = [];

  async findAll(keyword?: string): Promise<AssetTag[]> {
    if (!keyword) {
      return this.tags;
    }
    return this.tags.filter((t) =>
      t.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}
