import type {
  QualityTicket,
  ID,
  ISODateTime,
  QualityTicketStatus,
} from '@ai-datahub/contract';

export class QualityTicketEntity implements QualityTicket {
  id!: ID;
  reportId!: ID;
  title!: string;
  description?: string;
  assigneeUserId!: ID;
  status!: QualityTicketStatus;
  createdAt!: ISODateTime;
  updatedAt!: ISODateTime;
}
