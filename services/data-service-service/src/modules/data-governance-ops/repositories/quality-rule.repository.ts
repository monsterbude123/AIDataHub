import type {
  QualityRule,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface QualityRuleRepository {
  create(
    rule: Omit<QualityRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ ruleId: ID }>;
  update(rule: Omit<QualityRule, 'createdAt' | 'updatedAt'>): Promise<boolean>;
  delete(ruleId: ID): Promise<boolean>;
  list(
    keyword: string | undefined,
    page: PageRequest
  ): Promise<PageResult<QualityRule>>;
}

export class InMemoryQualityRuleRepository implements QualityRuleRepository {
  private rules: QualityRule[] = [];
  private nextId = 1;

  async create(
    rule: Omit<QualityRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ ruleId: ID }> {
    const now = new Date().toISOString();
    const id = `qr-${this.nextId++}`;
    this.rules.push({
      ...rule,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { ruleId: id };
  }

  async update(
    rule: Omit<QualityRule, 'createdAt' | 'updatedAt'>
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
    keyword: string | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<QualityRule>> {
    let filtered = this.rules;
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(lower));
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
