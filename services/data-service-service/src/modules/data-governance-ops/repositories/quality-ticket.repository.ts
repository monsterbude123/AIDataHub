import type {
  QualityTicket,
  PageResult,
  PageRequest,
  QualityTicketStatus,
} from '@ai-datahub/contract';
import type { ID } from '@ai-datahub/contract';

export interface QualityTicketRepository {
  create(
    reportId: ID,
    assigneeUserId: ID,
    title: string,
    description?: string
  ): Promise<{ ticketId: ID }>;
  update(
    ticketId: ID,
    status?: QualityTicketStatus,
    description?: string
  ): Promise<boolean>;
  listByAssignee(
    assigneeUserId: ID,
    page: PageRequest
  ): Promise<PageResult<QualityTicket>>;
}

export class InMemoryQualityTicketRepository implements QualityTicketRepository {
  private tickets: QualityTicket[] = [];
  private nextId = 1;

  async create(
    reportId: ID,
    assigneeUserId: ID,
    title: string,
    description?: string
  ): Promise<{ ticketId: ID }> {
    const now = new Date().toISOString();
    const id = `qtick-${this.nextId++}`;
    this.tickets.push({
      id,
      reportId,
      title,
      description,
      assigneeUserId,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    });
    return { ticketId: id };
  }

  async update(
    ticketId: ID,
    status?: QualityTicketStatus,
    description?: string
  ): Promise<boolean> {
    const idx = this.tickets.findIndex((t) => t.id === ticketId);
    if (idx < 0) return false;
    if (status !== undefined) {
      this.tickets[idx].status = status;
    }
    if (description !== undefined) {
      this.tickets[idx].description = description;
    }
    this.tickets[idx].updatedAt = new Date().toISOString();
    return true;
  }

  async listByAssignee(
    assigneeUserId: ID,
    { page, pageSize }: PageRequest
  ): Promise<PageResult<QualityTicket>> {
    const filtered = this.tickets.filter(
      (t) => t.assigneeUserId === assigneeUserId
    );
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
