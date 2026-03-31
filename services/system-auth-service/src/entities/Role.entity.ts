// Role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { Role } from '@ai-datahub/contract';
import { UserRoleEntity } from './UserRole.entity';
import { RolePermissionEntity } from './RolePermission.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  enabled!: boolean;

  @OneToMany(() => UserRoleEntity, (ur) => ur.role)
  userRoles!: UserRoleEntity[];

  @OneToMany(() => RolePermissionEntity, (rp) => rp.role)
  rolePermissions!: RolePermissionEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toDTO(): Role {
    const permissionCodes =
      this.rolePermissions?.map((rp) => rp.permission.code) || [];
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      permissions: permissionCodes,
    };
  }
}
