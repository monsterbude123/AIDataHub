import type { Tag, PageResult, PageRequest } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface TagRepository {
  create(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<{ tagId: ID }>;
  update(tag: Omit<Tag, 'createdAt'>): Promise<boolean>;
  delete(tagId: ID): Promise<boolean>;
  query(
    keyword: string | undefined,
    page: PageRequest
  ): Promise<PageResult<Tag>>;
}

export class InMemoryTagRepository implements TagRepository {
  private tags: Tag[] = [];
  private nextId = 1;

  async create(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<{ tagId: ID }> {
    const now = new Date().toISOString();
    const id = `t-${this.nextId++}`;
    this.tags.push({
      ...tag,
      id,
      createdAt: now,
    });
    return { tagId: id };
  }

  async update(tag: Omit<Tag, 'createdAt'>): Promise<boolean> {
    const idx = this.tags.findIndex((t) => t.id === tag.id);
    if (idx < 0) return false;
    this.tags[idx] = {
      ...this.tags[idx],
      ...tag,
    };
    return true;
  }

  async delete(tagId: ID): Promise<boolean> {
    const len = this.tags.length;
    this.tags = this.tags.filter((t) => t.id !== tagId);
    return this.tags.length < len;
  }

  async query(
    keyword: string | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<Tag>> {
    let filtered = this.tags;
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.code.toLowerCase().includes(lower)
      );
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
