import { Injectable } from '@nestjs/common';
import type {
  ArchiveRecord,
  EncryptionTask,
  LifecyclePolicy,
  MaskingAlgorithm,
  MaskingConfig,
  MaskingRule,
  RowLevelPolicy,
  SecurityClassification,
  WatermarkTask,
} from '@ai-datahub/contract';

@Injectable()
export class SecurityStore {
  private seq = {
    alg: 0,
    rule: 0,
    cfg: 0,
    rlp: 0,
    wm: 0,
    enc: 0,
    lcp: 0,
    ar: 0,
  };

  algorithms: MaskingAlgorithm[] = [];
  rules: MaskingRule[] = [];
  configs: MaskingConfig[] = [];
  classifications = new Map<string, SecurityClassification>();
  policies: RowLevelPolicy[] = [];
  watermarkTasks: WatermarkTask[] = [];
  encryptionTasks: EncryptionTask[] = [];

  lifecyclePolicies: LifecyclePolicy[] = [];
  archiveRecords: ArchiveRecord[] = [];

  nextId(kind: keyof SecurityStore['seq']): string {
    this.seq[kind] += 1;
    return `${kind}_${this.seq[kind]}`;
  }
}
