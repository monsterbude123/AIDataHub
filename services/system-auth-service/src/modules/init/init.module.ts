// services/system-auth-service/src/modules/init/init.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { InitService } from './init.service';

@Module({
  imports: [DatabaseModule],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
