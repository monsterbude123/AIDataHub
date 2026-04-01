import type { DictionaryCategoryNode } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface DictionaryCategoryRepository {
  list(parentId?: ID): Promise<DictionaryCategoryNode[]>;
  create(
    node: Omit<DictionaryCategoryNode, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ categoryId: ID }>;
  update(
    node: Omit<DictionaryCategoryNode, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  delete(categoryId: ID): Promise<boolean>;
}

export class InMemoryDictionaryCategoryRepository implements DictionaryCategoryRepository {
  private categories: DictionaryCategoryNode[] = [];
  private nextId = 1;

  async list(parentId?: ID): Promise<DictionaryCategoryNode[]> {
    if (parentId === undefined) {
      return this.categories.filter((c) => c.parentId === undefined);
    }
    return this.categories.filter((c) => c.parentId === parentId);
  }

  async create(
    node: Omit<DictionaryCategoryNode, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ categoryId: ID }> {
    const now = new Date().toISOString();
    const id = `dc-${this.nextId++}`;
    this.categories.push({
      ...node,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { categoryId: id };
  }

  async update(
    node: Omit<DictionaryCategoryNode, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const idx = this.categories.findIndex((c) => c.id === node.id);
    if (idx < 0) return false;
    this.categories[idx] = {
      ...this.categories[idx],
      ...node,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(categoryId: ID): Promise<boolean> {
    const len = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== categoryId);
    return this.categories.length < len;
  }
}
