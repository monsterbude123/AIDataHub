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
import { ApprovalModule } from './modules/approval/approval.module';
import { DataPermissionModule } from './modules/data-permission/data-permission.module';
import { InitModule } from './modules/init/init.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,
    InitModule,
    OrganizationModule,
    UserModule,
    RoleModule,
    PermissionModule,
    MenuModule,
    DirectoryModule,
    AuthModule,
    ApprovalTemplateModule,
    ApprovalModule,
    DataPermissionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
