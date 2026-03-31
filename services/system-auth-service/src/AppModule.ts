import { Module } from '@nestjs/common';
import { HealthController } from './controllers/HealthController';
import { DatabaseModule } from './common/database/database.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';
import { DirectoryModule } from './modules/directory/directory.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApprovalTemplateModule } from './modules/approval-template/approval-template.module';

@Module({
  imports: [
    DatabaseModule,
    OrganizationModule,
    RoleModule,
    PermissionModule,
    MenuModule,
    DirectoryModule,
    AuthModule,
    ApprovalTemplateModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
