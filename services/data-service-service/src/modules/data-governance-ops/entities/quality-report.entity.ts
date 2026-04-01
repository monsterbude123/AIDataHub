import type { QualityReport, ID, ISODateTime } from '@ai-datahub/contract';
import type { QualityIssue } from '@ai-datahub/contract';

export class QualityReportEntity implements QualityReport {
  id!: ID;
  taskId!: ID;
  executionId!: ID;
  summary!: {
    totalRecords?: number;
    problemRecords?: number;
    problemRatio?: number;
  };
  issuesSample?: QualityIssue[];
  suggestions?: string[];
  generatedAt!: ISODateTime;
}
