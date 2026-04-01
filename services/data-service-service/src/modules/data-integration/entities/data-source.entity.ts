import type { DataSource, DataSourceStatus } from '@ai-datahub/contract';
import type { ID, ISODateTime } from '@ai-datahub/contract';

export class DataSourceEntity implements DataSource {
  id: ID;
  name: string;
  type: DataSource['type'];
  jdbcUrl?: string;
  username?: string;
  passwordRef?: string;
  driverClass?: string;
  orgId: ID;
  projectId?: ID;
  description?: string;
  status: DataSourceStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;

  constructor(data: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>) {
    this.id = '';
    this.name = data.name;
    this.type = data.type;
    this.jdbcUrl = data.jdbcUrl;
    this.username = data.username;
    this.passwordRef = data.passwordRef;
    this.driverClass = data.driverClass;
    this.orgId = data.orgId;
    this.projectId = data.projectId;
    this.description = data.description;
    this.status = data.status;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
