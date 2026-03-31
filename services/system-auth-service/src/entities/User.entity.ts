// User.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import type { User, UserStatus } from '@ai-datahub/contract';
import { OrganizationEntity } from './Organization.entity';
import { UserRoleEntity } from './UserRole.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar', select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  realName?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'integer', nullable: true })
  level?: number;

  @Column({ type: 'varchar', default: 'ENABLED' })
  status!: UserStatus;

  @Column({ type: 'varchar', nullable: true })
  orgId!: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.users)
  organization!: OrganizationEntity;

  @OneToMany(() => UserRoleEntity, (ur) => ur.user)
  userRoles!: UserRoleEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toDTO(): User {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      realName: this.realName,
      phone: this.phone,
      level: this.level,
      status: this.status,
      orgId: this.orgId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
