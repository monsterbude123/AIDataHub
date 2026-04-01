import type { TagSubject, ID, ISODateTime } from '@ai-datahub/contract';

export class TagSubjectEntity implements TagSubject {
  id!: ID;
  type!: 'PERSON' | 'ORG' | 'ASSET' | 'CUSTOM';
  externalId!: string;
  name?: string;
  attributes?: Record<string, unknown>;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;
}
