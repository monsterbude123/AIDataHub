import type { ID, RequestMeta, Organization } from '../../types';

export type ListOrganizationsRequest = {
  meta?: RequestMeta;
  keyword?: string;
};

export type CreateOrganizationRequest = {
  meta?: RequestMeta;
  org: Omit<Organization, 'id'>;
};

export type UpdateOrganizationRequest = {
  meta?: RequestMeta;
  org: Organization;
};

export type DeleteOrganizationRequest = {
  meta?: RequestMeta;
  orgId: ID;
};
