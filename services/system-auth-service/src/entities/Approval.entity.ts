// Approval.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Approval, ApprovalStatus } from '@ai-datahub/contract';

@Entity('approvals')
export class ApprovalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  businessType!: string;

  @Column({ type: 'varchar' })
  businessId!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar' })
  applicantId!: string;

  @Column({ type: 'integer', nullable: true })
  currentNode?: number;

  @Column({ type: 'simple-json', nullable: true })
  payload?: Record<string, unknown>;

  @Column({ type: 'varchar' })
  templateId!: string;

  @Column({ type: 'varchar' })
  status!: ApprovalStatus;

  @Column({ type: 'simple-json', nullable: true })
  history?: Array<{
    approverId: string;
    action: 'APPROVE' | 'REJECT';
    comment?: string;
    createdAt: string;
  }>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toDTO(): Approval {
    return {
      id: this.id,
      businessType: this.businessType,
      businessId: this.businessId,
      title: this.title,
      applicantId: this.applicantId,
      currentNode: this.currentNode,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
