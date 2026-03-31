import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { DatabaseModule } from './common/database/database.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';

@Module({
  imports: [
    DatabaseModule,
    OrganizationModule,
    RoleModule,
    PermissionModule,
    MenuModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
