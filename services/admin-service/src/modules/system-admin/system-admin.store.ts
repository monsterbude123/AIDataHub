import { Injectable } from '@nestjs/common';
import type {
  DriverDef,
  FunctionDef,
  OperationLog,
  PackageDef,
  Project,
  ProjectGroup,
  WorkTicket,
} from '@ai-datahub/contract';

@Injectable()
export class SystemAdminStore {
  projects: Project[] = [];
  projectGroups: ProjectGroup[] = [];
  groupProjects = new Map<string, string[]>();
  groupUsers = new Map<string, string[]>();

  functions: FunctionDef[] = [];
  drivers: DriverDef[] = [];
  packages: PackageDef[] = [];
  operationLogs: OperationLog[] = [];
  tickets: WorkTicket[] = [];
}
