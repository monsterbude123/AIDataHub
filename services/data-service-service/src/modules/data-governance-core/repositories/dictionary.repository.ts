import type { Dictionary, PageResult, PageRequest } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface DictionaryRepository {
  create(
    dictionary: Omit<Dictionary, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ dictionaryId: ID }>;
  update(
    dictionary: Omit<Dictionary, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  delete(dictionaryId: ID): Promise<boolean>;
  list(
    keyword: string | undefined,
    page: PageRequest
  ): Promise<PageResult<Dictionary>>;
}

export class InMemoryDictionaryRepository implements DictionaryRepository {
  private dictionaries: Dictionary[] = [];
  private nextId = 1;

  async create(
    dictionary: Omit<Dictionary, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ dictionaryId: ID }> {
    const now = new Date().toISOString();
    const id = `dict-${this.nextId++}`;
    this.dictionaries.push({
      ...dictionary,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { dictionaryId: id };
  }

  async update(
    dictionary: Omit<Dictionary, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const idx = this.dictionaries.findIndex((d) => d.id === dictionary.id);
    if (idx < 0) return false;
    this.dictionaries[idx] = {
      ...this.dictionaries[idx],
      ...dictionary,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(dictionaryId: ID): Promise<boolean> {
    const len = this.dictionaries.length;
    this.dictionaries = this.dictionaries.filter((d) => d.id !== dictionaryId);
    return this.dictionaries.length < len;
  }

  async list(
    keyword: string | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<Dictionary>> {
    let filtered = this.dictionaries;
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(lower));
    }
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      page,
      pageSize,
      total: filtered.length,
      items,
    };
  }
}
