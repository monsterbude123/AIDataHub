// UserRole.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './User.entity';
import { RoleEntity } from './Role.entity';

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  roleId!: string;

  @ManyToOne(() => UserEntity, (u) => u.userRoles)
  user!: UserEntity;

  @ManyToOne(() => RoleEntity, (r) => r.userRoles)
  role!: RoleEntity;
}
