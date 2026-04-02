import { Injectable } from '@nestjs/common';
import type {
  CompiledResource,
  ResourceDirectoryNode,
  ResourceMapping,
  RegisteredResource,
  ServiceApplication,
  SharingService,
  TaskExecution,
} from '@ai-datahub/contract';

@Injectable()
export class DataSharingStore {
  directories: ResourceDirectoryNode[] = [];
  registeredResources: RegisteredResource[] = [];
  compiledResources: CompiledResource[] = [];
  mappings = new Map<string, ResourceMapping>(); // compiledResourceId -> mapping
  services: SharingService[] = [];
  applications: ServiceApplication[] = [];
  exchangeExecutions: TaskExecution[] = [];
}
