import type {
  QualityReport,
  PageResult,
  PageRequest,
  QualityIssue,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface QualityReportRepository {
  create(report: Omit<QualityReport, 'id'>): Promise<{ reportId: ID }>;
  getById(reportId: ID): Promise<QualityReport | null>;
  listByTaskId(
    taskId: ID,
    page: PageRequest
  ): Promise<PageResult<QualityReport>>;
  listIssues(
    reportId: ID,
    page: PageRequest
  ): Promise<PageResult<QualityIssue>>;
}

export class InMemoryQualityReportRepository implements QualityReportRepository {
  private reports: QualityReport[] = [];
  private nextReportId = 1;

  async create(report: Omit<QualityReport, 'id'>): Promise<{ reportId: ID }> {
    const id = `qrep-${this.nextReportId++}`;
    this.reports.push({
      ...report,
      id,
    });
    return { reportId: id };
  }

  async getById(reportId: ID): Promise<QualityReport | null> {
    return this.reports.find((r) => r.id === reportId) || null;
  }

  async listByTaskId(
    taskId: ID,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<QualityReport>> {
    const filtered = this.reports.filter((r) => r.taskId === taskId);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      page,
      pageSize,
      total: filtered.length,
      items,
    };
  }

  async listIssues(
    reportId: ID,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<QualityIssue>> {
    // In-memory: issues are stored with the report, no separate lookup
    const report = this.reports.find((r) => r.id === reportId);
    const filtered: QualityIssue[] = report?.issuesSample || [];
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
