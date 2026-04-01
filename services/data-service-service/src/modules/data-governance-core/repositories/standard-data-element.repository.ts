import type {
  StandardDataElement,
  PageResult,
  PageRequest,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface StandardDataElementRepository {
  create(
    element: Omit<StandardDataElement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ elementId: ID }>;
  update(
    element: Omit<StandardDataElement, 'createdAt' | 'updatedAt'>
  ): Promise<boolean>;
  delete(elementId: ID): Promise<boolean>;
  list(
    keyword: string | undefined,
    page: PageRequest
  ): Promise<PageResult<StandardDataElement>>;
}

export class InMemoryStandardDataElementRepository implements StandardDataElementRepository {
  private elements: StandardDataElement[] = [];
  private nextId = 1;

  async create(
    element: Omit<StandardDataElement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ elementId: ID }> {
    const now = new Date().toISOString();
    const id = `sde-${this.nextId++}`;
    this.elements.push({
      ...element,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { elementId: id };
  }

  async update(
    element: Omit<StandardDataElement, 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    const idx = this.elements.findIndex((e) => e.id === element.id);
    if (idx < 0) return false;
    this.elements[idx] = {
      ...this.elements[idx],
      ...element,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  async delete(elementId: ID): Promise<boolean> {
    const len = this.elements.length;
    this.elements = this.elements.filter((e) => e.id !== elementId);
    return this.elements.length < len;
  }

  async list(
    keyword: string | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<StandardDataElement>> {
    let filtered = this.elements;
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(lower) ||
          e.identifier.toLowerCase().includes(lower)
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
