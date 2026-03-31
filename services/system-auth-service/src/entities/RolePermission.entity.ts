// RolePermission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RoleEntity } from './Role.entity';
import { PermissionEntity } from './Permission.entity';

@Entity('role_permissions')
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roleId!: string;

  @Column()
  permissionId!: string;

  @ManyToOne(() => RoleEntity, (r) => r.rolePermissions)
  role!: RoleEntity;

  @ManyToOne(() => PermissionEntity, (p) => p.rolePermissions)
  permission!: PermissionEntity;
}
