import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPermissionEntity } from '../../entities/DataPermission.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { DataPermissionController } from './data-permission.controller';
import { DataPermissionService } from './data-permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataPermissionEntity, RoleEntity])],
  controllers: [DataPermissionController],
  providers: [DataPermissionService],
  exports: [DataPermissionService],
})
export class DataPermissionModule {}
