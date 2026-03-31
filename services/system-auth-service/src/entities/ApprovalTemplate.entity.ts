// ApprovalTemplate.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ApprovalTemplate } from '@ai-datahub/contract';

@Entity('approval_templates')
export class ApprovalTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  businessType!: string;

  @Column()
  name!: string;

  @Column({ type: 'simple-json' })
  definition!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toDTO(): ApprovalTemplate {
    return {
      id: this.id,
      businessType: this.businessType,
      name: this.name,
      definition: this.definition,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
