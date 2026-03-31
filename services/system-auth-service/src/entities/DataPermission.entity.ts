// DataPermission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import type { DataPermission } from '@ai-datahub/contract';

@Entity('data_permissions')
export class DataPermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  roleId!: string;

  @Column({ type: 'simple-json' })
  scope!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  toDTO(): DataPermission {
    return {
      id: this.id,
      roleId: this.roleId,
      scope: this.scope,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
