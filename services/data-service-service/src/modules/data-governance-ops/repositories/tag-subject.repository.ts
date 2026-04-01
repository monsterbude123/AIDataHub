import type { TagSubject, PageResult, PageRequest } from '@ai-datahub/contract';
import type { ID, TagSubject as TagSubjectType } from '@ai-datahub/contract';

export interface TagSubjectRepository {
  upsert(
    subject: Omit<TagSubjectType, 'createdAt' | 'updatedAt'> & { id?: ID }
  ): Promise<{ subjectId: ID }>;
  list(
    keyword: string | undefined,
    type: TagSubjectType['type'] | undefined,
    page: PageRequest
  ): Promise<PageResult<TagSubject>>;
  getSubjectTags(subjectId: ID): Promise<ID[]>;
  addSubjectTag(subjectId: ID, tagId: ID): Promise<void>;
}

export class InMemoryTagSubjectRepository implements TagSubjectRepository {
  private subjects: TagSubject[] = [];
  private subjectTags: Map<ID, ID[]> = new Map();
  private nextId = 1;

  async upsert(
    subject: Omit<TagSubjectType, 'createdAt' | 'updatedAt'> & { id?: ID }
  ): Promise<{ subjectId: ID }> {
    const now = new Date().toISOString();
    if (subject.id) {
      const idx = this.subjects.findIndex((s) => s.id === subject.id);
      if (idx >= 0) {
        this.subjects[idx] = {
          ...this.subjects[idx],
          ...subject,
          updatedAt: now,
        };
        return { subjectId: subject.id };
      }
    }
    const id = `ts-${this.nextId++}`;
    this.subjects.push({
      ...subject,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { subjectId: id };
  }

  async list(
    keyword: string | undefined,
    type: TagSubjectType['type'] | undefined,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<TagSubject>> {
    let filtered = this.subjects;
    if (type !== undefined) {
      filtered = filtered.filter((s) => s.type === type);
    }
    if (keyword) {
      const lower = keyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(lower) ||
          false ||
          s.externalId.toLowerCase().includes(lower)
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

  async getSubjectTags(subjectId: ID): Promise<ID[]> {
    return this.subjectTags.get(subjectId) || [];
  }

  async addSubjectTag(subjectId: ID, tagId: ID): Promise<void> {
    const tags = this.subjectTags.get(subjectId) || [];
    if (!tags.includes(tagId)) {
      tags.push(tagId);
      this.subjectTags.set(subjectId, tags);
    }
  }
}
