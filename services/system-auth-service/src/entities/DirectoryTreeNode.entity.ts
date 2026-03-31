// DirectoryTreeNode.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { DirectoryTreeNode } from '@ai-datahub/contract';

@Entity('directory_nodes')
export class DirectoryTreeNodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  parentId?: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ type: 'simple-json', nullable: true })
  attributes?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toDTO(): DirectoryTreeNode {
    return {
      id: this.id,
      parentId: this.parentId,
      name: this.name,
      code: this.code,
      attributes: this.attributes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
