// MenuNode.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { MenuNode } from '@ai-datahub/contract';

@Entity('menu_nodes')
export class MenuNodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  parentId?: string;

  @Column()
  type!: 'DIRECTORY' | 'MENU' | 'BUTTON';

  @Column()
  name!: string;

  @Column({ nullable: true })
  path?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  permissionCode?: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ nullable: true })
  sort?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toDTO(): MenuNode {
    return {
      id: this.id,
      parentId: this.parentId,
      type: this.type,
      name: this.name,
      path: this.path,
      icon: this.icon,
      permissionCode: this.permissionCode,
      enabled: this.enabled,
      sort: this.sort,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
