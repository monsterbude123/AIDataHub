// Permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import type { Permission } from '@ai-datahub/contract';
import { RolePermissionEntity } from './RolePermission.entity';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: 'URI' | 'PAGE_ELEMENT';

  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  resource!: string;

  @OneToMany(() => RolePermissionEntity, (rp) => rp.permission)
  rolePermissions!: RolePermissionEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  toDTO(): Permission {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      code: this.code,
      resource: this.resource,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
