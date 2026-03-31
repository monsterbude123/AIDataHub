import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/User.entity';
import { UserRoleEntity } from '../../entities/UserRole.entity';
import { RoleEntity } from '../../entities/Role.entity';
import { RolePermissionEntity } from '../../entities/RolePermission.entity';
import { PermissionEntity } from '../../entities/Permission.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserRoleEntity,
      RoleEntity,
      RolePermissionEntity,
      PermissionEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, CaslAbilityFactory],
  exports: [AuthService, CaslAbilityFactory],
})
export class AuthModule {}
