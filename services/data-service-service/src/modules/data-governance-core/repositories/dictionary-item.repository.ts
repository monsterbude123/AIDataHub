import type {
  DictionaryItem,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface DictionaryItemRepository {
  list(
    dictionaryId: ID,
    _useCache: boolean,
    page: PageRequest
  ): Promise<PageResult<DictionaryItem>>;
}

export class InMemoryDictionaryItemRepository implements DictionaryItemRepository {
  private items: DictionaryItem[] = [];

  async list(
    dictionaryId: ID,
    _useCache: boolean,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<DictionaryItem>> {
    // useCache is ignored in memory - always available
    const filtered = this.items.filter((i) => i.dictionaryId === dictionaryId);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      page,
      pageSize,
      total: filtered.length,
      items,
    };
  }

  // Note: import would normally have upsert for the full implementation
}
