import type { TagCategoryNode } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface TagCategoryRepository {
  list(parentId?: ID): Promise<TagCategoryNode[]>;
  create(
    node: Omit<TagCategoryNode, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ categoryId: ID }>;
  update(
    node: Omit<TagCategoryNode, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  delete(categoryId: ID): Promise<boolean>;
}

export class InMemoryTagCategoryRepository implements TagCategoryRepository {
  private categories: TagCategoryNode[] = [];
  private nextId = 1;

  async list(parentId?: ID): Promise<TagCategoryNode[]> {
    if (parentId === undefined) {
      return this.categories.filter((c) => c.parentId === undefined);
    }
    return this.categories.filter((c) => c.parentId === parentId);
  }

  async create(
    node: Omit<TagCategoryNode, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ categoryId: ID }> {
    const now = new Date().toISOString();
    const id = `tc-${this.nextId++}`;
    this.categories.push({
      ...node,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { categoryId: id };
  }

  async update(
    node: Omit<TagCategoryNode, 'createdAt' | 'updatedAt'>
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
