// services/system-auth-service/src/modules/init/init.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/User.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { OrganizationEntity } from '../../entities/Organization.entity';
import { InitService } from './init.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      UserRoleEntity,
      OrganizationEntity,
    ]),
  ],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
