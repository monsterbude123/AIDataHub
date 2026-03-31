// Organization.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { Organization } from '@ai-datahub/contract';
import { UserEntity } from './User.entity';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  code!: string;

  @Column({ type: 'varchar', nullable: true })
  parentId?: string;

  @Column({ type: 'integer', nullable: true })
  sort?: number;

  @Column({ type: 'varchar', default: 'ENABLED' })
  status!: 'ENABLED' | 'DISABLED';

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => UserEntity, (user) => user.organization)
  users!: UserEntity[];

  toDTO(): Organization {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      parentId: this.parentId,
      sort: this.sort,
      status: this.status,
    };
  }
}
