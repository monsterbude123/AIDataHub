import type { TagRule, PageResult, PageRequest } from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface TagRuleRepository {
  create(
    rule: Omit<TagRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ ruleId: ID }>;
  update(rule: Omit<TagRule, 'createdAt' | 'updatedAt'>): Promise<boolean>;
  delete(ruleId: ID): Promise<boolean>;
  list(tagId: ID | undefined, page: PageRequest): Promise<PageResult<TagRule>>;
}

export class InMemoryTagRuleRepository implements TagRuleRepository {
  private rules: TagRule[] = [];
  private nextId = 1;

  async create(
    rule: Omit<TagRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ ruleId: ID }> {
    const now = new Date().toISOString();
    const id = `tr-${this.nextId++}`;
    this.rules.push({
      ...rule,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { ruleId: id };
  }

  async update(
    rule: Omit<TagRule, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const idx = this.rules.findIndex((r) => r.id === rule.id);
    if (idx < 0) return false;
    this.rules[idx] = {
      ...this.rules[idx],
      ...rule,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(ruleId: ID): Promise<boolean> {
    const len = this.rules.length;
    this.rules = this.rules.filter((r) => r.id !== ruleId);
    return this.rules.length < len;
  }

  async list(
    tagId: ID | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<TagRule>> {
    let filtered = this.rules;
    if (tagId !== undefined) {
      filtered = filtered.filter((r) => r.tagId === tagId);
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
