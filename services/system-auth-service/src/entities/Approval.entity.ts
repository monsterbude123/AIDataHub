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

  @Column()
  businessType!: string;

  @Column()
  businessId!: string;

  @Column()
  title!: string;

  @Column()
  applicantId!: string;

  @Column({ nullable: true })
  currentNode?: number;

  @Column({ type: 'simple-json', nullable: true })
  payload?: Record<string, unknown>;

  @Column()
  templateId!: string;

  @Column()
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
